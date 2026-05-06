# 06-Security - Reglas de Seguridad Globales

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 00-global/06-security |
| **Estado** | ✅ Completado |

> **Nota:** Este documento complementa la skill `security-best-practices`. Se recomienda revisar ambas referencias.

---

## 🎯 Propósito

Establecer las reglas de seguridad obligatorias para todo el proyecto. Estas reglas deben seguirse en TODOS los módulos (auth, admin, tenant, api, etc).

---

## 🔒 Reglas de Seguridad Obligatorias

### 1. Variables de Entorno

```bash
# ✅ CORRECTO - Usar process.env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY

# ❌ INCORRECTO - Nunca hardcodear
const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

| Regla | Descripción |
|-------|-------------|
| NO hardcodear secrets | Nunca poner API keys, passwords, tokens en código |
| Usar `.env.local` | Las variables van en archivos .env nunca commitear |
| Validar presencia | Al iniciar, verificar que las variables requeridas existan |
| Prefijo `NEXT_PUBLIC_` | Solo para vars que pueden exponerse al cliente |

### 2. Archivos a Ignorar (.gitignore)

```
# Environment
.env
.env.local
.env.production
*.env

# Secrets
*.pem
*.key
service-account.json
```

### 3. Autenticación

| Regla | Descripción |
|-------|-------------|
| Tokens en cookies | Preferir HttpOnly cookies para access tokens |
| No localStorage para secrets | localStorage es vulnerable a XSS |
| CSRF protection | Verificar CSRF tokens en POST/PUT/DELETE |
| Rate limiting | Limitar requests para evitar brute force |
| Session timeout | Tokens deben expirar |

### 4. Validación de Inputs

```typescript
// ✅ CORRECTO - Validar siempre
@Post('login')
async login(@Body() body: LoginDto) {
  const validated = loginSchema.parse(body)
  // ...
}

// ❌ INCORRECTO - Usar datos directamente
const { email, password } = req.body // Sin validación
```

| Regla | Descripción |
|-------|-------------|
| Validar DTOs | Usar class-validator o zod para todos los inputs |
| Sanitizar | Limpiar datos antes de usarlos en queries |
| Tipos estrictos | No usar `any`, siempre tipar |

### 5. Base de Datos

```typescript
// ✅ CORRECTO - Usar parameterized queries
await prisma.user.findMany({
  where: { email: userInput } // Prisma sanitiza automáticamente
})

// ❌ INCORRECTO - SQL injection vulnerable
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`
```

| Regla | Descripción |
|-------|-------------|
| Usar ORM | Prisma sanitiza queries automáticamente |
| RLS activo | Row Level Security en Supabase |
| Mínimos privilegios | Cada service tener su propio rol |

### 6. API Security

```typescript
// ✅ CORRECTO - Headers de seguridad
@UseGuards(AuthGuard)
async create(@Req() req: Request) {
  // Verificar que el usuario tiene permisos
}
```

| Regla | Descripción |
|-------|-------------|
| Authentication | Todos los endpoints sensibles requieren auth |
| Authorization | Verificar permisos antes de acciones |
| HTTPS solo | En producción, solo HTTPS |
| CORS restrictivo | No usar `*`, especificar orígenes |

---

## 🔧 Configuración de Seguridad

### Variables Requeridas

```env
# API (apps/api/.env)
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=sk_...
JWT_SECRET=min-32-characters-secret-key

# Web (apps/web/.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
```

### Headers de Seguridad (nginx/proxy)

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

---

## 📋 Checklist de Seguridad por Módulo

### Antes de commitear código:

- [ ] No hay API keys hardcodeadas
- [ ] No hay passwords en código
- [ ] Todas las inputs tienen validación
- [ ] Las queries usan ORM o parameterized queries
- [ ] Los endpoints sensibles tienen auth
- [ ] .env está en .gitignore

### En revisión de código:

- [ ] Revisar con security-best-practices skill
- [ ] Verificar que no haya SQL injection
- [ ] Verificar que no haya XSS vulnerabilidades
- [ ] Verificar que las cookies sean HttpOnly

---

## 🔗 Dependencias

- [Skill: security-best-practices](../skills/security-best-practices/SKILL.md)
- [05-skills.md](./05-skills.md) - Skills disponibles

---

## 📝 Notas Importantes

1. **ZERO TRUST** - No confiar en ninguna input del usuario
2. **DEFENSE IN DEPTH** - Múltiples capas de seguridad
3. **SECURITY BY DEFAULT** - La opción más segura debe ser la default

---

## ✅ Criterios de Aceptación

- [x] Reglas de variables de entorno documentadas
- [x] Validación de inputs obligatorias
- [x] Seguridad de base de datos establecida
- [x] Checklist de seguridad por módulo

---

## 🔭 Siguiente Step

[01-auth/README.md](../01-auth/README.md) → Módulo de autenticación (debe seguir estas reglas de security)