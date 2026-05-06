# 05-AI-Core - Sistema de Inteligencia Artificial

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Módulo** | AI Core |
| **Estado** | 🔄 En Desarrollo |
| **Última actualización** | 2026-04-08 |

---

## 🎯 Propósito

Documentar el sistema de IA con fallback chain multiple providers y caching/redis para garantizar alta disponibilidad y rendimiento óptimo.

---

## 📋 Blueprint Index

| # | Archivo | Descripción | Estado |
|---|---------|-------------|--------|
| 01 | [01-fallback/README.md](./01-fallback/README.md) | Fallback chain logic | ⏳ |
| 02 | [02-redis-cache/README.md](./02-redis-cache/README.md) | Redis para caching | ⏳ |
| 03 | [03-env/README.md](./03-env/README.md) | Multiple AI API keys | ⏳ |

---

## 🔗 Dependencias

```
00-GLOBAL ✅
    │
    └── 05-AI-CORE (este blueprint)
          ├── Redis (04-devops)
          └── API keys (environment)
```

---

## 🎯 Concepto Básico

### Fallback Chain

El sistema de IA usa un patrón de fallback chain para garantizar que SIEMPRE haya una respuesta:

```typescript
// Ejemplo de fallback chain
const aiProviders = [
  'openai',      // Primary
  'anthropic',    // Fallback 1
  'google',      // Fallback 2
  'local'        // Ultimate fallback (local model)
]

async function generateWithFallback(prompt: string) {
  for (const provider of aiProviders) {
    try {
      return await provider.generate(prompt)
    } catch (error) {
      console.log(`${provider} failed: ${error.message}, trying next...`)
      continue  // Try next provider
    }
  }
  throw new Error('All AI providers failed')
}
```

### Redis Caching

- Las respuestas se cachean en Redis para evitar llamadas repetidas
- TTL configurable por tipo de consulta
- Cache invalidation cuando hay updates

### Multiple API Keys

- Múltiples API keys configuradas en `.env`
- Si una key fails, se usa la siguiente
- Balanceo de carga entre keys

---

## 📝 Notas

- Este blueprint se completará cuando se implemente el AI Core
- Requiere Redis configurado (04-devops)
- Multiple API keys requeridas en environment

---

## 🔭 Siguiente Step

Cuando esté implementado:
- Agregar endpoints en API
- Integrar con Appointments module
- Integrar con Analytics