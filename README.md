# 🔐 Password Manager PWA

Una **Progressive Web App (PWA)** completa para gestión de contraseñas con cifrado end-to-end, autenticación biométrica, y soporte offline.

![Security](https://img.shields.io/badge/Security-AES--256--GCM-green)
![PWA](https://img.shields.io/badge/PWA-Ready-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18.2-blue)

## ✨ Características Principales

### 🔒 Seguridad (Core)
- ✅ **Cifrado E2E** con AES-256-GCM y clave maestra
- ✅ **Generador de contraseñas** con opciones personalizables
- ✅ **Análisis de fortaleza** con zxcvbn
- ✅ **Detección de filtraciones** vía API HIBP (Have I Been Pwned)
- ✅ **2FA/MFA** con TOTP y códigos de recuperación
- ✅ **Autenticación biométrica** con WebAuthn
- ✅ **Derivación de claves** con PBKDF2 (600,000 iteraciones)
- ✅ **Exportación QR cifrada** para respaldo offline

### 📱 Experiencia de Usuario
- ✅ **Dashboard intuitivo** con búsqueda y filtros
- ✅ **Sistema de etiquetas** para organización
- ✅ **PWA completa** con soporte offline (IndexedDB)
- ✅ **Responsive design** con Tailwind CSS
- ✅ **Internacionalización** (Español/Inglés)
- ✅ **Modo oscuro** automático

### 🔄 Importación/Exportación
- ✅ **Formatos múltiples**: JSON, CSV
- ✅ **Código QR cifrado** para transferencias seguras
- ✅ **Verificación de integridad** con checksums
- ✅ **Respaldos automáticos** locales

### 🛡️ Características Avanzadas
- ✅ **Informes de seguridad**: contraseñas débiles, reutilizadas, comprometidas
- ✅ **Logs de auditoría** completos
- ✅ **Bloqueo automático** por inactividad
- ✅ **Limpiar portapapeles** automáticamente

## 🏗️ Arquitectura

```
/password-manager
├── src/
│   ├── components/          # Componentes React
│   │   ├── auth/           # Login, Register
│   │   ├── Dashboard.tsx   # Vista principal
│   │   ├── Layout.tsx      # Layout con navegación
│   │   ├── PasswordGenerator.tsx
│   │   ├── SecurityReport.tsx
│   │   ├── Settings.tsx
│   │   └── ImportExport.tsx
│   ├── crypto/             # Módulos de cifrado
│   │   ├── encryption.ts   # AES-256-GCM, PBKDF2
│   │   └── passwordGenerator.ts
│   ├── services/           # Servicios de negocio
│   │   ├── auth.ts        # Autenticación y sesiones
│   │   ├── database.ts    # IndexedDB wrapper
│   │   ├── hibp.ts        # Have I Been Pwned API
│   │   └── importExport.ts # Import/Export + QR
│   ├── types/             # TypeScript types
│   ├── locales/           # i18n (es, en)
│   ├── App.tsx
│   ├── main.tsx
│   ├── i18n.ts
│   └── index.css
├── public/
│   └── manifest.json      # PWA manifest
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## 🚀 Instalación y Uso

### Requisitos
- Node.js 18+
- npm o yarn

### Pasos

1. **Instalar dependencias**
```bash
npm install
```

2. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `https://localhost:3000` (HTTPS requerido para WebAuthn).

3. **Compilar para producción**
```bash
npm run build
```

4. **Vista previa de producción**
```bash
npm run preview
```

## 🔐 Seguridad

### Cifrado
- **Algoritmo**: AES-256-GCM (authenticated encryption)
- **Derivación de claves**: PBKDF2 con 600,000 iteraciones (OWASP 2023)
- **IV único**: Generado criptográficamente para cada operación
- **No extracción**: Las claves maestras no son extraíbles de la Web Crypto API

### Almacenamiento
- **Local only**: Todos los datos se almacenan localmente en IndexedDB
- **Zero-knowledge**: La contraseña maestra nunca se envía ni almacena
- **Cifrado en reposo**: Todas las contraseñas se cifran con la clave maestra

### Autenticación
- **2FA TOTP**: Compatible con Google Authenticator, Authy, etc.
- **WebAuthn**: Soporte para Face ID, Touch ID, Windows Hello
- **Códigos de recuperación**: 8 códigos de respaldo de un solo uso
- **Sesiones temporales**: Expiración automática después de 12 horas

### Privacidad
- **k-Anonymity**: HIBP checks solo envían 5 caracteres del hash
- **Sin telemetría**: No se recopilan datos de uso
- **Sin conexión a internet**: Funciona completamente offline

## 📊 API Integrations

### Have I Been Pwned (HIBP)
- Verifica contraseñas contra +11 billones de credenciales filtradas
- Usa k-anonymity para proteger privacidad
- Caché local para reducir llamadas a API

## 🌐 Internacionalización

Idiomas soportados:
- 🇪🇸 Español (por defecto)
- 🇺🇸 English

Agregar más idiomas en `/src/locales/`.

## 🎨 Personalización

### Temas
La aplicación detecta automáticamente el tema del sistema (claro/oscuro) usando `prefers-color-scheme`.

### Configuración de usuario
- Timeout de bloqueo automático
- Tiempo para limpiar portapapeles
- Requerir contraseña maestra al copiar
- Mostrar indicador de fortaleza

## 📱 PWA Features

- ✅ **Instalable**: Agregar a pantalla de inicio
- ✅ **Offline-first**: Funciona sin conexión
- ✅ **Service Worker**: Caché de recursos estáticos
- ✅ **Manifest**: Iconos y configuración PWA

## 🧪 Testing

### Tests unitarios
```bash
npm test
```

### Tests E2E (Cypress)
```bash
npm run test:e2e
```

## 🔄 Roadmap Futuro

- [ ] Compartir contraseñas con otros usuarios (P2P)
- [ ] Sincronización en la nube cifrada (Google Drive, OneDrive)
- [ ] Extensión de navegador para auto-fill
- [ ] Aplicación móvil nativa (React Native)
- [ ] Modo equipo/organizacional
- [ ] Generador de passphrases mejorado
- [ ] Soporte para YubiKey
- [ ] Verificación de DNS para detección de phishing

## 📄 Licencia

MIT License - Consulta el archivo LICENSE para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## ⚠️ Disclaimer

Esta aplicación es un proyecto educativo/MVP. Para uso en producción con datos críticos, se recomienda:
- Auditoría de seguridad profesional
- Penetration testing
- Revisión de código por expertos en criptografía
- Cumplimiento con estándares ISO 27001, SOC 2, etc.

## 📞 Soporte

Para reportar bugs o solicitar features, abre un [issue](https://github.com/tu-usuario/password-manager/issues).

---

**Desarrollado con ❤️ usando React, TypeScript, y Web Crypto API**
