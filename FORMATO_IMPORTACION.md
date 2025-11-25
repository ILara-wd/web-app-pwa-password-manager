# 📥 Formato JSON para Importación de Contraseñas

## 📋 Estructura Base

El archivo JSON debe contener un objeto raíz con una propiedad `passwords` que contiene un array de objetos de contraseña.

```json
{
  "passwords": [
    { /* Contraseña 1 */ },
    { /* Contraseña 2 */ },
    { /* Contraseña 3 */ }
  ]
}
```

---

## 🔑 Campos de Cada Contraseña

### ✅ **Campos Obligatorios**

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `id` | string | Identificador único | `"abc123"` o `"example-001"` |
| `title` | string | Nombre/alias de la contraseña | `"Gmail Personal"` |
| `username` | string | Nombre de usuario o email | `"usuario@email.com"` |
| `encryptedPassword` | string | Contraseña encriptada en formato JSON | Ver formato abajo |
| `tags` | array | Array de categorías | `["Email"]` o `[]` |
| `favorite` | boolean | Si es favorito o no | `true` o `false` |
| `createdAt` | string (ISO 8601) | Fecha de creación | `"2024-01-15T10:30:00.000Z"` |
| `updatedAt` | string (ISO 8601) | Fecha de última actualización | `"2024-01-15T10:30:00.000Z"` |

### ⚪ **Campos Opcionales**

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `url` | string | URL del sitio web | `"https://gmail.com"` |
| `notes` | string | Notas adicionales | `"Cuenta principal"` |
| `lastAccessed` | string (ISO 8601) | Última vez accedido | `"2024-01-15T10:30:00.000Z"` |
| `customFields` | array | Campos personalizados | Ver formato abajo |

---

## 🔐 Formato de Contraseña Encriptada

La contraseña debe estar encriptada usando AES-256-GCM. El formato es un string JSON que contiene:

```json
"encryptedPassword": "{\"iv\":\"kUNZDCQmTg==\",\"data\":\"F01pKDQmTl5SIiw4Rl5SIiwzNzg5MTI=\"}"
```

**Estructura interna:**
- `iv`: String en Base64 que representa el vector de inicialización (12 bytes)
- `data`: String en Base64 que representa los datos encriptados

**Ventajas del formato Base64:**
- ✅ Más compacto que arrays de números
- ✅ Más legible y fácil de copiar
- ✅ Compatible con JSON sin escapes especiales
- ✅ Estándar en aplicaciones web

> ⚠️ **Importante**: Si importas contraseñas desde otra aplicación, necesitarás encriptarlas primero usando el mismo algoritmo (AES-256-GCM con PBKDF2).

---

## 🏷️ Categorías Disponibles

Las siguientes categorías están predefinidas:

- `"Social Media"` - Redes sociales
- `"Banking"` - Servicios bancarios
- `"Email"` - Correos electrónicos
- `"Work"` - Trabajo
- `"Shopping"` - Compras en línea
- `"Entertainment"` - Entretenimiento
- `"Health"` - Salud
- `"Education"` - Educación
- `"Travel"` - Viajes
- `"Other"` - Otros

**Ejemplo con múltiples categorías:**
```json
"tags": ["Social Media", "Work"]
```

**Sin categoría:**
```json
"tags": []
```

---

## 📝 Ejemplos Completos

### Ejemplo 1: Contraseña Básica (Solo Campos Obligatorios)

```json
{
  "passwords": [
    {
      "id": "pwd-001",
      "title": "Mi Cuenta",
      "username": "usuario@email.com",
      "encryptedPassword": "{\"iv\":\"kUNZDCQmTg==\",\"data\":\"F01pKDQmTl5SIiw4Rl5SIiwzNzg5MTI=\"}",
      "tags": [],
      "favorite": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Ejemplo 2: Contraseña Completa (Todos los Campos)

```json
{
  "passwords": [
    {
      "id": "pwd-002",
      "title": "Gmail Personal",
      "username": "miusuario@gmail.com",
      "encryptedPassword": "{\"iv\":\"kUNZDCQmTg==\",\"data\":\"F01pKDQmTl5SIiw4Rl5SIiwzNzg5MTI=\"}",
      "url": "https://gmail.com",
      "notes": "Cuenta principal de correo electrónico para uso personal",
      "tags": ["Email"],
      "favorite": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "lastAccessed": "2024-11-25T08:00:00.000Z"
    }
  ]
}
```

### Ejemplo 3: Múltiples Contraseñas

```json
{
  "passwords": [
    {
      "id": "pwd-001",
      "title": "Netflix",
      "username": "usuario@ejemplo.com",
      "encryptedPassword": "{\"iv\":\"6jgxOFpcWg==\",\"data\":\"IjhGXlIiLDM3ODkxMjM0NTY3ODkwMTI=\"}",
      "url": "https://www.netflix.com",
      "notes": "Plan familiar",
      "tags": ["Entertainment"],
      "favorite": true,
      "createdAt": "2024-02-20T14:45:00.000Z",
      "updatedAt": "2024-02-20T14:45:00.000Z"
    },
    {
      "id": "pwd-002",
      "title": "GitHub",
      "username": "developer123",
      "encryptedPassword": "{\"iv\":\"WiEheXshQ1c=\",\"data\":\"XCE8DCQmTl5SIiw0Njc4OTAxMjM0NTY3ODk=\"}",
      "url": "https://github.com",
      "tags": ["Work"],
      "favorite": false,
      "createdAt": "2024-06-01T08:30:00.000Z",
      "updatedAt": "2024-06-01T08:30:00.000Z"
    }
  ]
}
```

---

## 🔨 Cómo Crear IDs Únicos

Los IDs deben ser únicos. Puedes usar varios formatos:

```javascript
// Opción 1: UUID simple
"id": "550e8400-e29b-41d4-a716-446655440000"

