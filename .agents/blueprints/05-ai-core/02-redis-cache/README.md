# 02-Redis Cache - Cache con Redis

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 05-ai-core/02-redis-cache |
| **Estado** | ⏳ Pendiente |

---

## 🎯 Propósito

Documentar uso de Redis para caching de respuestas de IA y rate limiting.

---

## 📋 Usos de Redis

| Uso | Descripción | TTL |
|-----|-------------|-----|
| AI Response Cache | Cachear respuestas de IA | 1-24 horas |
| Rate Limiting | Limitar requests por usuario | Por request |
| Session Cache | Cachear sessions | 1-7 días |
| Provider Health | Health check de providers | 30 segundos |

---

## 📋 Implementación de Cache

```typescript
interface CacheOptions {
  ttl: number // tiempo en segundos
  key: string
}

async function getCachedResponse(prompt: string): Promise<string | null> {
  const key = `ai:response:${hash(prompt)}`
  const cached = await redis.get(key)
  return cached || null
}

async function setCachedResponse(prompt: string, response: string, ttl: number = 3600) {
  const key = `ai:response:${hash(prompt)}`
  await redis.set(key, response, { ex: ttl })
}
```

---

## 📋 Rate Limiting

```typescript
async function checkRateLimit(userId: string): Promise<boolean> {
  const key = `ratelimit:${userId}`
  const current = await redis.incr(key)
  
  if (current === 1) {
    await redis.expire(key, 60) // Reset every minute
  }
  
  const limit = parseInt(process.env.AI_RATE_LIMIT || '10')
  return current <= limit
}
```

---

## 📋 Configuración .env

```env
# Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Rate Limits
AI_RATE_LIMIT=10
AI_RATE_LIMIT_WINDOW=60
```

---

## 📝 Notas

- Implementación pendiente
- Requiere Redis configurado (04-devops)