# 🚀 Quick Start Guide

## Instalación en 5 Minutos

### 1. Instalar Dependencias

```bash
cd password-manager
npm install
```

### 2. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La app estará en: `https://localhost:3000`

> ⚠️ **Importante**: Debes aceptar el certificado autofirmado en tu navegador para usar WebAuthn.

### 3. Crear Tu Primera Cuenta

1. Navega a `https://localhost:3000`
2. Haz clic en "Registrarse"
3. Completa el formulario:
   - **Nombre**: Tu nombre completo
   - **Email**: usuario@ejemplo.com
   - **Contraseña Maestra**: Mínimo 12 caracteres (se mostrará indicador de fortaleza)
4. Confirma la contraseña
5. Lee el aviso de seguridad y haz clic en "Registrarse"

### 4. Tu Primera Contraseña

1. En el Dashboard, haz clic en "Nueva Contraseña"
2. Completa los campos:
   - **Título**: "Gmail"
   - **Usuario**: "tucorreo@gmail.com"
   - **Contraseña**: Usa el botón "Generar" para crear una contraseña segura
   - **URL**: "https://gmail.com"
   - **Etiquetas**: "correo, personal"
3. Haz clic en "Guardar"

### 5. Características Clave

#### 🔐 Generador de Contraseñas
```
Dashboard → Botón "Key" → Password Generator

Opciones:
- Longitud: 8-128 caracteres
- Mayúsculas, minúsculas, números, símbolos
- Excluir caracteres similares/ambiguos
- Generador de passphrases
```

#### 🛡️ Reporte de Seguridad
```
Dashboard → Botón "Shield" → Security Report

Muestra:
- Contraseñas débiles
- Contraseñas reutilizadas
- Contraseñas comprometidas (HIBP)
- Contraseñas antiguas (>90 días)
- Puntuación general de seguridad
```

#### 📤 Exportar/Importar
```
Dashboard → Botón "Download" → Import/Export

Formatos:
- JSON (cifrado o plano)
- CSV (plano)
- QR Code (cifrado)
```

#### ⚙️ Configuración
```
Dashboard → Botón "Settings" → Settings

Opciones:
- Idioma (Español/English)
- Tema (Auto/Claro/Oscuro)
- Auto-lock timeout
- 2FA/Biometric
```

## 📖 Uso Diario

### Buscar Contraseñas
```
1. Usa la barra de búsqueda en el Dashboard
2. Busca por: título, usuario, URL, notas, o etiquetas
3. Los resultados se filtran en tiempo real
```

### Copiar Contraseña
```
1. Encuentra la contraseña
2. Haz clic en el ícono "Copy"
3. La contraseña se copia al portapapeles
4. Se limpia automáticamente después de 30 segundos
```

### Organizar con Etiquetas
```
Al crear/editar una contraseña:
- Agrega etiquetas separadas por comas
- Ejemplo: "trabajo, desarrollo, github"
- Filtra por etiqueta haciendo clic en ella
```

### Marcar como Favorita
```
1. Haz clic en el ícono de estrella
2. Accede rápidamente desde "Favoritas"
```

## 🔒 Seguridad

### Habilitar 2FA

1. Ve a Settings → Security
2. Haz clic en "Habilitar 2FA"
3. Escanea el QR code con tu app TOTP (Google Authenticator, Authy)
4. Ingresa el código de verificación
5. **Importante**: Guarda los 8 códigos de recuperación en lugar seguro

### Habilitar Autenticación Biométrica

```
Requisitos:
- Dispositivo compatible (Touch ID, Face ID, Windows Hello)
- Navegador compatible (Chrome, Edge, Safari)

Pasos:
1. Settings → Security → Biometric Authentication
2. Clic en "Habilitar"
3. Sigue las instrucciones del sistema
4. Ahora puedes hacer login con tu huella/cara
```

### Verificar Contraseñas Comprometidas

```
Automático:
- Al agregar una contraseña, se verifica automáticamente

Manual:
1. Security Report → "Verificar Todas"
2. La app consulta la API HIBP usando k-anonymity
3. Te notifica si alguna está comprometida
```

## 💾 Respaldos

### Crear Respaldo Manual

```
1. Import/Export → Export
2. Selecciona formato:
   - JSON Cifrado (recomendado)
   - JSON Plano (solo para migración)
   - CSV (para importar a otros gestores)
3. Clic en "Exportar"
4. Guarda el archivo en lugar seguro
```

### Generar QR de Respaldo

```
Ideal para respaldo offline de contraseñas críticas:

1. Import/Export → QR Code
2. Selecciona las contraseñas a respaldar
3. Ingresa una contraseña para el QR
4. Genera el QR
5. Imprímelo o guárdalo offline
6. Para restaurar: Escanea el QR con la app
```

### Respaldo Automático

```
Settings → Backup → Auto Backup
- Configura frecuencia (diaria, semanal)
- Elige ubicación (local, Google Drive, OneDrive)
```

## 🌐 Uso Offline

La app funciona completamente offline:

```
✅ Ver contraseñas
✅ Agregar nuevas
✅ Editar existentes
✅ Generar contraseñas
✅ Buscar y filtrar

❌ Verificar filtraciones HIBP (requiere internet)
```

## 📱 Instalar como PWA

### En Chrome (Desktop)
1. Haz clic en el ícono de instalar en la barra de direcciones
2. Confirma la instalación
3. La app se abre como aplicación nativa

### En iOS (Safari)
1. Abre el menú Compartir
2. Selecciona "Agregar a Pantalla de Inicio"
3. Confirma

### En Android (Chrome)
1. Abre el menú (⋮)
2. Selecciona "Instalar app"
3. Confirma

## 🆘 Solución de Problemas

### "No puedo iniciar sesión"
- Verifica que la contraseña maestra sea correcta
- Si tienes 2FA, asegúrate de ingresar el código
- Intenta con un código de recuperación

### "Olvidé mi contraseña maestra"
⚠️ **No hay recuperación posible**
- Debes restaurar desde un respaldo previo
- Si no tienes respaldo, debes crear nueva cuenta

### "La app no funciona offline"
- Verifica que el Service Worker esté registrado
- Abre DevTools → Application → Service Workers
- Si no está registrado, recarga la página

### "WebAuthn no funciona"
- Verifica que estés en HTTPS
- Confirma que tu dispositivo tenga sensor biométrico
- Intenta con otro navegador compatible

### "No puedo exportar datos"
- Verifica que tengas contraseñas guardadas
- Asegúrate de tener sesión activa
- Revisa permisos de descarga del navegador

## 📞 Ayuda Adicional

### Documentación Completa
- `README.md` - Visión general
- `SECURITY.md` - Guía de seguridad detallada
- `DEPLOYMENT.md` - Guía de despliegue

### Reportar Problemas
Abre un issue en GitHub describiendo:
1. Pasos para reproducir
2. Comportamiento esperado
3. Comportamiento actual
4. Navegador y versión
5. Screenshots si aplica

## 🎯 Próximos Pasos

1. ✅ Habilita 2FA para máxima seguridad
2. ✅ Crea un respaldo y guárdalo offline
3. ✅ Migra tus contraseñas existentes
4. ✅ Ejecuta el reporte de seguridad
5. ✅ Cambia contraseñas débiles/comprometidas

---

**¡Disfruta de tu gestor de contraseñas seguro! 🔐**
