// Types for Password entries
export interface Password {
  id: string;
  title: string;
  username: string;
  encryptedPassword: string;
  url?: string;
  notes?: string;
  tags: string[];
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastAccessed?: Date;
  customFields?: CustomField[];
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'password' | 'email' | 'url';
  encrypted: boolean;
}

// User & Authentication
export interface User {
  id: string;
  email: string;
  name: string;
  masterPasswordHash: string;
  salt: string;
  createdAt: Date;
  settings: UserSettings;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  recoveryCodes?: string[];
  biometricEnabled: boolean;
}

export interface UserSettings {
  language: 'es' | 'en';
  theme: 'light' | 'dark' | 'auto';
  autoLockTimeout: number; // minutos
  clipboardClearTimeout: number; // segundos
  showPasswordStrength: boolean;
  requireMasterPasswordOnCopy: boolean;
}

// Encryption
export interface EncryptedData {
  iv: string;      // Base64 encoded IV
  data: string;    // Base64 encoded encrypted data
  tag?: string;    // Optional authentication tag
}

export interface MasterKey {
  key: CryptoKey;
  salt: Uint8Array;
}

// Sharing & Collaboration
export interface SharedCredential {
  id: string;
  passwordId: string;
  sharedBy: string;
  sharedWith: string;
  permission: 'view' | 'edit' | 'autofill-only';
  sharedAt: Date;
  expiresAt?: Date;
}

// Security
export interface SecurityReport {
  weakPasswords: Password[];
  reusedPasswords: Password[];
  compromisedPasswords: Password[];
  oldPasswords: Password[]; // No cambiadas en > 90 días
  score: number; // 0-100
  lastCheck: Date;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4; // zxcvbn score
  feedback: {
    warning: string;
    suggestions: string[];
  };
  crackTime: string;
}

// Import/Export
export interface ExportData {
  version: string;
  exportedAt: Date;
  passwords: Password[];
  encrypted: boolean;
  checksum: string;
}

export interface QRExportData {
  encrypted: string;
  iv: string;
  salt: string;
  timestamp: number;
}

// Backup
export interface Backup {
  id: string;
  createdAt: Date;
  size: number;
  encrypted: boolean;
  location: 'local' | 'drive' | 'onedrive';
  autoBackup: boolean;
}

// 2FA
export interface TwoFactorAuth {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

// Audit Log
export interface AuditLog {
  id: string;
  userId: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'share';
  resourceType: 'password' | 'user' | 'settings';
  resourceId?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  details?: string;
}

// Generator Options
export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  customSymbols?: string;
}

// HIBP Integration
export interface BreachCheckResult {
  isCompromised: boolean;
  breachCount: number;
  breaches?: Breach[];
}

export interface Breach {
  name: string;
  title: string;
  domain: string;
  breachDate: string;
  addedDate: string;
  modifiedDate: string;
  pwnCount: number;
  description: string;
  dataClasses: string[];
}
