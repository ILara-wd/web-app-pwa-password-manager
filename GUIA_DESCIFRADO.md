# 🔓 Guía para Descifrar Contraseñas

## 📋 Resumen

Esta guía te muestra cómo descifrar contraseñas que han sido guardadas usando el sistema de encriptación implementado (AES-256-GCM con Base64).

---

## 🔑 Proceso Completo de Descifrado

### **Paso 1: Obtener la Contraseña Encriptada de la Base de Datos**

```typescript
import { getPasswordById } from '@/services/database';

// Obtener contraseña por ID
const password = await getPasswordById('pwd-001');

console.log(password);
// Output:
// {
//   id: "pwd-001",
//   title: "Gmail",
//   username: "usuario@gmail.com",
//   encryptedPassword: '{"iv":"kUNZDCQmTg==","data":"F01pKDQmTl5SIiw4Rl5SIiwzNzg5MTI="}',
//   ...
// }
```

---

### **Paso 2: Parsear el String JSON Encriptado**

```typescript
import type { EncryptedData } from '@/types';

// El campo encryptedPassword es un string JSON, necesitamos parsearlo
const encryptedData: EncryptedData = JSON.parse(password.encryptedPassword);

console.log(encryptedData);
// Output:
// {
//   iv: "kUNZDCQmTg==",     // Vector de inicialización en Base64
//   data: "F01pKDQmTl5SIiw4Rl5SIiwzNzg5MTI="  // Datos encriptados en Base64
// }
```

---

### **Paso 3: Derivar la Clave Maestra**

```typescript
import { deriveMasterKey } from '@/crypto/encryption';

// Usar la misma contraseña maestra que se usó para encriptar
const tempMasterPassword = 'temp-master-password'; // ⚠️ En producción, obtener del usuario autenticado

const masterKeyData = await deriveMasterKey(tempMasterPassword);

console.log(masterKeyData);
// Output:
// {
//   key: CryptoKey,           // Clave AES-256-GCM
//   salt: Uint8Array(16)      // Salt usado para derivar la clave
// }
```

---

### **Paso 4: Descifrar la Contraseña**

```typescript
import { decryptData } from '@/crypto/encryption';

// Descifrar usando la clave maestra
const decryptedPassword = await decryptData(encryptedData, masterKeyData.key);

console.log(decryptedPassword);
// Output: "MyP@ssw0rd123"  // ¡Contraseña original!
```

---

## 🎯 Ejemplo Completo (Todo Junto)

### **Función Helper para Descifrar Cualquier Contraseña**

```typescript
import { getPasswordById } from '@/services/database';
import { deriveMasterKey, decryptData } from '@/crypto/encryption';
import type { EncryptedData } from '@/types';

/**
 * Descifra una contraseña de la base de datos
 * @param passwordId - ID de la contraseña a descifrar
 * @param masterPassword - Contraseña maestra del usuario
 * @returns La contraseña descifrada en texto plano
 */
async function decryptPasswordById(
  passwordId: string, 
  masterPassword: string = 'temp-master-password'
): Promise<string> {
  try {
    // 1. Obtener contraseña de la base de datos
    const password = await getPasswordById(passwordId);
    
    if (!password) {
      throw new Error('Contraseña no encontrada');
    }

    // 2. Parsear el JSON encriptado
    const encryptedData: EncryptedData = JSON.parse(password.encryptedPassword);

    // 3. Derivar la clave maestra
    const masterKeyData = await deriveMasterKey(masterPassword);

    // 4. Descifrar
    const decryptedPassword = await decryptData(encryptedData, masterKeyData.key);

    return decryptedPassword;
  } catch (error) {
    console.error('Error descifrando contraseña:', error);
    throw new Error('No se pudo descifrar la contraseña');
  }
}

// Uso:
const password = await decryptPasswordById('pwd-001');
console.log('Contraseña descifrada:', password);
```

---

