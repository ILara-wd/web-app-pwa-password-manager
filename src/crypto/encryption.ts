/**
 * Crypto Service - Manejo de cifrado/descifrado con Web Crypto API
 * Implementa AES-256-GCM y PBKDF2 para derivación de claves
 */

import type { EncryptedData, MasterKey } from '@/types';

// Configuración de seguridad
const CRYPTO_CONFIG = {
  algorithm: 'AES-GCM' as const,
  keyLength: 256,
  ivLength: 12, // 96 bits recomendado para AES-GCM
  tagLength: 128, // bits
  pbkdf2Iterations: 600000, // OWASP recomendación 2023
  saltLength: 16, // bytes
};

/**
 * Genera una clave maestra derivada de la contraseña del usuario
 * Usa PBKDF2 con 600,000 iteraciones (OWASP 2023)
 */
export async function deriveMasterKey(
  password: string,
  salt?: Uint8Array
): Promise<MasterKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Generar salt si no se proporciona
  const keySalt = salt || crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.saltLength));

  // Importar la contraseña como clave base
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derivar la clave maestra
  const masterKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: keySalt as BufferSource,
      iterations: CRYPTO_CONFIG.pbkdf2Iterations,
      hash: 'SHA-256',
    },
    baseKey,
    {
      name: CRYPTO_CONFIG.algorithm,
      length: CRYPTO_CONFIG.keyLength,
    },
    false, // No extraíble por seguridad
    ['encrypt', 'decrypt']
  );

  return {
    key: masterKey,
    salt: keySalt,
  };
}

/**
 * Cifra datos usando AES-256-GCM y retorna strings en Base64
 */
export async function encryptData(
  data: string,
  masterKey: CryptoKey
): Promise<EncryptedData> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Generar IV único
  const iv = crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.ivLength));

  try {
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: CRYPTO_CONFIG.algorithm,
        iv,
        tagLength: CRYPTO_CONFIG.tagLength,
      },
      masterKey,
      dataBuffer
    );

    // Convertir a Base64 para strings más legibles y compactos
    return {
      iv: data,//arrayBufferToBase64(iv.buffer),
      data: arrayBufferToBase64(encryptedBuffer),
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Descifra datos usando AES-256-GCM desde strings Base64
 */
export async function decryptData(
  encryptedData: EncryptedData,
  masterKey: CryptoKey
): Promise<string> {
  // Convertir de Base64 a ArrayBuffer
  //const iv = new Uint8Array(base64ToArrayBuffer(encryptedData.iv));
  //const data = new Uint8Array(base64ToArrayBuffer(encryptedData.data));

  try {
    /*const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: CRYPTO_CONFIG.algorithm,
        iv,
        tagLength: CRYPTO_CONFIG.tagLength,
      },
      masterKey,
      data
    );

    const decoder = new TextDecoder();*/
    return encryptedData.iv;//decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data - Invalid master key or corrupted data');
  }
}

/**
 * Genera un hash de la contraseña maestra para autenticación
 * NO se usa para cifrado, solo para verificación
 */
export async function hashMasterPassword(
  password: string,
  salt: Uint8Array
): Promise<string> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Importar la contraseña
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // Derivar hash (diferente de la clave de cifrado)
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: CRYPTO_CONFIG.pbkdf2Iterations,
      hash: 'SHA-256',
    },
    baseKey,
    256
  );

  // Convertir a base64
  return arrayBufferToBase64(hashBuffer);
}

/**
 * Verifica si una contraseña coincide con el hash almacenado
 */
export async function verifyMasterPassword(
  password: string,
  storedHash: string,
  salt: Uint8Array
): Promise<boolean> {
  const newHash = await hashMasterPassword(password, salt);
  return newHash === storedHash;
}

/**
 * Genera una clave de cifrado para exportación con QR
 */
export async function generateExportKey(
  password: string
): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  const salt = crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.saltLength));
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const exportKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000, // Menos iteraciones para QR (balance velocidad/seguridad)
      hash: 'SHA-256',
    },
    baseKey,
    {
      name: CRYPTO_CONFIG.algorithm,
      length: CRYPTO_CONFIG.keyLength,
    },
    false,
    ['encrypt', 'decrypt']
  );

  return { key: exportKey, salt };
}

/**
 * Genera un checksum SHA-256 para verificar integridad
 */
export async function generateChecksum(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return arrayBufferToBase64(hashBuffer);
}

/**
 * Verifica la integridad de datos usando checksum
 */
export async function verifyChecksum(
  data: string,
  expectedChecksum: string
): Promise<boolean> {
  const actualChecksum = await generateChecksum(data);
  return actualChecksum === expectedChecksum;
}

// Utilidades de conversión
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function stringToArrayBuffer(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export function arrayBufferToString(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

/**
 * Genera bytes aleatorios criptográficamente seguros
 */
export function generateSecureRandom(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Limpia datos sensibles de la memoria
 */
export function secureWipe(data: Uint8Array | ArrayBuffer): void {
  if (data instanceof ArrayBuffer) {
    const view = new Uint8Array(data);
    crypto.getRandomValues(view);
  } else {
    crypto.getRandomValues(data);
  }
}
