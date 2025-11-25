/**
 * Script de Utilidad para Generar JSON de Importación
 * 
 * Este script ayuda a crear el formato JSON correcto para importar contraseñas.
 * NOTA: Las contraseñas aquí están en formato de ejemplo encriptado.
 */

// Función helper para generar el formato base
function createPasswordEntry(config) {
  const {
    id,
    title,
    username,
    password = null, // Si tienes contraseña en texto plano (NO RECOMENDADO)
    encryptedPassword, // Contraseña ya encriptada
    url = '',
    notes = '',
    tags = [],
    favorite = false,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  } = config;

  // Validaciones básicas
  if (!id) throw new Error('ID es requerido');
  if (!title) throw new Error('Título es requerido');
  if (!username) throw new Error('Username es requerido');
  if (!encryptedPassword && !password) {
    throw new Error('Se requiere contraseña encriptada o en texto plano');
  }

  return {
    id,
    title,
    username,
    encryptedPassword: encryptedPassword || createDummyEncrypted(password),
    ...(url && { url }),
    ...(notes && { notes }),
    tags,
    favorite,
    createdAt,
    updatedAt
  };
}

// Crea un formato encriptado ficticio (SOLO PARA DESARROLLO)
// En producción, usa el sistema de encriptación real
function createDummyEncrypted(password) {
  // Genera arrays de números aleatorios para simular encriptación
  const iv = Array.from({ length: 12 }, () => Math.floor(Math.random() * 256));
  const data = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
  
  return JSON.stringify({ iv, data });
}

// Función para generar ID único
function generateId(prefix = 'pwd') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}

// Función para validar categorías
function validateTags(tags) {
  const validTags = [
    'Social Media',
    'Banking',
    'Email',
    'Work',
    'Shopping',
    'Entertainment',
    'Health',
    'Education',
    'Travel',
    'Other'
  ];
  
  return tags.filter(tag => validTags.includes(tag));
}

// Ejemplos de uso:

// Ejemplo 1: Contraseña básica
const password1 = createPasswordEntry({
  id: generateId(),
  title: 'Mi Cuenta de Gmail',
  username: 'usuario@gmail.com',
  password: 'MiContraseñaSegura123!', // Solo para demo
  tags: ['Email'],
  favorite: true
});

// Ejemplo 2: Contraseña con URL y notas
const password2 = createPasswordEntry({
  id: generateId(),
  title: 'Netflix',
  username: 'streaming@email.com',
  password: 'Netflix2024!',
  url: 'https://www.netflix.com',
  notes: 'Plan familiar - 4 pantallas',
  tags: ['Entertainment'],
  favorite: true
});

// Ejemplo 3: Contraseña de banco
const password3 = createPasswordEntry({
  id: generateId('bank'),
  title: 'Banco Nacional Online',
  username: '12345678',
  password: 'BankS3cur3!',
  url: 'https://banco.com/login',
  notes: 'Cuenta de ahorros. PIN guardado separado.',
  tags: ['Banking'],
  favorite: false
});

// Crear el objeto final
const importData = {
  passwords: [
    password1,
    password2,
    password3
  ]
};

// Convertir a JSON formateado
const jsonOutput = JSON.stringify(importData, null, 2);

// Para usar en Node.js:
console.log(jsonOutput);

// Para guardar en un archivo (Node.js):
// const fs = require('fs');
// fs.writeFileSync('my-passwords.json', jsonOutput);

// Para copiar al portapapeles en el navegador:
// navigator.clipboard.writeText(jsonOutput);

// Exportar funciones para uso externo
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createPasswordEntry,
    generateId,
    validateTags,
    createDummyEncrypted
  };
}

// ============================================
// EJEMPLO DE SALIDA
// ============================================
/*
{
  "passwords": [
    {
      "id": "pwd-1732531200000-abc123",
      "title": "Mi Cuenta de Gmail",
      "username": "usuario@gmail.com",
      "encryptedPassword": "{\"iv\":[145,67,89,...],\"data\":[23,45,67,...]}",
      "tags": ["Email"],
      "favorite": true,
      "createdAt": "2024-11-25T10:00:00.000Z",
      "updatedAt": "2024-11-25T10:00:00.000Z"
    }
  ]
}
*/

// ============================================
// INSTRUCCIONES DE USO
// ============================================
/*

1. USANDO NODE.JS:
   
   node generate-import-json.js > my-passwords.json

2. USANDO EN EL NAVEGADOR:
   
   - Abre la consola del navegador (F12)
   - Copia y pega este script
   - Ejecuta las funciones para crear tus contraseñas
   - Copia el resultado con: copy(jsonOutput)
   - Pega en un archivo .json

3. PERSONALIZACIÓN:
   
   Modifica los ejemplos arriba con tus propios datos:
   
   const miPassword = createPasswordEntry({
     id: generateId(),
     title: 'Mi Sitio Web',
     username: 'mi-usuario',
     password: 'mi-contraseña-segura',
     url: 'https://misitio.com',
     tags: ['Work'],
     favorite: true
   });

4. IMPORTANTE:
   
   ⚠️ Este script usa encriptación FICTICIA para demos.
   ⚠️ En producción, usa el sistema de encriptación real de la app.
   ⚠️ NO guardes contraseñas en texto plano en archivos.
   ⚠️ Elimina archivos temporales después de importar.

*/
