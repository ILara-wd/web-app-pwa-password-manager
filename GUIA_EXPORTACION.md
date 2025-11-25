# 📤 Guía de Exportación de Contraseñas

## ✨ Nueva Funcionalidad: Exportar Contraseñas

Se ha agregado la capacidad de exportar tus contraseñas en formato JSON para crear respaldos o migrar a otro dispositivo.

---

## 🚀 Cómo Exportar

### Paso 1: Acceder a la Lista
1. Ve a **"📋 Mis Contraseñas"**
2. Verás un nuevo botón **"📤 Exportar"** en la parte superior derecha

### Paso 2: Abrir el Modal de Exportación
1. Click en **"📤 Exportar"**
2. Se abrirá un modal con opciones de exportación

### Paso 3: Seleccionar Tipo de Exportación

#### Opción 1: Exportar Todas las Contraseñas
```
📤 Exportar Todas (X)
```
- Exporta **todas** las contraseñas guardadas
- Sin importar filtros o búsquedas activas
- Archivo completo de respaldo

#### Opción 2: Exportar Contraseñas Filtradas
```
🔍 Exportar Filtradas (X)
```
- Solo aparece si tienes filtros o búsqueda activa
- Exporta **únicamente** las contraseñas visibles
- Útil para exportar por categoría o búsqueda específica

---

## 📊 Estadísticas del Modal

El modal te muestra:
- **Total de contraseñas**: Todas las que tienes guardadas
- **Contraseñas filtradas**: Las que coinciden con tu búsqueda/filtro
- **Búsqueda activa**: Si hay texto en el campo de búsqueda
- **Categoría**: Si hay una categoría seleccionada

---

## 📁 Formato del Archivo Exportado

### Nombre del Archivo
```
passwords-backup-YYYY-MM-DD.json
```
O si es filtrado:
```
passwords-filtered-YYYY-MM-DD.json
```

Ejemplo: `passwords-backup-2024-11-25.json`

### Estructura del JSON
```json
{
  "passwords": [
    {
      "id": "abc123",
      "title": "Gmail",
      "username": "usuario@gmail.com",
      "encryptedPassword": "{\"iv\":[...],\"data\":[...]}",
      "url": "https://gmail.com",
      "notes": "Mi cuenta principal",
      "tags": ["Email"],
      "favorite": true,
      "createdAt": "2024-11-25T10:00:00.000Z",
      "updatedAt": "2024-11-25T10:00:00.000Z"
    }
  ],
  "exportedAt": "2024-11-25T15:30:00.000Z",
  "version": "1.0",
  "totalPasswords": 1
}
```

### Campos Adicionales en Exportación Filtrada
```json
{
  "passwords": [...],
  "exportedAt": "2024-11-25T15:30:00.000Z",
  "version": "1.0",
  "totalPasswords": 5,
  "filters": {
    "searchQuery": "gmail",
    "category": "Email"
  }
}
```

---

## 🔐 Seguridad

### ⚠️ Importante: Protección de Datos

1. **Las contraseñas están encriptadas** ✅
   - El archivo contiene contraseñas encriptadas con AES-256-GCM
   - NO son legibles en texto plano

2. **Almacenamiento Seguro** 🔒
   - Guarda el archivo en un lugar seguro
   - Considera usar almacenamiento encriptado
   - No lo compartas por email sin protección

3. **Elimina Copias Temporales** 🗑️
   - Elimina el archivo después de importarlo
   - No dejes copias en carpetas públicas
   - Usa almacenamiento en la nube con encriptación

4. **Backups Regulares** 💾
   - Exporta regularmente como respaldo
   - Guarda en múltiples ubicaciones seguras
   - Considera usar gestores de archivos encriptados

---

## 💡 Casos de Uso

### 1. Respaldo Completo
```
Uso: Crear backup de todas tus contraseñas
Opción: "📤 Exportar Todas"
Frecuencia: Semanal o mensual
```

### 2. Migración de Dispositivo
```
Uso: Transferir contraseñas a otro navegador/dispositivo
Opción: "📤 Exportar Todas"
Método: Exportar → Transferir archivo → Importar
```

