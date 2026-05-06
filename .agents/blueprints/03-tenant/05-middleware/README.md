# 05-Middleware - Rutas Protegidas del Tenant

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 03-tenant/05-middleware |
| **Estado** | ✅ Completado |

---

## 🎯 Propósito

Documentar cómo el middleware de Next.js protege las rutas del tenant y qué consideraciones hay después del refactor de auth.

---

## 📁 Archivo Principal

```
apps/web/src/middleware.ts
```

---

## 🔧 Configuración Actual

```typescript
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const protectedPaths = ['/admin']
  const authPaths = ['/login', '/signup']
  
  const isProtected = 
    protectedPaths.some(p => pathname.startsWith(p)) ||
    /^\/[^/]+\/dashboard$/.test(pathname)
  
  const isAuthPage = authPaths.some(p => pathname === p)

  if (isProtected) {
    const accessToken = request.cookies.get('sb-access-token')?.value
    const refreshToken = request.cookies.get('sb-refresh-token')?.value

    if (!accessToken && !refreshToken) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  if (isAuthPage) {
    const accessToken = request.cookies.get('sb-access-token')?.value
    if (accessToken) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}
```

---

## 🔐 Rutas Protegidas

| Patrón | Descripción | Ejemplo |
|--------|-------------|---------|
| `/admin` | Dashboard admin | `/admin`, `/admin/profile` |
| `/^/[^/]+/dashboard$` | Dashboard tenant | `/clinic/dashboard` |

**Nota:** La regex `^\/[^/]+\/dashboard$` solo captura `/slug/dashboard` exacto, NO `/slug/dashboard/calendar`, `/slug/dashboard/metrics`, etc.

---

## ⚠️ Consideraciones Post-Refactor Auth

Después de implementar HttpOnly cookies (blueprint 01-auth/04-refactor):

### 1. Cookies son HttpOnly
- El middleware puede leerlas (no es JavaScript del cliente)
- Las cookies se envían automáticamente en cada request
- ✅ Funciona correctamente

### 2. Verificación de Logout
- Cuando el usuario hace logout, las cookies deben invalidarse
- El backend debe setear cookies con maxAge=0 o già expirar
- ✅ Agregar al checklist del refactor

### 3. Rutas de Tenant a Proteger

Actualmente solo `/[slug]/dashboard` está protegido. Agregar:

```typescript
// Pattern mejorado
const isProtected = 
  protectedPaths.some(p => pathname.startsWith(p)) ||
  /^\/[^/]+\/dashboard/.test(pathname) ||  // CAMBIO: quitar $ al final
  /^\/[^/]+$/.test(pathname)                 // NUEVO: ruta base del tenant
```

### 4. Auth Pages Redirect
- `/login` y `/signup` redireccionan a `/admin` si ya hay cookie
- Esto funciona con HttpOnly cookies

---

## 📝 Checklist para Post-Refactor

```markdown
### Middleware Verification
- [ ] Verificar que lee HttpOnly cookies correctamente
- [ ] Proteger /[slug]/dashboard/calendar
- [ ] Proteger /[slug]/dashboard/metrics
- [ ] Proteger /[slug]/dashboard/team
- [ ] Proteger /[slug]/dashboard/settings
- [ ] Proteger /[slug]/profile
- [ ] Testear logout limpia cookies
```

---

## ✅ Criterios de Aceptación

- [x]Middleware protege rutas de admin
- [x] Middleware protege /[slug]/dashboard
- [ ] Rutas /[slug]/dashboard/* protegidas (pendiente)
- [ ] Rutas /[slug]/profile protegidas (pendiente)
- [ ] Auth pages redireccionan si hay cookie

---

## 🔗 Dependencias

- [01-auth/04-refactor.md](../01-auth/04-refactor.md) - Refactor de auth
- [06-security.md](../00-global/06-security.md) - Reglas de seguridad