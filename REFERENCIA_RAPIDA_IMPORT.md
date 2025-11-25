# 📊 Referencia Rápida - Formato JSON de Importación

## ⚡ Resumen Rápido

```json
{
  "passwords": [
    {
      "id": "único-id",
      "title": "Nombre de la contraseña",
      "username": "usuario@email.com",
      "encryptedPassword": "{\"iv\":\"base64string\",\"data\":\"base64string\"}",
      "url": "https://ejemplo.com",
      "notes": "Notas opcionales",
      "tags": ["Categoría"],
      "favorite": true,
      "createdAt": "2024-11-25T10:00:00.000Z",
      "updatedAt": "2024-11-25T10:00:00.000Z"
    }
  ]
}
```

---

## 📋 Tabla de Campos

| Campo | Obligatorio | Tipo | Ejemplo | Descripción |
|-------|-------------|------|---------|-------------|
| `id` | ✅ Sí | string | `"pwd-001"` | ID único para la contraseña |
| `title` | ✅ Sí | string | `"Gmail"` | Nombre/alias descriptivo |
| `username` | ✅ Sí | string | `"user@email.com"` | Usuario o email |
| `encryptedPassword` | ✅ Sí | string | `"{\"iv\":\"base64\",\"data\":\"base64\"}"` | Contraseña encriptada en Base64 |
| `tags` | ✅ Sí | array | `["Email"]` | Categorías (puede estar vacío `[]`) |
| `favorite` | ✅ Sí | boolean | `true` | Si es favorito |
| `createdAt` | ✅ Sí | string (ISO) | `"2024-01-15T10:30:00.000Z"` | Fecha de creación |
| `updatedAt` | ✅ Sí | string (ISO) | `"2024-01-15T10:30:00.000Z"` | Fecha de actualización |
| `url` | ⬜ No | string | `"https://gmail.com"` | Sitio web |
| `notes` | ⬜ No | string | `"Cuenta principal"` | Notas adicionales |

---

## 🏷️ Categorías Válidas

```
✓ "Social Media"    ✓ "Banking"       ✓ "Email"
✓ "Work"            ✓ "Shopping"      ✓ "Entertainment"
✓ "Health"          ✓ "Education"     ✓ "Travel"
✓ "Other"
```

---

## 📁 Archivos Incluidos

| Archivo | Descripción |
|---------|-------------|
| `example-import.json` | 7 contraseñas de ejemplo completas |
| `template-import.json` | Plantilla limpia para personalizar |
| `generate-import-json.js` | Script helper para generar JSON |
| `FORMATO_IMPORTACION.md` | Documentación completa |

---

## 🚀 Pasos Rápidos para Importar

```
1. Edita template-import.json con tus datos
2. Guarda el archivo
3. App → "📋 Mis Contraseñas" → "📥 Importar"
4. Selecciona tu archivo JSON
5. ¡Listo! ✅
```

---

## ⚠️ Recordatorios Importantes

- ✅ Los IDs deben ser únicos
- ✅ Las fechas deben ser ISO 8601 (formato UTC)
- ✅ `encryptedPassword` debe estar en el formato correcto
- ✅ Verifica tu JSON en [jsonlint.com](https://jsonlint.com/)
- ⚠️ NO uses contraseñas en texto plano en archivos
- ⚠️ Elimina archivos de importación después de usar

---

## 💡 Ejemplos Rápidos

### Mínimo (solo campos obligatorios)
```json
{
  "passwords": [{
    "id": "1",
    "title": "Test",
    "username": "user",
    "encryptedPassword": "{\"iv\":\"kUNZDCQmTg==\",\"data\":\"F01pKDQmTl5SIiw4Rl5SIiwzNzg5MTI=\"}",
    "tags": [],
    "favorite": false,
    "createdAt": "2024-11-25T10:00:00.000Z",
    "updatedAt": "2024-11-25T10:00:00.000Z"
  }]
}
```

### Completo (todos los campos)
```json
{
  "passwords": [{
    "id": "gmail-001",
    "title": "Gmail Personal",
    "username": "yo@gmail.com",
    "encryptedPassword": "{\"iv\":\"kUNZDCQmTg==\",\"data\":\"F01pKDQmTl5SIiw4Rl5SIiwzNzg5MTI=\"}",
    "url": "https://gmail.com",
    "notes": "Mi cuenta principal",
    "tags": ["Email"],
    "favorite": true,
    "createdAt": "2024-11-25T10:00:00.000Z",
    "updatedAt": "2024-11-25T10:00:00.000Z"
  }]
}
```

---

## 🔧 Comandos Útiles

### Validar JSON
```bash
# Usando Node.js
node -e "JSON.parse(require('fs').readFileSync('tu-archivo.json', 'utf8'))"
```

### Generar JSON con el script
```bash
node generate-import-json.js > mis-passwords.json
```

### Ver estructura
```bash
cat example-import.json | python -m json.tool
```

---

## 📞 Más Información

- 📖 Documentación completa: `FORMATO_IMPORTACION.md`
- 🎯 Guía de uso: `GUIA_RAPIDA.md`
- 📝 Formulario: `PASSWORD_FORM_README.md`

---

✨ **¡Todo listo para importar!** ✨
