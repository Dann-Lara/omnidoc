# 03-Env Configuration - Multiple AI API Keys

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 05-ai-core/03-env |
| **Estado** | ⏳ Pendiente |

---

## 🎯 Propósito

Documentar configuración de múltiples API keys de IA en environment.

---

## 📋 Variables de Entorno

```env
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...
OPENAI_PROJECT_ID=proj-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google AI
GOOGLE_AI_KEY=AIza...
GOOGLE_PROJECT_ID=...

# Local AI (optional)
LOCAL_AI_ENABLED=false
LOCAL_AI_BASE_URL=http://localhost:11434
```

---

## 📋 Formato de API Keys Múltiples

Para usar múltiples API keys (backup):

```env
# Multiple keys (separadas por coma)
OPENAI_API_KEYS=sk-key1,sk-key2,sk-key3
ANTHROPIC_API_KEYS=sk-ant-key1,sk-ant-key2
```

### Loading Multiple Keys

```typescript
function loadApiKeys(key: string): string[] {
  const keys = process.env[key]
  if (!keys) return []
  return keys.split(',').map(k => k.trim()).filter(k => k.length > 0)
}

const openaiKeys = loadApiKeys('OPENAI_API_KEYS')
```

---

## 📋 Provider Configuration

```typescript
const providerConfigs = {
  openai: {
    keys: loadApiKeys('OPENAI_API_KEYS'),
    maxRetries: 2,
    timeout: 30000,
  },
  anthropic: {
    keys: loadApiKeys('ANTHROPIC_API_KEYS'),
    maxRetries: 2,
    timeout: 30000,
  },
  google: {
    keys: process.env.GOOGLE_AI_KEY?.split(',') || [],
    maxRetries: 2,
    timeout: 30000,
  }
}
```

---

## 📋 Security Rules

- ✅ NO hardcodear keys en código
- ✅ Usar process.env
- ✅ Keys en .env.local (no commitear)
- ✅ Rotación periódica de keys
- ✅ Monitoreo de uso por key

---

## 📝 Notas

- Implementación pendiente
- Verificar costos por provider
- Monitorear uso para balancear carga