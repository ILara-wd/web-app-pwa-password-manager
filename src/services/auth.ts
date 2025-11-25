/**
 * Authentication Service
 * Manejo de autenticación, registro y sesiones
 */

import type { User, UserSettings, TwoFactorAuth } from '@/types';
import {
  deriveMasterKey,
  hashMasterPassword,
  verifyMasterPassword,
  generateSecureRandom,
  arrayBufferToBase64,
} from '@crypto/encryption';
import { getCurrentUser, saveUser, setSetting, getSetting } from './database';

// Estado de sesión en memoria
let currentSession: {
  userId: string;
  masterKey: CryptoKey;
  expiresAt: Date;
} | null = null;

/**
 * Registra un nuevo usuario
 */
export async function registerUser(
  email: string,
  name: string,
  masterPassword: string
): Promise<User> {
  // Verificar si ya existe un usuario
  const existingUser = await getCurrentUser();
  if (existingUser) {
    throw new Error('A user is already registered. Only one user per device is supported.');
  }

  // Validar contraseña maestra
  if (masterPassword.length < 12) {
    throw new Error('Master password must be at least 12 characters long');
  }

  // Generar salt único
  const salt = generateSecureRandom(16);

  // Hash de la contraseña maestra para autenticación
  const masterPasswordHash = await hashMasterPassword(masterPassword, salt);

  // Configuración por defecto
  const defaultSettings: UserSettings = {
    language: 'es',
    theme: 'auto',
    autoLockTimeout: 15,
    clipboardClearTimeout: 30,
    showPasswordStrength: true,
    requireMasterPasswordOnCopy: true,
  };

  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    masterPasswordHash,
    salt: arrayBufferToBase64(salt.buffer as ArrayBuffer),
    createdAt: new Date(),
    settings: defaultSettings,
    twoFactorEnabled: false,
    biometricEnabled: false,
  };

  await saveUser(user);

  return user;
}

/**
 * Inicia sesión del usuario
 */
export async function login(
  email: string,
  masterPassword: string,
  totpCode?: string
): Promise<{ success: boolean; requiresTwoFactor: boolean }> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('No user found. Please register first.');
  }

  if (user.email !== email) {
    throw new Error('Invalid credentials');
  }

  // Verificar contraseña maestra
  const salt = new Uint8Array(
    atob(user.salt)
      .split('')
      .map((c) => c.charCodeAt(0))
  );

  const isValid = await verifyMasterPassword(
    masterPassword,
    user.masterPasswordHash,
    salt
  );

  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  // Verificar 2FA si está habilitado
  if (user.twoFactorEnabled) {
    if (!totpCode) {
      return { success: false, requiresTwoFactor: true };
    }

    const isValidTOTP = await verifyTOTP(totpCode, user.twoFactorSecret!);
    if (!isValidTOTP) {
      throw new Error('Invalid 2FA code');
    }
  }

  // Derivar clave maestra para la sesión
  const { key: masterKey } = await deriveMasterKey(masterPassword, salt);

  // Crear sesión (expira en 12 horas)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 12);

  currentSession = {
    userId: user.id,
    masterKey,
    expiresAt,
  };

  // Guardar último login
  await setSetting('lastLoginAt', new Date());

  return { success: true, requiresTwoFactor: false };
}

/**
 * Cierra la sesión actual
 */
export async function logout(): Promise<void> {
  currentSession = null;
  await setSetting('lastLogoutAt', new Date());
}

/**
 * Obtiene la sesión actual
 */
export function getCurrentSession(): typeof currentSession {
  if (!currentSession) {
    return null;
  }

  // Verificar si la sesión ha expirado
  if (new Date() > currentSession.expiresAt) {
    currentSession = null;
    return null;
  }

  return currentSession;
}

/**
 * Obtiene la clave maestra de la sesión
 */
export function getMasterKey(): CryptoKey {
  const session = getCurrentSession();
  if (!session) {
    throw new Error('No active session. Please login first.');
  }
  return session.masterKey;
}

/**
 * Verifica si hay una sesión activa
 */
export function isAuthenticated(): boolean {
  return getCurrentSession() !== null;
}

/**
 * Extiende la sesión actual
 */
export function extendSession(hours: number = 12): void {
  const session = getCurrentSession();
  if (session) {
    const newExpiry = new Date();
    newExpiry.setHours(newExpiry.getHours() + hours);
    session.expiresAt = newExpiry;
  }
}

// ========== WebAuthn (Biometric Authentication) ==========

/**
 * Registra una credencial WebAuthn (huella digital, FaceID, etc.)
 */
export async function registerBiometric(): Promise<boolean> {
  if (!window.PublicKeyCredential) {
    throw new Error('WebAuthn is not supported in this browser');
  }

  const user = await getCurrentUser();
  if (!user) {
    throw new Error('No user found');
  }

  try {
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge: generateSecureRandom(32) as BufferSource,
      rp: {
        name: 'Password Manager PWA',
        id: window.location.hostname,
      },
      user: {
        id: new TextEncoder().encode(user.id),
        name: user.email,
        displayName: user.name,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Preferir autenticadores integrados
        userVerification: 'required',
      },
      timeout: 60000,
      attestation: 'direct',
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    });

    if (credential) {
      // Guardar credencial en configuración
      await setSetting('biometricCredential', {
        id: credential.id,
        type: credential.type,
      });

      // Actualizar usuario
      user.biometricEnabled = true;
      await saveUser(user);

      return true;
    }

    return false;
  } catch (error) {
    console.error('WebAuthn registration error:', error);
    throw new Error('Failed to register biometric authentication');
  }
}

