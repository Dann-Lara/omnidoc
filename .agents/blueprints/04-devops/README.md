# 04-DevOps - Configuración de Desarrollo y Producción

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Módulo** | DevOps |
| **Estado** | ✅ Completado |
| **Última actualización** | 2026-04-08 |

---

## 🎯 Propósito

Documentar la configuración de Docker, servicios del proyecto, y preparación para producción.

---

## 📁 Estructura de Archivos

```
infra/
└── docker/
    └── docker-compose.yml        # Servicios locales
```

---

## 📋 Blueprint Index

| # | Archivo | Descripción | Estado |
|---|---------|-------------|--------|
| 01 | [01-docker/README.md](./01-docker/README.md) | Docker Compose actual | ✅ |
| 02 | [02-future/README.md](./02-future/README.md) | Configuración producción | ⏳ |

---

## 🐳 Servicios Actuales

| Servicio | Imagen | Puerto | Propósito |
|----------|--------|--------|-----------|
| **postgres** | supabase/postgres:15.6.1.117 | 5432 | Base de datos |
| **auth** | supabase/gotrue:v2.155.0 | 9999 | Autenticación |
| **nginx** | nginx:alpine | 9999 | Reverse proxy |
| **redis** | redis:7-alpine | 6379 | Cache y sesiones |

---

## 🔧 Scripts de Docker

```bash
# Iniciar servicios
pnpm docker:up

# Detener servicios
pnpm docker:down

# Ver logs
pnpm docker:logs
```

---

## 🔗 Dependencias

```
00-GLOBAL ✅
    │
    └── 04-DEVOPS (este blueprint)
          └── Skills de docker cuando sea necesario
```

---

## 📝 Notas Importantes

- El entorno local usa Docker para emulatear servicios de producción
- Supabase GoTrue emula el auth de Supabase
- PostgreSQL 15 con configuración de Supabase
- Redis para caching futuro

---

## 🔭 Siguiente Step

**Post-Desarrollo:**
- [02-future/README.md](./02-future/README.md) → Configuración de producción
- Dockerfile para API
- Dockerfile para Web
- CI/CD pipelines