### 3. Exportación Selectiva
```
Uso: Solo exportar contraseñas de trabajo
Pasos:
  1. Filtrar por categoría "Work"
  2. Click en "📤 Exportar"
  3. Seleccionar "🔍 Exportar Filtradas"
```

### 4. Compartir Contraseñas de Equipo
```
Uso: Compartir contraseñas específicas con el equipo
Pasos:
  1. Buscar las contraseñas del proyecto
  2. Exportar filtradas
  3. Compartir el archivo de forma segura
```

---

## 🔄 Flujo Completo: Exportar e Importar

### En el Dispositivo Original:
```bash
1. 📋 Ir a "Mis Contraseñas"
2. 📤 Click en "Exportar"
3. ✅ Seleccionar "Exportar Todas"
4. 💾 Guardar el archivo JSON
```

### En el Nuevo Dispositivo:
```bash
1. 📋 Ir a "Mis Contraseñas"
2. 📥 Click en "Importar"
3. 📄 Seleccionar el archivo exportado
4. ✅ Confirmar importación
```

---

## 🛠️ Características Técnicas

### Funciones Implementadas:

1. **`handleExportJSON()`**
   - Exporta todas las contraseñas
   - Incluye metadatos (fecha, versión, total)
   - Genera archivo descargable automáticamente

2. **`handleExportFiltered()`**
   - Exporta solo contraseñas filtradas
   - Incluye información de filtros aplicados
   - Nombre de archivo descriptivo

### Formato de Descarga:
- **Tipo**: `application/json`
- **Codificación**: UTF-8
- **Indentación**: 2 espacios (legible)
- **Método**: Blob + URL.createObjectURL

---

## 📋 Checklist de Exportación Segura

Antes de exportar:
- [ ] ✅ Verifica que tienes las contraseñas correctas visibles
- [ ] ✅ Decide si exportar todas o solo filtradas
- [ ] ✅ Ten preparado el destino de almacenamiento seguro

Durante la exportación:
- [ ] ✅ Espera la confirmación de descarga exitosa
- [ ] ✅ Verifica que el archivo se descargó correctamente

Después de exportar:
- [ ] ✅ Mueve el archivo a ubicación segura
- [ ] ✅ Verifica el contenido del archivo (abrirlo en editor)
- [ ] ✅ Considera encriptar el archivo con otra capa de seguridad
- [ ] ✅ Elimina copias temporales o en carpeta de descargas

---

## ⚡ Atajos Rápidos

| Acción | Pasos Rápidos |
|--------|---------------|
| Backup completo | Mis Contraseñas → Exportar → Exportar Todas |
| Exportar categoría | Filtrar categoría → Exportar → Exportar Filtradas |
| Exportar favoritos | (Funciona automáticamente con filtros) |
| Backup de búsqueda | Buscar → Exportar → Exportar Filtradas |

---

## 🐛 Solución de Problemas

### El archivo no se descarga
- Verifica permisos del navegador para descargas
- Intenta con otro navegador
- Revisa el bloqueador de pop-ups

### El archivo está vacío o corrupto
- Asegúrate de tener contraseñas guardadas
- Verifica que la exportación se completó
- Intenta exportar nuevamente

### Error al importar el archivo exportado
- Verifica que el formato JSON sea válido
- Comprueba que no se modificó el archivo
- Usa el mismo navegador para importar

---

## 📞 Información Adicional

- **Formato compatible**: JSON estándar (RFC 8259)
- **Compatibilidad**: Importable en esta misma aplicación
- **Versión**: 1.0
- **Límite de tamaño**: Sin límite (depende del navegador)

---

## 🎯 Mejores Prácticas

1. **Exporta regularmente** - Crea backups semanales
2. **Múltiples ubicaciones** - Guarda en 2-3 lugares seguros
3. **Verifica el backup** - Abre el archivo para verificar
4. **Protege el archivo** - Usa carpetas encriptadas
5. **Actualiza después de cambios** - Re-exporta tras agregar contraseñas

---

¡Tu sistema de gestión de contraseñas ahora tiene respaldo completo! 🎉

**Archivos relacionados:**
- `FORMATO_IMPORTACION.md` - Detalles del formato JSON
- `GUIA_RAPIDA.md` - Guía general de uso
- `example-import.json` - Ejemplo de formato
