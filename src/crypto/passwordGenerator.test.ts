/**
 * Tests para el generador de contraseñas
 */

import {
  generatePassword,
  generatePassphrase,
  generatePIN,
  generateHexKey,
  analyzePasswordStrength,
  calculateEntropy,
  isCommonPassword,
  DEFAULT_OPTIONS,
} from '@crypto/passwordGenerator';

describe('Password Generator', () => {
  describe('generatePassword', () => {
    it('should generate password with default options', () => {
      const password = generatePassword();
      expect(password).toBeDefined();
      expect(password.length).toBe(DEFAULT_OPTIONS.length);
    });

    it('should generate password with specified length', () => {
      const password = generatePassword({ length: 24 });
      expect(password.length).toBe(24);
    });

    it('should include uppercase letters when enabled', () => {
      const password = generatePassword({
        length: 20,
        includeUppercase: true,
        includeLowercase: false,
        includeNumbers: false,
        includeSymbols: false,
      });
      expect(password).toMatch(/^[A-Z]+$/);
    });

    it('should include lowercase letters when enabled', () => {
      const password = generatePassword({
        length: 20,
        includeUppercase: false,
        includeLowercase: true,
        includeNumbers: false,
        includeSymbols: false,
      });
      expect(password).toMatch(/^[a-z]+$/);
    });

    it('should include numbers when enabled', () => {
      const password = generatePassword({
        length: 20,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: true,
        includeSymbols: false,
      });
      expect(password).toMatch(/^[0-9]+$/);
    });

    it('should include all character types', () => {
      const password = generatePassword({
        length: 30,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
      });
      
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).toMatch(/[^A-Za-z0-9]/);
    });

    it('should exclude similar characters', () => {
      const password = generatePassword({
        length: 100,
        excludeSimilar: true,
      });
      
      expect(password).not.toMatch(/[il1Lo0O]/);
    });

    it('should exclude ambiguous characters', () => {
      const password = generatePassword({
        length: 100,
        excludeAmbiguous: true,
      });
      
      expect(password).not.toMatch(/[{}[\]()/\\'"` ~,;:.<>]/);
    });

    it('should throw error for invalid length', () => {
      expect(() => generatePassword({ length: 2 })).toThrow();
      expect(() => generatePassword({ length: 150 })).toThrow();
    });

    it('should throw error when no character types selected', () => {
      expect(() =>
        generatePassword({
          includeUppercase: false,
          includeLowercase: false,
          includeNumbers: false,
          includeSymbols: false,
        })
      ).toThrow();
    });

    it('should generate unique passwords', () => {
      const passwords = new Set();
      for (let i = 0; i < 100; i++) {
        passwords.add(generatePassword({ length: 16 }));
      }
      expect(passwords.size).toBe(100);
    });
  });

  describe('generatePassphrase', () => {
    it('should generate passphrase with default options', () => {
      const passphrase = generatePassphrase();
      expect(passphrase).toBeDefined();
      expect(passphrase.split('-').length).toBe(6); // 5 palabras + 1 número
    });

    it('should generate passphrase with custom word count', () => {
      const passphrase = generatePassphrase(3, '-', true);
      expect(passphrase.split('-').length).toBe(4); // 3 palabras + 1 número
    });

    it('should use custom separator', () => {
      const passphrase = generatePassphrase(4, '_', true);
      expect(passphrase).toContain('_');
    });

    it('should capitalize when enabled', () => {
      const passphrase = generatePassphrase(5, '-', true);
      const words = passphrase.split('-');
      words.slice(0, -1).forEach((word) => {
        expect(word[0]).toMatch(/[A-Z]/);
      });
    });

    it('should not capitalize when disabled', () => {
      const passphrase = generatePassphrase(5, '-', false);
      const words = passphrase.split('-');
      words.slice(0, -1).forEach((word) => {
        expect(word[0]).toMatch(/[a-z]/);
      });
    });
  });

  describe('generatePIN', () => {
    it('should generate default 6-digit PIN', () => {
      const pin = generatePIN();
      expect(pin).toMatch(/^\d{6}$/);
    });

    it('should generate custom length PIN', () => {
      const pin = generatePIN(8);
      expect(pin).toMatch(/^\d{8}$/);
    });

    it('should throw error for invalid length', () => {
      expect(() => generatePIN(3)).toThrow();
      expect(() => generatePIN(15)).toThrow();
    });
  });

  describe('generateHexKey', () => {
    it('should generate default 32-byte hex key', () => {
      const key = generateHexKey();
      expect(key).toMatch(/^[0-9a-f]{64}$/); // 32 bytes = 64 hex chars
    });

    it('should generate custom length hex key', () => {
      const key = generateHexKey(16);
      expect(key).toMatch(/^[0-9a-f]{32}$/); // 16 bytes = 32 hex chars
    });
  });

  describe('analyzePasswordStrength', () => {
    it('should rate weak passwords as weak', () => {
      const result = analyzePasswordStrength('password123');
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('should rate strong passwords as strong', () => {
      const result = analyzePasswordStrength('Xk9#mP2$vL8@qW5!nR7');
      expect(result.score).toBeGreaterThanOrEqual(3);
    });

    it('should provide feedback', () => {
      const result = analyzePasswordStrength('password');
      expect(result.feedback).toBeDefined();
      expect(result.feedback.suggestions).toBeDefined();
    });

    it('should estimate crack time', () => {
      const result = analyzePasswordStrength('MyP@ssw0rd!2023');
      expect(result.crackTime).toBeDefined();
      expect(typeof result.crackTime).toBe('string');
    });
  });

  describe('calculateEntropy', () => {
    it('should calculate entropy for lowercase only', () => {
      const entropy = calculateEntropy('abcdefgh'); // 8 chars, 26 possible
      expect(entropy).toBeCloseTo(37.6, 1);
    });

    it('should calculate entropy for mixed characters', () => {
      const entropy = calculateEntropy('Ab1!'); // 4 chars, 94 possible
      expect(entropy).toBeCloseTo(26.2, 1);
    });

    it('should increase with length', () => {
      const short = calculateEntropy('Aa1!');
      const long = calculateEntropy('Aa1!Aa1!');
      expect(long).toBeGreaterThan(short);
    });
  });

  describe('isCommonPassword', () => {
    it('should detect common passwords', () => {
      expect(isCommonPassword('password')).toBe(true);
      expect(isCommonPassword('123456')).toBe(true);
      expect(isCommonPassword('qwerty')).toBe(true);
    });

    it('should not flag uncommon passwords', () => {
      expect(isCommonPassword('Xk9#mP2$vL8@qW5!nR7')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isCommonPassword('PASSWORD')).toBe(true);
      expect(isCommonPassword('PaSsWoRd')).toBe(true);
    });
  });
});
