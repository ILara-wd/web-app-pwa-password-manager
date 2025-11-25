# Formulario de Gestión de Contraseñas

## 📋 Descripción

Este módulo proporciona un sistema completo de gestión de contraseñas con las siguientes características:

## ✨ Características Implementadas

### 1. **Formulario de Creación/Edición**
- ✅ **Nombre/Alias** (requerido): Identificador único para la contraseña
- ✅ **Username** (requerido): Nombre de usuario o correo electrónico
- ✅ **Contraseña** (requerido): Con opción de mostrar/ocultar
- ✅ **Sitio Web** (opcional): URL del sitio web
- ✅ **Notas** (opcional): Información adicional
- ✅ **Categoría** (opcional): Clasificación predefinida
- ✅ **Favorito**: Marcar como favorito para acceso rápido

### 2. **Generador de Contraseñas Integrado**
El formulario incluye un generador avanzado con:
- 🔐 Longitud configurable (8-64 caracteres)
- 🎲 Opciones de caracteres:
  - Mayúsculas (A-Z)
  - Minúsculas (a-z)
  - Números (0-9)
  - Símbolos especiales (!@#$%^&*)
- 🚫 Excluir caracteres similares (i, I, 1, l, O, 0)
- 🚫 Excluir caracteres ambiguos
- 📝 Generador de frases de contraseña (passphrase)

### 3. **Indicador de Fortaleza**
- Análisis en tiempo real usando la librería `zxcvbn`
- Escala visual de 5 niveles (Muy débil a Muy fuerte)
- Sugerencias de mejora
- Advertencias de seguridad

### 4. **Almacenamiento Local Seguro**
- 💾 Guarda en IndexedDB usando `idb`
- 🔒 Encriptación AES-256-GCM
- 🔑 Derivación de clave maestra con PBKDF2 (600,000 iteraciones)
- 📊 Soporte para múltiples contraseñas

### 5. **Lista de Contraseñas**
- 📋 Vista de todas las contraseñas guardadas
- 🔍 Búsqueda en tiempo real
- 🏷️ Filtro por categorías
- ⭐ Sección especial para favoritos
- 📋 Copiar al portapapeles
- ✏️ Edición rápida
- 🗑️ Eliminación con confirmación

### 6. **Importación de Datos**
- 📥 Importar desde archivo JSON
- ✅ Validación de formato
- 🔄 Actualización automática de la lista

## 🎨 Componentes Creados

### `PasswordForm.tsx` (PasswordGenerator.tsx)
Formulario principal para crear/editar contraseñas con todas las características mencionadas.

```tsx
<PasswordForm 
  editId="password-id-optional"
  onSave={() => console.log('Guardado')}
  onCancel={() => console.log('Cancelado')}
/>
```

### `PasswordList.tsx`
Lista de contraseñas con búsqueda, filtros e importación.

```tsx
<PasswordList 
  onEdit={(id) => console.log('Editar:', id)}
  refreshTrigger={refreshCount}
/>
```

### `PasswordManager.tsx`
Componente principal que integra el formulario y la lista.

```tsx
<PasswordManager />
```

## 🚀 Uso

### Iniciar el servidor de desarrollo:
```bash
npm run dev
```

### Crear una nueva contraseña:
1. Click en "➕ Nueva Contraseña"
2. Llenar el formulario (campos requeridos marcados con *)
3. Opcionalmente, usar el generador de contraseñas
4. Click en "💾 Guardar"

### Generar contraseña:
1. Click en "🎲 Generar"
2. Ajustar las opciones (longitud, tipos de caracteres)
3. Click en "🔐 Generar Contraseña" o "📝 Generar Frase"
4. La contraseña se insertará automáticamente

### Ver contraseñas guardadas:
1. Click en "📋 Mis Contraseñas"
2. Usar la búsqueda o filtros de categoría
3. Click en los botones de acción (copiar, editar, eliminar)

### Importar contraseñas:
1. En la lista, click en "📥 Importar"
2. Seleccionar archivo JSON con el formato correcto
3. Las contraseñas se importarán automáticamente

## 📦 Dependencias Utilizadas

- `react` - Framework principal
- `nanoid` - Generación de IDs únicos
- `zxcvbn` - Análisis de fortaleza de contraseñas
- `idb` - Wrapper de IndexedDB
- `tailwindcss` - Estilos

## 🔐 Seguridad

- **Encriptación**: AES-256-GCM con Web Crypto API
- **Derivación de clave**: PBKDF2 con 600,000 iteraciones
- **Generación de contraseñas**: Usando `crypto.getRandomValues()` (criptográficamente seguro)
- **Almacenamiento**: IndexedDB (datos encriptados en el navegador)

## ⚠️ Notas Importantes

1. **Contraseña Maestra Temporal**: Actualmente se usa una contraseña maestra temporal (`temp-master-password`). En producción, esto debe reemplazarse con la contraseña maestra real del usuario autenticado.

2. **Descifrado**: Para mostrar contraseñas, debes implementar el descifrado usando `decryptData()` del módulo de encriptación.

3. **Formato de Importación**: El archivo JSON debe tener el siguiente formato:
```json
{
  "passwords": [
    {
      "id": "unique-id",
      "title": "Nombre",
      "username": "usuario",
      "encryptedPassword": "{\"iv\":[...],\"data\":[...]}",
      "url": "https://ejemplo.com",
      "notes": "Notas",
      "tags": ["Categoría"],
      "favorite": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## 🎯 Próximas Mejoras

- [ ] Exportación de contraseñas
- [ ] Sincronización en la nube
- [ ] Autollenado de formularios
- [ ] Generador de códigos 2FA
- [ ] Historial de cambios
- [ ] Auditoría de seguridad automática
- [ ] Compartir contraseñas de forma segura

## 📝 Licencia

MIT