## 💡 Ejemplos de Uso Prácticos

### **1. Mostrar Contraseña en un Modal**

```typescript
import { useState } from 'react';

function PasswordCard({ passwordId }: { passwordId: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleShowPassword = async () => {
    if (decryptedPassword) {
      // Ya está descifrada, solo alternar visibilidad
      setShowPassword(!showPassword);
      return;
    }

    try {
      setLoading(true);
      
      // Descifrar contraseña
      const password = await decryptPasswordById(passwordId);
      setDecryptedPassword(password);
      setShowPassword(true);
    } catch (error) {
      alert('Error al descifrar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleShowPassword} disabled={loading}>
        {loading ? 'Descifrando...' : showPassword ? '👁️ Ocultar' : '👁️ Mostrar'}
      </button>
      
      {showPassword && (
        <div className="password-display">
          {decryptedPassword}
        </div>
      )}
    </div>
  );
}
```

---

### **2. Copiar Contraseña al Portapapeles**

```typescript
async function copyPasswordToClipboard(passwordId: string) {
  try {
    // Descifrar contraseña
    const decryptedPassword = await decryptPasswordById(passwordId);
    
    // Copiar al portapapeles
    await navigator.clipboard.writeText(decryptedPassword);
    
    // Notificar al usuario
    alert('¡Contraseña copiada al portapapeles!');
    
    // Limpiar portapapeles después de 60 segundos (seguridad)
    setTimeout(async () => {
      await navigator.clipboard.writeText('');
    }, 60000);
  } catch (error) {
    alert('Error al copiar la contraseña');
  }
}

// Uso en componente
<button onClick={() => copyPasswordToClipboard('pwd-001')}>
  📋 Copiar Contraseña
</button>
```

---

### **3. Editar Contraseña (Descifrar para Mostrar en Formulario)**

Este ya está implementado en `PasswordGenerator.tsx`:

```typescript
const loadPassword = async (id: string) => {
  try {
    setLoading(true);
    const password = await getPasswordById(id);
    
    if (password) {
      let decryptedPassword = '';
      
      try {
        // Descifrar contraseña
        const tempMasterPassword = 'temp-master-password';
        const masterKeyData = await deriveMasterKey(tempMasterPassword);
        const encryptedData: EncryptedData = JSON.parse(password.encryptedPassword);
        decryptedPassword = await decryptData(encryptedData, masterKeyData.key);
      } catch (decryptError) {
        console.error('Error decrypting password:', decryptError);
        decryptedPassword = '';
      }

      // Mostrar en el formulario
      setFormData({
        title: password.title,
        username: password.username,
        password: decryptedPassword,  // ← Contraseña descifrada
        url: password.url || '',
        notes: password.notes || '',
        category: password.tags[0] || '',
        favorite: password.favorite,
      });
    }
  } catch (err) {
    setError('Error al cargar la contraseña');
  } finally {
    setLoading(false);
  }
};
```

---

### **4. Exportar Contraseñas Descifradas (Uso Interno/Debug)**

```typescript
async function exportDecryptedPasswords() {
  try {
    const allPasswords = await getAllPasswords();
    const masterPassword = 'temp-master-password';
    const masterKeyData = await deriveMasterKey(masterPassword);

    const decryptedList = await Promise.all(
      allPasswords.map(async (pwd) => {
        try {
          const encryptedData = JSON.parse(pwd.encryptedPassword);
          const decryptedPassword = await decryptData(encryptedData, masterKeyData.key);
          
          return {
            id: pwd.id,
            title: pwd.title,
            username: pwd.username,
            password: decryptedPassword,  // ⚠️ En texto plano
            url: pwd.url,
            notes: pwd.notes,
          };
        } catch (error) {
          return {
            ...pwd,
            password: '[ERROR: No se pudo descifrar]'
          };
        }
      })
    );

    console.table(decryptedList);
    return decryptedList;
  } catch (error) {
    console.error('Error exportando contraseñas:', error);
  }
}

// ⚠️ ADVERTENCIA: Solo usar para debugging, nunca en producción
```

