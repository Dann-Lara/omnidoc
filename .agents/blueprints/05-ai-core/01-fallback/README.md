# 01-Fallback Chain - Lógica de Fallback

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 05-ai-core/01-fallback |
| **Estado** | ⏳ Pendiente |

---

## 🎯 Propósito

Documentar implementación de fallback chain para múltiples proveedores de IA.

---

## 📋 Proveedores Soportados

| Proveedor | Orden | Descripción |
|----------|-------|--------------|
| openai | 1 (primary) | GPT-4, GPT-4o |
| anthropic | 2 | Claude 3.5, Claude 3 |
| google | 3 | Gemini Pro, Flash |
| local | 4 (ultimo) | Ollama, LM Studio |

---

## 📋 Implementación

### Configuración de Proveedores

```typescript
interface AIProvider {
  name: string
  priority: number
  enabled: boolean
  apiKey: string
  baseUrl?: string
}

const providers: AIProvider[] = [
  { name: 'openai', priority: 1, enabled: true, apiKey: process.env.OPENAI_API_KEY },
  { name: 'anthropic', priority: 2, enabled: true, apiKey: process.env.ANTHROPIC_API_KEY },
  { name: 'google', priority: 3, enabled: true, apiKey: process.env.GOOGLE_AI_KEY },
  { name: 'local', priority: 4, enabled: process.env.LOCAL_AI_ENABLED === 'true', apiKey: '' },
]
```

###Fallback Logic

```typescript
async function generateWithFallback(prompt: string, context?: unknown): Promise<string> {
  const enabledProviders = providers
    .filter(p => p.enabled)
    .sort((a, b) => a.priority - b.priority)

  for (const provider of enabledProviders) {
    try {
      const response = await callProvider(provider, prompt, context)
      return response
    } catch (error) {
      console.warn(`Provider ${provider.name} failed:`, error.message)
      // Log para monitoring
      continue // Try next provider
    }
  }
  
  throw new Error('All AI providers exhausted')
}
```

---

## 📋 Errores a Manejar

| Error | Acción |
|-------|--------|
| Rate limit | Intentar siguiente provider |
| Timeout | Intentar siguiente provider |
| Invalid API key | Deshabilitar provider, siguiente |
| Server error | Intentar siguiente provider |
| Network error | Intentar siguiente provider |

---

## 📝 Notas

- Implementación pendiente cuando se desarrolle AI Core
- Requires API keys en .env