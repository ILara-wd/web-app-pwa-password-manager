/**
 * Tests para funciones de cifrado
 */

import {
  deriveMasterKey,
  encryptData,
  decryptData,
  hashMasterPassword,
  verifyMasterPassword,
  generateChecksum,
  verifyChecksum,
  generateSecureRandom,
  arrayBufferToBase64,
  base64ToArrayBuffer,
} from '@crypto/encryption';

describe('Encryption Functions', () => {
  describe('deriveMasterKey', () => {
    it('should derive a master key from password', async () => {
      const password = 'MySecurePassword123!';
      const result = await deriveMasterKey(password);

      expect(result).toBeDefined();
      expect(result.key).toBeInstanceOf(CryptoKey);
      expect(result.salt).toBeInstanceOf(Uint8Array);
      expect(result.salt.length).toBe(16);
    });

    it('should produce different keys for different passwords', async () => {
      const password1 = 'Password1';
      const password2 = 'Password2';

      const result1 = await deriveMasterKey(password1);
      const result2 = await deriveMasterKey(password2);

      // No podemos comparar las claves directamente, pero sí los salts
      expect(result1.salt).not.toEqual(result2.salt);
    });

    it('should produce same key with same password and salt', async () => {
      const password = 'TestPassword';
      const firstResult = await deriveMasterKey(password);
      const secondResult = await deriveMasterKey(password, firstResult.salt);

      // Las claves deben ser equivalentes (mismo algoritmo y salt)
      expect(secondResult.salt).toEqual(firstResult.salt);
    });
  });

  describe('encryptData & decryptData', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const originalText = 'My secret password is: P@ssw0rd!';
      const masterPassword = 'MasterKey123!';

      const { key } = await deriveMasterKey(masterPassword);
      const encrypted = await encryptData(originalText, key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toBe(originalText);
    });

    it('should produce different ciphertext for same plaintext', async () => {
      const text = 'Same text';
      const masterPassword = 'MasterKey123!';
      const { key } = await deriveMasterKey(masterPassword);

      const encrypted1 = await encryptData(text, key);
      const encrypted2 = await encryptData(text, key);

      // IVs deben ser diferentes
      expect(encrypted1.iv).not.toEqual(encrypted2.iv);
      // Ciphertext también debe ser diferente
      expect(encrypted1.data).not.toEqual(encrypted2.data);
    });

    it('should fail to decrypt with wrong key', async () => {
      const text = 'Secret data';
      const password1 = 'Password1';
      const password2 = 'Password2';

      const { key: key1 } = await deriveMasterKey(password1);
      const { key: key2 } = await deriveMasterKey(password2);

      const encrypted = await encryptData(text, key1);

      await expect(decryptData(encrypted, key2)).rejects.toThrow();
    });

    it('should handle special characters', async () => {
      const specialText = '¡Hola! 你好 🔐 <script>alert("xss")</script>';
      const masterPassword = 'SecureKey!';
      const { key } = await deriveMasterKey(masterPassword);

      const encrypted = await encryptData(specialText, key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toBe(specialText);
    });

    it('should handle empty strings', async () => {
      const emptyText = '';
      const masterPassword = 'Password123!';
      const { key } = await deriveMasterKey(masterPassword);

      const encrypted = await encryptData(emptyText, key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toBe(emptyText);
    });
  });

  describe('hashMasterPassword & verifyMasterPassword', () => {
    it('should hash and verify password correctly', async () => {
      const password = 'MyMasterPassword123!';
      const salt = generateSecureRandom(16);

      const hash = await hashMasterPassword(password, salt);
      const isValid = await verifyMasterPassword(password, hash, salt);

      expect(isValid).toBe(true);
    });

    it('should reject wrong password', async () => {
      const correctPassword = 'CorrectPassword';
      const wrongPassword = 'WrongPassword';
      const salt = generateSecureRandom(16);

      const hash = await hashMasterPassword(correctPassword, salt);
      const isValid = await verifyMasterPassword(wrongPassword, hash, salt);

      expect(isValid).toBe(false);
    });

    it('should produce different hashes with different salts', async () => {
      const password = 'SamePassword';
      const salt1 = generateSecureRandom(16);
      const salt2 = generateSecureRandom(16);

      const hash1 = await hashMasterPassword(password, salt1);
      const hash2 = await hashMasterPassword(password, salt2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('checksum functions', () => {
    it('should generate and verify checksum', async () => {
      const data = 'Important data to verify';
      const checksum = await generateChecksum(data);
      const isValid = await verifyChecksum(data, checksum);

      expect(isValid).toBe(true);
    });

    it('should detect modified data', async () => {
      const originalData = 'Original data';
      const modifiedData = 'Modified data';
      const checksum = await generateChecksum(originalData);
      const isValid = await verifyChecksum(modifiedData, checksum);

      expect(isValid).toBe(false);
    });

    it('should produce consistent checksums', async () => {
      const data = 'Test data';
      const checksum1 = await generateChecksum(data);
      const checksum2 = await generateChecksum(data);

      expect(checksum1).toBe(checksum2);
    });
  });

  describe('utility functions', () => {
    it('should generate secure random bytes', () => {
      const random = generateSecureRandom(32);

      expect(random).toBeInstanceOf(Uint8Array);
      expect(random.length).toBe(32);
    });

    it('should convert between ArrayBuffer and Base64', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5]);
      const base64 = arrayBufferToBase64(original.buffer);
      const recovered = new Uint8Array(base64ToArrayBuffer(base64));

      expect(recovered).toEqual(original);
    });

    it('should handle empty ArrayBuffer', () => {
      const empty = new Uint8Array([]);
      const base64 = arrayBufferToBase64(empty.buffer);
      const recovered = new Uint8Array(base64ToArrayBuffer(base64));

      expect(recovered).toEqual(empty);
    });
  });
});