---

## 🔍 Debugging: Ver Contraseñas en la Consola

### **Opción 1: Ver una contraseña específica**

```javascript
// En la consola del navegador (F12)

// Función helper
async function verPassword(id) {
  const { getPasswordById } = await import('./src/services/database');
  const { deriveMasterKey, decryptData } = await import('./src/crypto/encryption');
  
  const password = await getPasswordById(id);
  const encryptedData = JSON.parse(password.encryptedPassword);
  const masterKeyData = await deriveMasterKey('temp-master-password');
  const decrypted = await decryptData(encryptedData, masterKeyData.key);
  
  console.log({
    titulo: password.title,
    usuario: password.username,
    contraseña: decrypted,
    url: password.url
  });
}

// Usar
await verPassword('pwd-001');
```

---

### **Opción 2: Ver todas las contraseñas**

```javascript
// En la consola del navegador (F12)

async function verTodasLasPasswords() {
  const { getAllPasswords } = await import('./src/services/database');
  const { deriveMasterKey, decryptData } = await import('./src/crypto/encryption');
  
  const allPasswords = await getAllPasswords();
  const masterKeyData = await deriveMasterKey('temp-master-password');
  
  for (const pwd of allPasswords) {
    try {
      const encryptedData = JSON.parse(pwd.encryptedPassword);
      const decrypted = await decryptData(encryptedData, masterKeyData.key);
      
      console.log(`
🔑 ${pwd.title}
   Usuario: ${pwd.username}
   Contraseña: ${decrypted}
   URL: ${pwd.url || 'N/A'}
   Categoría: ${pwd.tags.join(', ') || 'Sin categoría'}
   Favorito: ${pwd.favorite ? '⭐ Sí' : 'No'}
-------------------`);
    } catch (error) {
      console.error(`❌ Error descifrando: ${pwd.title}`);
    }
  }
}

// Usar
await verTodasLasPasswords();
```

---

## 📊 Flujo Visual del Descifrado

```
┌─────────────────────────────────────────┐
│   1. Obtener de IndexedDB              │
│   password.encryptedPassword           │
│   '{"iv":"kUNZ...","data":"F01p..."}'  │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│   2. JSON.parse()                      │
│   {                                    │
│     iv: "kUNZDCQmTg==",                │
│     data: "F01pKDQmTl5SIiw4Rl5..."    │
│   }                                    │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│   3. Derivar Clave Maestra             │
│   deriveMasterKey('temp-master-pwd')   │
│   → CryptoKey (AES-256-GCM)            │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│   4. Convertir Base64 → ArrayBuffer    │
│   base64ToArrayBuffer(iv)              │
│   base64ToArrayBuffer(data)            │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│   5. Descifrar con crypto.subtle       │
│   crypto.subtle.decrypt(...)           │
│   → ArrayBuffer descifrado             │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│   6. Decodificar a String              │
│   new TextDecoder().decode(buffer)     │
│   → "MyP@ssw0rd123"                    │
└─────────────────────────────────────────┘
```

---

## ⚠️ Consideraciones de Seguridad

### **1. Contraseña Maestra**
```typescript
// ❌ MAL - Hardcoded en producción
const masterPassword = 'temp-master-password';

// ✅ BIEN - Obtener del usuario autenticado
const masterPassword = await getUserMasterPassword();
```

### **2. Almacenamiento Temporal**
```typescript
// ✅ BIEN - No guardar descifradas en estado global
const decrypted = await decryptPasswordById(id);
// Usar inmediatamente
navigator.clipboard.writeText(decrypted);
// No guardar en variable persistente
```

### **3. Limpiar Memoria**
```typescript
// Después de usar la contraseña descifrada
let decrypted = await decryptPasswordById(id);
// ... usar la contraseña ...
decrypted = ''; // Limpiar de memoria
```

