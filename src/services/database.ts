/**
 * IndexedDB Service
 * Manejo de almacenamiento local seguro usando IndexedDB
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Password, User, SharedCredential, AuditLog, Backup } from '@/types';

// Schema de la base de datos
interface PasswordManagerDB extends DBSchema {
  passwords: {
    key: string;
    value: Password;
    indexes: {
      'by-tags': string;
      'by-favorite': number;
      'by-updated': Date;
    };
  };
  users: {
    key: string;
    value: User;
  };
  shared: {
    key: string;
    value: SharedCredential;
    indexes: {
      'by-password': string;
      'by-shared-with': string;
    };
  };
  auditLogs: {
    key: string;
    value: AuditLog;
    indexes: {
      'by-user': string;
      'by-timestamp': Date;
      'by-action': string;
    };
  };
  backups: {
    key: string;
    value: Backup;
    indexes: {
      'by-date': Date;
    };
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'password-manager';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<PasswordManagerDB> | null = null;

/**
 * Inicializa la base de datos
 */
export async function initDB(): Promise<IDBPDatabase<PasswordManagerDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<PasswordManagerDB>(DB_NAME, DB_VERSION, {
    upgrade(db: any) {
      // Store: passwords
      if (!db.objectStoreNames.contains('passwords')) {
        const passwordStore = db.createObjectStore('passwords', {
          keyPath: 'id',
        });
        passwordStore.createIndex('by-tags', 'tags', { multiEntry: true });
        passwordStore.createIndex('by-favorite', 'favorite');
        passwordStore.createIndex('by-updated', 'updatedAt');
      }

      // Store: users
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id' });
      }

      // Store: shared credentials
      if (!db.objectStoreNames.contains('shared')) {
        const sharedStore = db.createObjectStore('shared', {
          keyPath: 'id',
        });
        sharedStore.createIndex('by-password', 'passwordId');
        sharedStore.createIndex('by-shared-with', 'sharedWith');
      }

      // Store: audit logs
      if (!db.objectStoreNames.contains('auditLogs')) {
        const auditStore = db.createObjectStore('auditLogs', {
          keyPath: 'id',
        });
        auditStore.createIndex('by-user', 'userId');
        auditStore.createIndex('by-timestamp', 'timestamp');
        auditStore.createIndex('by-action', 'action');
      }

      // Store: backups
      if (!db.objectStoreNames.contains('backups')) {
        const backupStore = db.createObjectStore('backups', {
          keyPath: 'id',
        });
        backupStore.createIndex('by-date', 'createdAt');
      }

      // Store: settings
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    },
  });

  return dbInstance;
}

// ========== CRUD Operations for Passwords ==========

export async function getAllPasswords(): Promise<Password[]> {
  const db = await initDB();
  return db.getAll('passwords');
}

export async function getPasswordById(id: string): Promise<Password | undefined> {
  const db = await initDB();
  return db.get('passwords', id);
}

export async function addPassword(password: Password): Promise<string> {
  const db = await initDB();
  return db.add('passwords', password);
}

export async function updatePassword(password: Password): Promise<string> {
  const db = await initDB();
  password.updatedAt = new Date();
  return db.put('passwords', password);
}

export async function deletePassword(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('passwords', id);
}

export async function getPasswordsByTag(tag: string): Promise<Password[]> {
  const db = await initDB();
  return db.getAllFromIndex('passwords', 'by-tags', tag);
}

export async function getFavoritePasswords(): Promise<Password[]> {
  const db = await initDB();
  return db.getAllFromIndex('passwords', 'by-favorite', 1);
}

export async function searchPasswords(query: string): Promise<Password[]> {
  const db = await initDB();
  const allPasswords = await db.getAll('passwords');
  
  const lowerQuery = query.toLowerCase();
  return allPasswords.filter(
    (p: any) =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.username.toLowerCase().includes(lowerQuery) ||
      p.url?.toLowerCase().includes(lowerQuery) ||
      p.notes?.toLowerCase().includes(lowerQuery) ||
      p.tags.some((tag: any) => tag.toLowerCase().includes(lowerQuery))
  );
}

// ========== User Operations ==========

export async function getUser(id: string): Promise<User | undefined> {
  const db = await initDB();
  return db.get('users', id);
}

export async function saveUser(user: User): Promise<string> {
  const db = await initDB();
  return db.put('users', user);
}

