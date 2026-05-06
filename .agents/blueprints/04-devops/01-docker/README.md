# 01-Docker - Configuración Docker Compose

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 04-devops/01-docker |
| **Estado** | ✅ Completado |

---

## 🎯 Propósito

Documentar la configuración actual de Docker Compose para el desarrollo local.

---

## 📁 Archivo Principal

```
infra/docker/docker-compose.yml
```

---

## 🐳 Servicios

### PostgreSQL

```yaml
postgres:
  image: supabase/postgres:15.6.1.117
  container_name: omnidoc-postgres
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    POSTGRES_DB: postgres
  ports:
    - "${POSTGRES_PORT:-5432}:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 5s
    timeout: 5s
    retries: 5
```

**Propósito:** Base de datos principal del proyecto.

---

### Auth (GoTrue)

```yaml
auth:
  image: supabase/gotrue:v2.155.0
  container_name: omnidoc-auth
  depends_on:
    postgres:
      condition: service_healthy
  environment:
    GOTRUE_API_HOST: 0.0.0.0
    GOTRUE_API_PORT: 9999
    API_EXTERNAL_URL: ${API_EXTERNAL_URL:-http://localhost:9999}
    GOTRUE_DB_DRIVER: postgres
    GOTRUE_DB_DATABASE_URL: postgres://postgres:postgres@postgres:5432/postgres
    GOTRUE_SITE_URL: ${APP_URL:-http://localhost:3000}
    GOTRUE_JWT_SECRET: ${JWT_SECRET:-change-this-secret-in-production-min-32-chars}
    GOTRUE_JWT_EXP: 3600
    GOTRUE_EXTERNAL_EMAIL_ENABLED: "true"
    GOTRUE_MAILER_AUTOCONFIRM: "true"
    GOTRUE_DISABLE_SIGNUP: "false"
    GOTRUE_URI_ALLOW_LIST: "*"
    GOTRUE_LOG_FORMAT: "json"
    GOTRUE_LOG_LEVEL: "info"
```

**Propósito:** Servidor de autenticación compatible con Supabase.

---

### Nginx (Reverse Proxy)

```yaml
nginx:
  image: nginx:alpine
  container_name: omnidoc-nginx
  depends_on:
    auth:
      condition: service_started
  ports:
    - "9999:9999"
  volumes:
    - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
```

**Propósito:** Reverse proxy para exponer servicios.

---

### Redis

```yaml
redis:
  image: redis:7-alpine
  container_name: omnidoc-redis
  ports:
    - "${REDIS_PORT:-6379}:6379"
  volumes:
    - redis_data:/data
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 5s
    timeout: 5s
    retries: 5
```

**Propósito:** Almacenamiento en cache (preparado para futuro uso).

---

## 📦 Volúmenes

```yaml
volumes:
  postgres_data:
  redis_data:
```

---

## 🔧 Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Puerto de PostgreSQL
POSTGRES_PORT=5432

# Puerto de Redis
REDIS_PORT=6379

# URL externa de la API
API_EXTERNAL_URL=http://localhost:9999

# URL de la aplicación web
APP_URL=http://localhost:3000

# JWT Secret (cambiar en producción)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

---

## 🚀 Uso

### Iniciar servicios

```bash
pnpm docker:up
```

### Ver logs

```bash
pnpm docker:logs
```

### Detener servicios

```bash
pnpm docker:down
```

---

## ✅ Criterios de Aceptación

- [x] PostgreSQL configurado
- [x] Auth (GoTrue) configurado
- [x] Nginx proxy configurado
- [x] Redis configurado
- [x] Health checks configurados
- [x] Scripts en package.json

---

## 🔗 Dependencias

- [Skill: dockerfile-optimizer](../skills/dockerfile-optimizer/SKILL.md) - Mejores prácticas Docker