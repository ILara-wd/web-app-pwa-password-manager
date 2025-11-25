# Guía de Despliegue

## Opciones de Hosting

### 1. Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

**Configuración en vercel.json:**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 2. Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Desplegar
netlify deploy --prod
```

**Configuración en netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. GitHub Pages

```bash
# Build
npm run build

# Desplegar (usando gh-pages)
npm i -g gh-pages
gh-pages -d dist
```

### 4. Self-Hosted (Nginx)

**nginx.conf:**
```nginx
server {
    listen 443 ssl http2;
    server_name password-manager.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/password-manager/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
}
```

## Consideraciones de Seguridad

### HTTPS Obligatorio
WebAuthn y Service Workers requieren HTTPS. Asegúrate de:
- Usar certificado SSL/TLS válido
- Redirigir HTTP a HTTPS
- Habilitar HSTS

### Headers de Seguridad
Configurar:
- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`

### Service Worker
Asegurarse que el Service Worker se sirva con:
```
Cache-Control: no-cache
```

## Variables de Entorno

Crear `.env.production`:
```env
VITE_HIBP_API_KEY=tu-api-key-aqui
VITE_DEV_MODE=false
VITE_DEBUG=false
```

## Performance

### Optimizaciones
- Minificación automática con Vite
- Code splitting por rutas
- Lazy loading de componentes
- Compresión gzip/brotli
- Cache de recursos estáticos

### Lighthouse Score Target
- Performance: 90+
- Accessibility: 100
- Best Practices: 100
- SEO: 90+
- PWA: 100

## Monitoreo

Considerar integrar:
- Sentry para error tracking
- Google Analytics / Plausible para métricas
- Uptime monitoring

## Backup y Recuperación

La aplicación es completamente client-side, pero considera:
- Documentar proceso de exportación
- Guías de recuperación para usuarios
- Sistema de códigos de recuperación 2FA

---

**Nota**: Esta es una aplicación puramente frontend. No requiere backend ni base de datos en servidor.