/**
 * Autentica usando biometría
 */
export async function authenticateWithBiometric(): Promise<boolean> {
  if (!window.PublicKeyCredential) {
    throw new Error('WebAuthn is not supported in this browser');
  }

  const credential = await getSetting<{ id: string; type: string }>(
    'biometricCredential'
  );

  if (!credential) {
    throw new Error('No biometric credential registered');
  }

  try {
    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge: generateSecureRandom(32) as BufferSource,
      allowCredentials: [
        {
          id: Uint8Array.from(atob(credential.id), (c) => c.charCodeAt(0)),
          type: 'public-key' as PublicKeyCredentialType,
        },
      ],
      timeout: 60000,
      userVerification: 'required',
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });

    return assertion !== null;
  } catch (error) {
    console.error('WebAuthn authentication error:', error);
    return false;
  }
}

// ========== Two-Factor Authentication (TOTP) ==========

/**
 * Genera un secreto para 2FA TOTP
 */
export async function setupTwoFactor(): Promise<TwoFactorAuth> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('No user found');
  }

  // Generar secreto TOTP (base32)
  const secret = generateTOTPSecret();

  // Generar QR code URL
  const issuer = 'PasswordManager';
  const otpauthUrl = `otpauth://totp/${issuer}:${user.email}?secret=${secret}&issuer=${issuer}`;

  // Generar códigos de respaldo (8 códigos de 8 dígitos)
  const backupCodes = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('')
  );

  return {
    secret,
    qrCode: otpauthUrl,
    backupCodes,
  };
}

/**
 * Habilita 2FA para el usuario
 */
export async function enableTwoFactor(
  secret: string,
  verificationCode: string,
  backupCodes: string[]
): Promise<boolean> {
  // Verificar el código antes de habilitar
  const isValid = await verifyTOTP(verificationCode, secret);
  if (!isValid) {
    throw new Error('Invalid verification code');
  }

  const user = await getCurrentUser();
  if (!user) {
    throw new Error('No user found');
  }

  // Hash de los códigos de respaldo
  const hashedBackupCodes = await Promise.all(
    backupCodes.map((code) => hashBackupCode(code))
  );

  user.twoFactorEnabled = true;
  user.twoFactorSecret = secret;
  user.recoveryCodes = hashedBackupCodes;

  await saveUser(user);

  return true;
}

/**
 * Verifica un código TOTP
 */
async function verifyTOTP(code: string, secret: string): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const timeStep = 30; // TOTP usa ventanas de 30 segundos

  // Verificar código actual y ±1 ventana (para compensar desfase de reloj)
  for (let i = -1; i <= 1; i++) {
    const time = now + i * timeStep;
    const expectedCode = await generateTOTPCode(secret, time);
    if (code === expectedCode) {
      return true;
    }
  }

  return false;
}

/**
 * Genera un código TOTP
 */
async function generateTOTPCode(secret: string, time: number): Promise<string> {
  const timeStep = Math.floor(time / 30);
  const timeBuffer = new ArrayBuffer(8);
  const timeView = new DataView(timeBuffer);
  timeView.setUint32(4, timeStep, false);

  // Decodificar secreto base32
  const secretBuffer = base32Decode(secret);

  // HMAC-SHA1
  const key = await crypto.subtle.importKey(
    'raw',
    secretBuffer as BufferSource,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, timeBuffer);
  const signatureArray = new Uint8Array(signature);

  // Algoritmo HOTP
  const offset = signatureArray[19] & 0xf;
  const code =
    ((signatureArray[offset] & 0x7f) << 24) |
    ((signatureArray[offset + 1] & 0xff) << 16) |
    ((signatureArray[offset + 2] & 0xff) << 8) |
    (signatureArray[offset + 3] & 0xff);

  return (code % 1000000).toString().padStart(6, '0');
}

/**
 * Genera un secreto TOTP en base32
 */
function generateTOTPSecret(): string {
  const buffer = generateSecureRandom(20);
  return base32Encode(buffer);
}

/**
 * Codifica en base32
 */
function base32Encode(buffer: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decodifica base32
 */
function base32Decode(input: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const output: number[] = [];
  let bits = 0;
  let value = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input[i].toUpperCase();
    const index = alphabet.indexOf(char);

    if (index === -1) continue;

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(output);
}

/**
 * Hash de código de respaldo
 */
async function hashBackupCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return arrayBufferToBase64(hashBuffer);
}

/**
 * Verifica un código de respaldo
 */
export async function verifyBackupCode(code: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || !user.recoveryCodes) {
    return false;
  }

  const hashedCode = await hashBackupCode(code);
  const index = user.recoveryCodes.indexOf(hashedCode);

  if (index !== -1) {
    // Eliminar código usado
    user.recoveryCodes.splice(index, 1);
    await saveUser(user);
    return true;
  }

  return false;
}