### **4. Auto-lock**
```typescript
// Implementar timeout para re-encriptar
let lastDecryptTime = Date.now();

function shouldRelock() {
  const TIMEOUT = 5 * 60 * 1000; // 5 minutos
  return Date.now() - lastDecryptTime > TIMEOUT;
}
```

---

## 🐛 Solución de Problemas

### **Error: "Failed to decrypt data"**

**Causa:** La clave maestra no coincide con la que se usó para encriptar.

**Solución:**
```typescript
// Verificar que usas la misma clave
const masterPassword = 'temp-master-password'; // ← Debe ser exactamente la misma
```

---

### **Error: "Invalid JSON"**

**Causa:** El string `encryptedPassword` no es un JSON válido.

**Solución:**
```typescript
try {
  const encryptedData = JSON.parse(password.encryptedPassword);
} catch (error) {
  console.error('JSON inválido:', password.encryptedPassword);
  // Verificar el formato
}
```

---

### **Error: "Cannot read property 'iv' of undefined"**

**Causa:** El objeto parseado no tiene la estructura esperada.

**Solución:**
```typescript
const encryptedData = JSON.parse(password.encryptedPassword);

// Verificar estructura
if (!encryptedData.iv || !encryptedData.data) {
  throw new Error('Formato de datos encriptados inválido');
}
```

---

## 📚 Funciones Disponibles

### **Desde `@/crypto/encryption`:**

```typescript
// Derivar clave maestra
deriveMasterKey(password: string, salt?: Uint8Array): Promise<MasterKey>

// Descifrar datos
decryptData(encryptedData: EncryptedData, masterKey: CryptoKey): Promise<string>

// Conversión Base64
base64ToArrayBuffer(base64: string): ArrayBuffer
```

### **Desde `@/services/database`:**

```typescript
// Obtener contraseña por ID
getPasswordById(id: string): Promise<Password | undefined>

// Obtener todas las contraseñas
getAllPasswords(): Promise<Password[]>
```

---

## 🎓 Ejemplo Completo con Manejo de Errores

```typescript
async function safeDecryptPassword(passwordId: string): Promise<string | null> {
  try {
    // 1. Validar ID
    if (!passwordId) {
      throw new Error('ID de contraseña requerido');
    }

    // 2. Obtener contraseña
    const password = await getPasswordById(passwordId);
    if (!password) {
      console.error(`Contraseña con ID ${passwordId} no encontrada`);
      return null;
    }

    // 3. Validar campo encriptado
    if (!password.encryptedPassword) {
      throw new Error('Campo encryptedPassword vacío');
    }

    // 4. Parsear JSON
    let encryptedData: EncryptedData;
    try {
      encryptedData = JSON.parse(password.encryptedPassword);
    } catch (parseError) {
      console.error('Error parseando JSON:', password.encryptedPassword);
      throw new Error('Formato de contraseña encriptada inválido');
    }

    // 5. Validar estructura
    if (!encryptedData.iv || !encryptedData.data) {
      throw new Error('Estructura de datos encriptados incompleta');
    }

    // 6. Derivar clave maestra
    const masterPassword = 'temp-master-password';
    const masterKeyData = await deriveMasterKey(masterPassword);

    // 7. Descifrar
    const decryptedPassword = await decryptData(encryptedData, masterKeyData.key);

    // 8. Validar resultado
    if (!decryptedPassword || decryptedPassword.length === 0) {
      throw new Error('El descifrado resultó en una cadena vacía');
    }

    return decryptedPassword;

  } catch (error) {
    console.error('Error en safeDecryptPassword:', error);
    
    // Log detallado para debugging
    if (error instanceof Error) {
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
    }
    
    return null;
  }
}
```

---

¡Ahora tienes todo lo necesario para descifrar contraseñas en tu aplicación! 🎉
