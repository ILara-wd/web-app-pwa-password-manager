# Guía de Seguridad

## 🔒 Principios de Seguridad Implementados

### 1. Cifrado End-to-End (E2E)

#### AES-256-GCM
- **Algoritmo**: AES-256 en modo GCM (Galois/Counter Mode)
- **Ventajas**:
  - Authenticated encryption (integridad + confidencialidad)
  - Resistente a padding oracle attacks
  - Paralelizable (mejor rendimiento)
  
#### Derivación de Claves (PBKDF2)
```typescript
Configuración:
- Iteraciones: 600,000 (OWASP 2023)
- Hash: SHA-256
- Salt: 128 bits (16 bytes)
- Output: 256 bits (clave AES-256)
```

**Justificación del número de iteraciones**:
- OWASP recomienda mínimo 600,000 para PBKDF2-SHA256
- Balance entre seguridad y UX (< 1 segundo en hardware moderno)
- Protección contra ataques de fuerza bruta

### 2. Arquitectura Zero-Knowledge

```
Usuario → Contraseña Maestra → PBKDF2 → Clave de Cifrado
                                            ↓
                              Cifrado Local (IndexedDB)
                                            ↓
                                    Nunca sale del dispositivo
```

**Garantías**:
- ✅ La contraseña maestra nunca se transmite
- ✅ No hay servidores que puedan ser comprometidos
- ✅ Solo el usuario puede descifrar sus datos

### 3. Protección contra Ataques Comunes

#### XSS (Cross-Site Scripting)
- ✅ React escapa automáticamente el contenido
- ✅ CSP (Content Security Policy) headers
- ✅ No uso de `dangerouslySetInnerHTML`

#### CSRF (Cross-Site Request Forgery)
- ✅ No aplica (sin backend)
- ✅ SameSite cookies para futuras integraciones

#### Timing Attacks
- ✅ Comparaciones de hash en tiempo constante
- ✅ Validación TOTP con ventana de ±1

#### Brute Force
- ✅ PBKDF2 con alto número de iteraciones
- ✅ Entropy mínimo requerido para contraseña maestra
- ✅ Bloqueo después de X intentos fallidos (implementar)

#### Man-in-the-Middle (MITM)
- ✅ HTTPS obligatorio (WebAuthn requirement)
- ✅ HSTS headers recomendados
- ✅ Certificate pinning (considerar para app móvil)

### 4. Almacenamiento Seguro

#### IndexedDB
```typescript
Estructura:
passwords (cifradas)
  ├── encryptedPassword: AES-256-GCM encrypted
  ├── IV: Unique per entry
  └── metadata: Sin cifrar (título, URL)

users
  ├── masterPasswordHash: PBKDF2 hash
  ├── salt: Random 128 bits
  └── settings: User preferences

auditLogs
  └── Acciones del usuario (no sensibles)
```

**Consideraciones**:
- ✅ IndexedDB NO es cifrado por defecto
- ✅ OS puede tener acceso físico al disco
- ✅ Recomendación: Cifrado de disco completo (FileVault, BitLocker)

### 5. Autenticación Multifactor

#### TOTP (Time-based OTP)
```
Algoritmo: HOTP + tiempo
Window: 30 segundos
Tolerancia: ±1 window (compensar desfase)
Hash: HMAC-SHA1 (estándar TOTP)
```

#### WebAuthn (Biometric)
- ✅ FIDO2 compliant
- ✅ Criptografía de clave pública
- ✅ Phishing-resistant
- ✅ Soporte para Touch ID, Face ID, Windows Hello

#### Códigos de Recuperación
```
Formato: 8 códigos × 8 dígitos
Almacenamiento: Hash SHA-256
Uso: Single-use (eliminados tras validación)
```

### 6. Privacy by Design

#### Have I Been Pwned (HIBP) Integration
```
Método k-Anonymity:
1. Hash SHA-1 de la contraseña
2. Enviar solo primeros 5 caracteres
3. Recibir todos los hashes con ese prefix
4. Verificar localmente si hay coincidencia
```

**Garantía**: El servidor HIBP nunca conoce la contraseña completa.

### 7. Generación de Contraseñas

#### Entropía
```javascript
Entropy = log2(charset_size ^ length)

Ejemplo:
- 16 chars, alphanumeric + symbols (94 chars)
- Entropy = log2(94^16) ≈ 105 bits
```

#### CSPRNG (Cryptographically Secure PRNG)
```typescript
crypto.getRandomValues(new Uint8Array(length))
```
- ✅ Usa fuente de entropía del OS
- ✅ No predecible
- ❌ Nunca usar `Math.random()` para seguridad

### 8. Exportación Segura

#### QR Code Encryption
```
Flujo:
1. Generar clave temporal (PBKDF2 con 100k iteraciones)
2. Cifrar datos con AES-256-GCM
3. Codificar en Base64
4. Generar QR con corrección de errores nivel H
5. QR expira en 30 días
```

