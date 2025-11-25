# Contributing to Password Manager PWA

¡Gracias por tu interés en contribuir! 🎉

## 📋 Código de Conducta

Este proyecto sigue el [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). Por favor léelo antes de contribuir.

## 🚀 Cómo Contribuir

### Reportar Bugs

1. **Verifica** que el bug no haya sido reportado ya
2. **Abre un issue** usando la plantilla de bug report
3. **Incluye**:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Información del ambiente (navegador, OS)

### Solicitar Features

1. **Verifica** que la feature no exista o esté planeada
2. **Abre un issue** usando la plantilla de feature request
3. **Describe**:
   - El problema que resuelve
   - Comportamiento deseado
   - Alternativas consideradas
   - Mockups si aplica

### Pull Requests

#### Setup del Proyecto

```bash
# Fork el repositorio
git clone https://github.com/tu-usuario/password-manager.git
cd password-manager

# Instalar dependencias
npm install

# Crear rama para tu feature
git checkout -b feature/mi-nueva-feature
```

#### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Ejecutar tests
npm test

# Ejecutar linter
npm run lint

# Build de producción
npm run build
```

#### Convenciones de Código

**TypeScript**
- Usa tipos explícitos siempre que sea posible
- Evita `any` (usa `unknown` si es necesario)
- Documenta funciones públicas con JSDoc

**React**
- Componentes funcionales con hooks
- Props tipadas con TypeScript
- Usa hooks de React para estado local
- Memoiza componentes costosos con `useMemo`/`useCallback`

**Naming Conventions**
```typescript
// Componentes: PascalCase
function PasswordCard() {}

// Funciones/variables: camelCase
const generatePassword = () => {}

// Constantes: UPPER_SNAKE_CASE
const MAX_PASSWORD_LENGTH = 128;

// Tipos/Interfaces: PascalCase
interface User {}
type PasswordStrength = 0 | 1 | 2 | 3 | 4;
```

**Estructura de Archivos**
```
src/
├── components/         # Componentes React
│   ├── Component.tsx   # Implementación
│   └── Component.test.tsx  # Tests
├── services/          # Lógica de negocio
├── crypto/            # Funciones criptográficas
├── types/             # Definiciones TypeScript
└── utils/             # Utilidades generales
```

#### Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add password strength indicator
fix: resolve encryption bug in Safari
docs: update installation guide
style: format code with prettier
refactor: simplify database service
test: add unit tests for generator
chore: update dependencies
```

Ejemplos:
```bash
git commit -m "feat: implement 2FA with TOTP"
git commit -m "fix: prevent XSS in password notes"
git commit -m "docs: add security guidelines"
```

#### Tests

**Todos los PRs deben incluir tests**

```typescript
// Ejemplo: Test unitario
describe('generatePassword', () => {
  it('should generate password with correct length', () => {
    const password = generatePassword({ length: 16 });
    expect(password).toHaveLength(16);
  });

  it('should include all character types', () => {
    const password = generatePassword({
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
    });
    
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password).toMatch(/[^A-Za-z0-9]/);
  });
});
```

#### Code Review

Tu PR será revisado considerando:
- ✅ Funcionalidad correcta
- ✅ Tests pasando
- ✅ Sin errores de lint
- ✅ Documentación actualizada
- ✅ Seguridad (si aplica)
- ✅ Performance (si aplica)
- ✅ Accesibilidad (si aplica)

#### Proceso del PR

1. **Push** tu rama
```bash
git push origin feature/mi-nueva-feature
```

2. **Abre PR** en GitHub
   - Título descriptivo
   - Descripción detallada de cambios
   - Referencias a issues relacionados
   - Screenshots/GIFs si hay cambios visuales

3. **Responde** a comentarios de revisión

4. **Merge** una vez aprobado

## 🔒 Consideraciones de Seguridad

Si descubres una vulnerabilidad de seguridad:

1. **NO abras un issue público**
2. **Envía email** a: security@ejemplo.com
3. **Incluye**:
   - Descripción de la vulnerabilidad
   - Pasos para reproducir
   - Impacto potencial
   - Sugerencias de mitigación (opcional)

Recibirás respuesta en 48 horas.

## 🎯 Áreas de Contribución

### Prioridad Alta
- [ ] Tests unitarios y E2E
- [ ] Documentación de API
- [ ] Accesibilidad (WCAG 2.1)
- [ ] Auditoría de seguridad
- [ ] Optimizaciones de performance

### Features Planificados
- [ ] Modo equipo/colaboración
- [ ] Extensión de navegador
- [ ] App móvil nativa
- [ ] Sincronización en la nube cifrada
- [ ] Soporte para YubiKey
- [ ] Importador de 1Password/LastPass

### Mejoras UX
- [ ] Onboarding interactivo
- [ ] Tour guiado de features
- [ ] Animaciones y transiciones
- [ ] Temas personalizados
- [ ] Atajos de teclado

### Internacionalización
- [ ] Más idiomas (Francés, Alemán, Portugués)
- [ ] RTL support (Árabe, Hebreo)
- [ ] Localización de fechas/números

## 📚 Recursos

### Documentación
- [README.md](./README.md) - Visión general
- [QUICKSTART.md](./QUICKSTART.md) - Guía rápida
- [SECURITY.md](./SECURITY.md) - Guía de seguridad
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Despliegue

### Tecnologías
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

### Seguridad
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security](https://web.dev/secure/)
- [Crypto Best Practices](https://github.com/veorq/cryptocoding)

## 💬 Comunicación

- **GitHub Issues**: Para bugs y features
- **GitHub Discussions**: Para preguntas y discusiones
- **Discord**: [Unirse al servidor](#) (próximamente)

## 🙏 Reconocimientos

Los contribuidores serán listados en:
- README.md
- Release notes
- Página de About en la app

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones sean licenciadas bajo la [MIT License](./LICENSE).

---

**¡Gracias por hacer este proyecto mejor! 🚀**
