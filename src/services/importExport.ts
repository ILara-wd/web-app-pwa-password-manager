/**
 * Import/Export Service
 * Manejo de importación, exportación y generación de QR cifrados
 */

import type { Password, ExportData, QRExportData } from '@/types';
import {
  encryptData,
  decryptData,
  generateExportKey,
  generateChecksum,
  verifyChecksum,
  arrayBufferToBase64,
  base64ToArrayBuffer,
} from '@crypto/encryption';
import { getAllPasswords, importDatabase } from './database';
import { getMasterKey } from './auth';
import QRCode from 'qrcode';

/**
 * Exporta todas las contraseñas a JSON cifrado
 */
export async function exportToJSON(
  includeEncrypted: boolean = true
): Promise<string> {
  const passwords = await getAllPasswords();

  if (!includeEncrypted) {
    // Descifrar contraseñas para exportación plana
    const masterKey = getMasterKey();
    const decryptedPasswords = await Promise.all(
      passwords.map(async (p) => ({
        ...p,
        encryptedPassword: await decryptData(
          JSON.parse(p.encryptedPassword),
          masterKey
        ),
      }))
    );

    const exportData: ExportData = {
      version: '1.0',
      exportedAt: new Date(),
      passwords: decryptedPasswords,
      encrypted: false,
      checksum: '',
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    exportData.checksum = await generateChecksum(jsonString);

    return JSON.stringify(exportData, null, 2);
  }

  // Exportar con cifrado
  const exportData: ExportData = {
    version: '1.0',
    exportedAt: new Date(),
    passwords,
    encrypted: true,
    checksum: '',
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  exportData.checksum = await generateChecksum(jsonString);

  return JSON.stringify(exportData, null, 2);
}

/**
 * Exporta contraseñas a CSV
 */
export async function exportToCSV(): Promise<string> {
  const passwords = await getAllPasswords();
  const masterKey = getMasterKey();

  // Descifrar contraseñas
  const decryptedPasswords = await Promise.all(
    passwords.map(async (p) => ({
      ...p,
      password: await decryptData(JSON.parse(p.encryptedPassword), masterKey),
    }))
  );

  // Crear CSV
  const headers = ['Title', 'Username', 'Password', 'URL', 'Notes', 'Tags'];
  const rows = decryptedPasswords.map((p) => [
    escapeCSV(p.title),
    escapeCSV(p.username),
    escapeCSV(p.password),
    escapeCSV(p.url || ''),
    escapeCSV(p.notes || ''),
    escapeCSV(p.tags.join('; ')),
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

  return csv;
}

/**
 * Importa contraseñas desde JSON
 */
export async function importFromJSON(jsonString: string): Promise<number> {
  try {
    const data: ExportData = JSON.parse(jsonString);

    // Verificar versión
    if (data.version !== '1.0') {
      throw new Error('Unsupported export version');
    }

    // Verificar checksum
    const jsonWithoutChecksum = JSON.stringify(
      { ...data, checksum: '' },
      null,
      2
    );
    const isValid = await verifyChecksum(jsonWithoutChecksum, data.checksum);

    if (!isValid) {
      throw new Error('Invalid checksum - Data may be corrupted');
    }

    // Si las contraseñas están descifradas, cifrarlas
    if (!data.encrypted) {
      const masterKey = getMasterKey();
      const encryptedPasswords = await Promise.all(
        data.passwords.map(async (p) => ({
          ...p,
          encryptedPassword: JSON.stringify(
            await encryptData(p.encryptedPassword, masterKey)
          ),
        }))
      );

      await importDatabase({ passwords: encryptedPasswords });
      return encryptedPasswords.length;
    }

    // Importar contraseñas ya cifradas
    await importDatabase({ passwords: data.passwords });
    return data.passwords.length;
  } catch (error) {
    console.error('Import error:', error);
    throw new Error('Failed to import data: ' + (error as Error).message);
  }
}

/**
 * Importa contraseñas desde CSV
 */
export async function importFromCSV(csvString: string): Promise<number> {
  const masterKey = getMasterKey();
  const lines = csvString.split('\n');

  // Saltar la línea de encabezados
  const dataLines = lines.slice(1).filter((line) => line.trim() !== '');

  const passwords: Password[] = [];

  for (const line of dataLines) {
    const values = parseCSVLine(line);

    if (values.length < 3) {
      continue; // Línea inválida
    }

    const [title, username, password, url, notes, tags] = values;

    // Cifrar la contraseña
    const encryptedPassword = JSON.stringify(
      await encryptData(password, masterKey)
    );

    const passwordEntry: Password = {
      id: crypto.randomUUID(),
      title: title || 'Imported Password',
      username: username || '',
      encryptedPassword,
      url: url || undefined,
      notes: notes || undefined,
      tags: tags ? tags.split(';').map((t) => t.trim()) : [],
      favorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    passwords.push(passwordEntry);
  }

  await importDatabase({ passwords });
  return passwords.length;
}

/**
 * Genera un código QR cifrado con las contraseñas
 */
export async function generateQRCode(
  passwords: Password[],
  exportPassword: string
): Promise<string> {
  // Generar clave de exportación
  const { key, salt } = await generateExportKey(exportPassword);

  // Preparar datos para exportar
  const exportData = {
    passwords: passwords.map((p) => ({
      id: p.id,
      title: p.title,
      username: p.username,
      encryptedPassword: p.encryptedPassword,
      url: p.url,
      tags: p.tags,
    })),
  };

  const jsonString = JSON.stringify(exportData);

  // Cifrar datos
  const encrypted = await encryptData(jsonString, key);

  // Preparar payload para QR
  const qrData: QRExportData = {
    encrypted: arrayBufferToBase64(new Uint8Array(encrypted.data).buffer as ArrayBuffer),
    iv: arrayBufferToBase64(new Uint8Array(encrypted.iv).buffer as ArrayBuffer),
    salt: arrayBufferToBase64(salt.buffer as ArrayBuffer),
    timestamp: Date.now(),
  };

  const qrPayload = JSON.stringify(qrData);

  // Generar QR code
  try {
    const qrCodeDataURL = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 512,
      margin: 2,
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('QR generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Decodifica y descifra datos desde un QR code
 */
export async function decodeQRCode(
  qrData: string,
  exportPassword: string
): Promise<Password[]> {
  try {
    const data: QRExportData = JSON.parse(qrData);

    // Verificar timestamp (rechazar QR códigos muy antiguos)
    const daysSinceExport = (Date.now() - data.timestamp) / (1000 * 60 * 60 * 24);
    if (daysSinceExport > 30) {
      throw new Error('QR code has expired (older than 30 days)');
    }

    // Reconstruir datos cifrados
    const iv = Array.from(new Uint8Array(base64ToArrayBuffer(data.iv)));
    const encryptedData = Array.from(
      new Uint8Array(base64ToArrayBuffer(data.encrypted))
    );

    // Derivar clave de exportación
    const exportKey = await generateExportKey(exportPassword);

    // Descifrar datos
    const decryptedJSON = await decryptData({ iv, data: encryptedData }, exportKey.key);

    const exportData = JSON.parse(decryptedJSON);

    return exportData.passwords;
  } catch (error) {
    console.error('QR decode error:', error);
    throw new Error('Failed to decode QR code: ' + (error as Error).message);
  }
}

/**
 * Genera un backup completo cifrado
 */
export async function createBackup(): Promise<Blob> {
  const jsonData = await exportToJSON(true);
  const blob = new Blob([jsonData], { type: 'application/json' });
  return blob;
}

/**
 * Descarga un archivo
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta y descarga en JSON
 */
export async function exportAndDownloadJSON(): Promise<void> {
  const jsonString = await exportToJSON(false);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const filename = `passwords-export-${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(blob, filename);
}

/**
 * Exporta y descarga en CSV
 */
export async function exportAndDownloadCSV(): Promise<void> {
  const csvString = await exportToCSV();
  const blob = new Blob([csvString], { type: 'text/csv' });
  const filename = `passwords-export-${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(blob, filename);
}

/**
 * Lee un archivo como texto
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

// ========== Utilidades ==========

/**
 * Escapa caracteres especiales en CSV
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Parsea una línea CSV considerando comillas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Saltar la siguiente comilla
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);

  return result;
}

/**
 * Valida formato de importación
 */
export function validateImportFormat(content: string): 'json' | 'csv' | 'unknown' {
  try {
    const parsed = JSON.parse(content);
    if (parsed.version && parsed.passwords) {
      return 'json';
    }
  } catch {
    // No es JSON válido
  }

  // Verificar si es CSV
  const lines = content.split('\n');
  if (lines.length > 1 && lines[0].includes(',')) {
    return 'csv';
  }

  return 'unknown';
}