// Opción 2: Prefijo + número
"id": "pwd-001"
"id": "password-123"

// Opción 3: Timestamp + random
"id": "pwd-1732531200-abc"

// Opción 4: Nombre descriptivo único
"id": "gmail-personal-2024"
```

---

## 📅 Formato de Fechas (ISO 8601)

Las fechas deben estar en formato ISO 8601 con UTC:

```json
"createdAt": "2024-11-25T10:30:00.000Z"
```

**Componentes:**
- `2024` - Año
- `11` - Mes (01-12)
- `25` - Día (01-31)
- `T` - Separador de fecha y hora
- `10:30:00` - Hora en formato 24h (HH:MM:SS)
- `.000` - Milisegundos (opcional)
- `Z` - Zona horaria UTC

**Generar fecha actual en JavaScript:**
```javascript
new Date().toISOString()
// Output: "2024-11-25T10:30:00.000Z"
```

---

## ✅ Validación del JSON

Antes de importar, verifica que tu JSON:

1. ✅ Sea un JSON válido (usa [jsonlint.com](https://jsonlint.com/))
2. ✅ Tenga la estructura raíz `{"passwords": [...]}`
3. ✅ Todos los objetos tengan los campos obligatorios
4. ✅ Los tipos de datos sean correctos (string, boolean, array)
5. ✅ Las fechas estén en formato ISO 8601
6. ✅ Los IDs sean únicos
7. ✅ `encryptedPassword` esté en el formato correcto

---

## 🚀 Pasos para Importar

1. **Preparar el archivo JSON** con el formato correcto
2. **Guardar** con extensión `.json` (ejemplo: `passwords.json`)
3. **En la aplicación**, ir a "📋 Mis Contraseñas"
4. Click en **"📥 Importar"**
5. **Seleccionar** tu archivo JSON
6. ¡Listo! Las contraseñas se importarán automáticamente

---

## ⚠️ Notas Importantes

### Sobre la Encriptación

> Las contraseñas en `encryptedPassword` deben estar **ya encriptadas** con AES-256-GCM. Si estás migrando desde otra aplicación, necesitarás:
> 1. Desencriptar con el sistema anterior
> 2. Re-encriptar con este sistema
> 3. O usar el formulario para crear nuevas contraseñas

### Para Contraseñas de Texto Plano

Si tienes contraseñas en texto plano que quieres importar, es **más seguro**:

1. Crear un script que use las funciones de encriptación de la app
2. O importarlas manualmente una por una usando el formulario

### Seguridad

- ⚠️ No compartas archivos JSON con contraseñas encriptadas
- ⚠️ Elimina archivos de importación después de usarlos
- ⚠️ Usa siempre HTTPS al transferir archivos
- ⚠️ Mantén backups en lugares seguros

---

## 📦 Archivo de Ejemplo

Incluido en el proyecto: `example-import.json`

Este archivo contiene 7 contraseñas de ejemplo con diferentes configuraciones.

---

## 🆘 Solución de Problemas

### Error: "Invalid JSON format"
- Verifica que el JSON sea válido en [jsonlint.com](https://jsonlint.com/)
- Revisa que no falten comas o llaves

### Error: "Missing required fields"
- Asegúrate de que todos los campos obligatorios estén presentes
- Verifica los nombres de las propiedades (son case-sensitive)

### Error: "Invalid date format"
- Las fechas deben estar en formato ISO 8601
- Ejemplo correcto: `"2024-11-25T10:30:00.000Z"`

### Las contraseñas no aparecen
- Verifica que el array `passwords` no esté vacío
- Comprueba que los IDs sean únicos
- Revisa la consola del navegador para errores

---

## 📞 Soporte

Para más información, consulta:
- `PASSWORD_FORM_README.md` - Documentación del formulario
- `GUIA_RAPIDA.md` - Guía rápida de uso
- Código fuente en `src/components/`

---

¡Listo para importar tus contraseñas! 🎉