export async function getCurrentUser(): Promise<User | undefined> {
  const db = await initDB();
  const users = await db.getAll('users');
  return users[0]; // Por ahora solo soportamos un usuario
}

// ========== Shared Credentials ==========

export async function getSharedCredentials(userId: string): Promise<SharedCredential[]> {
  const db = await initDB();
  return db.getAllFromIndex('shared', 'by-shared-with', userId);
}

export async function sharePassword(shared: SharedCredential): Promise<string> {
  const db = await initDB();
  return db.add('shared', shared);
}

export async function revokeSharedAccess(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('shared', id);
}

// ========== Audit Logs ==========

export async function addAuditLog(log: AuditLog): Promise<string> {
  const db = await initDB();
  return db.add('auditLogs', log);
}

export async function getAuditLogs(
  userId?: string,
  limit: number = 100
): Promise<AuditLog[]> {
  const db = await initDB();
  
  if (userId) {
    return db.getAllFromIndex('auditLogs', 'by-user', userId);
  }
  
  const allLogs = await db.getAll('auditLogs');
  return allLogs
    .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

// ========== Backups ==========

export async function saveBackup(backup: Backup): Promise<string> {
  const db = await initDB();
  return db.add('backups', backup);
}

export async function getBackups(): Promise<Backup[]> {
  const db = await initDB();
  const backups = await db.getAll('backups');
  return backups.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function deleteBackup(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('backups', id);
}

// ========== Settings ==========

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await initDB();
  return db.get('settings', key);
}

export async function setSetting<T>(key: string, value: T): Promise<string> {
  const db = await initDB();
  return db.put('settings', value, key);
}

// ========== Utility Functions ==========

/**
 * Exporta toda la base de datos
 */
export async function exportDatabase(): Promise<{
  passwords: Password[];
  users: User[];
  shared: SharedCredential[];
  settings: Record<string, any>;
}> {
  const db = await initDB();
  
  const [passwords, users, shared] = await Promise.all([
    db.getAll('passwords'),
    db.getAll('users'),
    db.getAll('shared'),
  ]);

  // Obtener todos los settings
  const settingKeys = await db.getAllKeys('settings');
  const settings: Record<string, any> = {};
  for (const key of settingKeys) {
    settings[key as string] = await db.get('settings', key);
  }

  return { passwords, users, shared, settings };
}

/**
 * Importa datos a la base de datos
 */
export async function importDatabase(data: {
  passwords?: Password[];
  users?: User[];
  shared?: SharedCredential[];
  settings?: Record<string, any>;
}): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(
    ['passwords', 'users', 'shared', 'settings'],
    'readwrite'
  );

  if (data.passwords) {
    for (const password of data.passwords) {
      await tx.objectStore('passwords').put(password);
    }
  }

  if (data.users) {
    for (const user of data.users) {
      await tx.objectStore('users').put(user);
    }
  }

  if (data.shared) {
    for (const shared of data.shared) {
      await tx.objectStore('shared').put(shared);
    }
  }

  if (data.settings) {
    for (const [key, value] of Object.entries(data.settings)) {
      await tx.objectStore('settings').put(value, key);
    }
  }

  await tx.done;
}

/**
 * Limpia toda la base de datos (PELIGROSO)
 */
export async function clearAllData(): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(
    ['passwords', 'users', 'shared', 'auditLogs', 'backups', 'settings'],
    'readwrite'
  );

  await Promise.all([
    tx.objectStore('passwords').clear(),
    tx.objectStore('users').clear(),
    tx.objectStore('shared').clear(),
    tx.objectStore('auditLogs').clear(),
    tx.objectStore('backups').clear(),
    tx.objectStore('settings').clear(),
  ]);

  await tx.done;
}

/**
 * Obtiene estadísticas de la base de datos
 */
export async function getStats(): Promise<{
  passwordCount: number;
  sharedCount: number;
  auditLogCount: number;
  backupCount: number;
}> {
  const db = await initDB();

  const [passwords, shared, auditLogs, backups] = await Promise.all([
    db.getAll('passwords'),
    db.getAll('shared'),
    db.getAll('auditLogs'),
    db.getAll('backups'),
  ]);

  return {
    passwordCount: passwords.length,
    sharedCount: shared.length,
    auditLogCount: auditLogs.length,
    backupCount: backups.length,
  };
}