**Limitaciones**:
- QR codes tienen límite de ~3KB
- Solo para respaldo de credenciales críticas
- No para exportación masiva

## 🛡️ Mejores Prácticas para Usuarios

### Contraseña Maestra
- ✅ Mínimo 12 caracteres (recomendado 16+)
- ✅ Mezcla de mayúsculas, minúsculas, números, símbolos
- ✅ No usar información personal
- ✅ No reutilizar en otros servicios
- ✅ Considerar usar passphrase (frase de 5-6 palabras)

### Gestión de Dispositivos
- ✅ Habilitar cifrado de disco (FileVault, BitLocker)
- ✅ Bloquear pantalla al ausentarse
- ✅ Activar auto-lock en la app
- ✅ No compartir el dispositivo

### Backups
- ✅ Exportar regularmente (JSON cifrado)
- ✅ Almacenar en múltiples ubicaciones
- ✅ Verificar integridad (checksum)
- ✅ Guardar códigos de recuperación 2FA

### 2FA
- ✅ Habilitar siempre que sea posible
- ✅ Guardar códigos de recuperación offline
- ✅ No screenshots de QR codes (excepto storage seguro)
- ✅ Usar app TOTP dedicada (Authy, Google Authenticator)

## 🔍 Auditoría y Compliance

### OWASP Top 10 Mitigations
- ✅ A01 Broken Access Control → Session management
- ✅ A02 Cryptographic Failures → AES-256-GCM + PBKDF2
- ✅ A03 Injection → No backend, input sanitization
- ✅ A04 Insecure Design → Security by design principles
- ✅ A05 Security Misconfiguration → Secure defaults
- ✅ A06 Vulnerable Components → Dependabot, regular updates
- ✅ A07 Auth Failures → 2FA, WebAuthn, strong passwords
- ✅ A08 Software Integrity → Checksums, SRI
- ✅ A09 Logging Failures → Audit logs implementados
- ✅ A10 SSRF → No aplica (no backend)

### GDPR Compliance
- ✅ Privacy by design
- ✅ Data minimization (solo local)
- ✅ Right to erasure (clear all data)
- ✅ No third-party tracking
- ✅ Transparent data usage

### ISO 27001 Considerations
- ✅ Access control (master password + 2FA)
- ✅ Cryptography (industry standards)
- ✅ Operations security (audit logs)
- ✅ Asset management (password inventory)

## 🚨 Threat Model

### Amenazas Mitigadas
1. ✅ **Password theft**: Cifrado E2E
2. ✅ **Phishing**: WebAuthn + 2FA
3. ✅ **Brute force**: PBKDF2 + entropy requirements
4. ✅ **MITM**: HTTPS enforcement
5. ✅ **Data breach**: Zero-knowledge architecture
6. ✅ **XSS**: React auto-escaping + CSP
7. ✅ **Credential reuse**: Password generator + breach detection

### Amenazas NO Mitigadas
1. ⚠️ **Physical access**: Device encryption required
2. ⚠️ **Keyloggers**: OS-level protection needed
3. ⚠️ **Screen capture**: OS-level protection needed
4. ⚠️ **Memory dumps**: Process isolation limited
5. ⚠️ **Rubber hose cryptanalysis**: No technical solution

## 📊 Security Testing Recommendations

### Code Review
```bash
# Static analysis
npm run lint
npm audit

# Dependency vulnerabilities
npm audit fix
```

### Penetration Testing
- [ ] OWASP ZAP automated scan
- [ ] Manual penetration testing
- [ ] Fuzzing inputs
- [ ] Timing attack analysis
- [ ] Memory leak detection

### Compliance Testing
- [ ] WCAG 2.1 accessibility
- [ ] Lighthouse security audit
- [ ] CSP validation
- [ ] HTTPS enforcement check

## 🔄 Incident Response

### Si se compromete el dispositivo:
1. Cambiar contraseña maestra inmediatamente
2. Revocar códigos de recuperación 2FA
3. Regenerar secret TOTP
4. Cambiar contraseñas almacenadas
5. Exportar y limpiar datos locales
6. Reinstalar app en nuevo dispositivo

### Si se olvida la contraseña maestra:
⚠️ **NO HAY RECUPERACIÓN POSIBLE**
- Zero-knowledge = sin backdoors
- Única opción: Restaurar desde backup
- Prevención: Guardar códigos de recuperación

## 📚 Referencias

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [NIST SP 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [Web Crypto API Spec](https://www.w3.org/TR/WebCryptoAPI/)
- [WebAuthn Spec](https://www.w3.org/TR/webauthn/)
- [HIBP API Documentation](https://haveibeenpwned.com/API/v3)

---

**Última actualización**: 2025-11-25
