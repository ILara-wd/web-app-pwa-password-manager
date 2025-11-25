/**
 * Password Generator Service
 * Genera contraseñas seguras con opciones personalizables
 */

import type { PasswordGeneratorOptions, PasswordStrength } from '@/types';
import zxcvbn from 'zxcvbn';

// Conjuntos de caracteres
const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  similar: 'il1Lo0O', // Caracteres similares a excluir
  ambiguous: '{}[]()/\\\'"`~,;:.<>', // Caracteres ambiguos
};

// Opciones por defecto
export const DEFAULT_OPTIONS: PasswordGeneratorOptions = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeSimilar: false,
  excludeAmbiguous: false,
};

/**
 * Genera una contraseña segura
 */
export function generatePassword(
  options: Partial<PasswordGeneratorOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Validaciones
  if (opts.length < 4) {
    throw new Error('Password length must be at least 4 characters');
  }

  if (opts.length > 128) {
    throw new Error('Password length must not exceed 128 characters');
  }

  if (
    !opts.includeUppercase &&
    !opts.includeLowercase &&
    !opts.includeNumbers &&
    !opts.includeSymbols
  ) {
    throw new Error('At least one character type must be selected');
  }

  // Construir conjunto de caracteres
  let charset = '';
  const requiredChars: string[] = [];

  if (opts.includeUppercase) {
    charset += CHAR_SETS.uppercase;
    requiredChars.push(getRandomChar(CHAR_SETS.uppercase));
  }

  if (opts.includeLowercase) {
    charset += CHAR_SETS.lowercase;
    requiredChars.push(getRandomChar(CHAR_SETS.lowercase));
  }

  if (opts.includeNumbers) {
    charset += CHAR_SETS.numbers;
    requiredChars.push(getRandomChar(CHAR_SETS.numbers));
  }

  if (opts.includeSymbols) {
    const symbols = opts.customSymbols || CHAR_SETS.symbols;
    charset += symbols;
    requiredChars.push(getRandomChar(symbols));
  }

  // Filtrar caracteres similares/ambiguos
  if (opts.excludeSimilar) {
    charset = charset
      .split('')
      .filter((char) => !CHAR_SETS.similar.includes(char))
      .join('');
  }

  if (opts.excludeAmbiguous) {
    charset = charset
      .split('')
      .filter((char) => !CHAR_SETS.ambiguous.includes(char))
      .join('');
  }

  // Generar contraseña
  let password = '';
  const remainingLength = opts.length - requiredChars.length;

  // Agregar caracteres aleatorios
  for (let i = 0; i < remainingLength; i++) {
    password += getRandomChar(charset);
  }

  // Agregar caracteres requeridos
  password += requiredChars.join('');

  // Mezclar caracteres usando Fisher-Yates shuffle
  return shuffleString(password);
}

/**
 * Genera una passphrase (frase de contraseña) usando palabras
 */
export function generatePassphrase(
  wordCount: number = 5,
  separator: string = '-',
  capitalize: boolean = true
): string {
  // Lista de palabras comunes en español e inglés
  const words = [
    // Español
    'casa', 'perro', 'gato', 'sol', 'luna', 'mar', 'rio', 'monte', 'flor', 'arbol',
    'libro', 'mesa', 'silla', 'puerta', 'ventana', 'cielo', 'tierra', 'fuego', 'agua',
    'viento', 'nube', 'estrella', 'camino', 'jardin', 'bosque', 'pajaro', 'pez',
    // Inglés
    'house', 'dog', 'cat', 'sun', 'moon', 'sea', 'river', 'mountain', 'flower', 'tree',
    'book', 'table', 'chair', 'door', 'window', 'sky', 'earth', 'fire', 'water',
    'wind', 'cloud', 'star', 'path', 'garden', 'forest', 'bird', 'fish',
  ];

  const selectedWords: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    let word = words[getRandomInt(words.length)];
    
    if (capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    
    selectedWords.push(word);
  }

  // Agregar un número al final para mayor seguridad
  const randomNum = getRandomInt(9999);
  selectedWords.push(randomNum.toString());

  return selectedWords.join(separator);
}

/**
 * Analiza la fortaleza de una contraseña
 */
export function analyzePasswordStrength(password: string): PasswordStrength {
  const result = zxcvbn(password);

  // Convertir tiempo de crackeo a formato legible
  const crackTime = formatCrackTime(String(result.crack_times_display.offline_slow_hashing_1e4_per_second));

  return {
    score: result.score as 0 | 1 | 2 | 3 | 4,
    feedback: {
      warning: result.feedback.warning || '',
      suggestions: result.feedback.suggestions || [],
    },
    crackTime,
  };
}

/**
 * Genera un PIN numérico
 */
export function generatePIN(length: number = 6): string {
  if (length < 4 || length > 12) {
    throw new Error('PIN length must be between 4 and 12 digits');
  }

  let pin = '';
  for (let i = 0; i < length; i++) {
    pin += getRandomInt(10).toString();
  }

  return pin;
}

/**
 * Genera una clave hexadecimal (para APIs, tokens, etc.)
 */
export function generateHexKey(length: number = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ========== Utilidades ==========

/**
 * Obtiene un carácter aleatorio criptográficamente seguro
 */
function getRandomChar(charset: string): string {
  const randomValues = new Uint32Array(1);
  crypto.getRandomValues(randomValues);
  const randomIndex = randomValues[0] % charset.length;
  return charset[randomIndex];
}

/**
 * Obtiene un entero aleatorio criptográficamente seguro
 */
function getRandomInt(max: number): number {
  const randomValues = new Uint32Array(1);
  crypto.getRandomValues(randomValues);
  return randomValues[0] % max;
}

/**
 * Mezcla una cadena usando Fisher-Yates shuffle
 */
function shuffleString(str: string): string {
  const arr = str.split('');
  
  for (let i = arr.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  
  return arr.join('');
}

/**
 * Formatea el tiempo de crackeo a un texto legible
 */
function formatCrackTime(time: string): string {
  const translations: { [key: string]: string } = {
    'less than a second': 'menos de un segundo',
    'seconds': 'segundos',
    'minutes': 'minutos',
    'hours': 'horas',
    'days': 'días',
    'months': 'meses',
    'years': 'años',
    'centuries': 'siglos',
  };

  let translated = time;
  Object.keys(translations).forEach(key => {
    translated = translated.replace(key, translations[key]);
  });

  return translated;
}

/**
 * Calcula la entropía de una contraseña
 */
export function calculateEntropy(password: string): number {
  const charsetSize = getCharsetSize(password);
  return Math.log2(Math.pow(charsetSize, password.length));
}

/**
 * Determina el tamaño del conjunto de caracteres usado
 */
function getCharsetSize(password: string): number {
  let size = 0;
  
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/[0-9]/.test(password)) size += 10;
  if (/[^a-zA-Z0-9]/.test(password)) size += 32; // Símbolos aproximados
  
  return size;
}

/**
 * Verifica si una contraseña es común/débil
 */
export function isCommonPassword(password: string): boolean {
  const commonPasswords = [
    '123456', 'password', '12345678', 'qwerty', '123456789', '12345', '1234',
    '111111', '1234567', 'dragon', '123123', 'baseball', 'iloveyou', 'trustno1',
    '1234567890', 'sunshine', 'master', 'welcome', 'shadow', 'ashley', 'football',
    'jesus', 'michael', 'ninja', 'mustang', 'password1', 'admin', 'letmein',
  ];
  
  return commonPasswords.includes(password.toLowerCase());
}
