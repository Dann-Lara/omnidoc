# 06-Profile - Tenant Profile Page

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 06-profile/04-tenant-profile |
| **Estado** | ⏳ Pendiente |

---

## 🎯 Propósito

Refactorizar `/[slug]/profile` para:
- Quitar datos mock
- Conectar con API para load/save
- Botón "Editar Identidad" navega a página de edición (no modal)

---

## 🔄 Cambios Requeridos

### Rutas

| Ruta Actual | Ruta Nueva | Descripción |
|-------------|------------|-------------|
| `/[slug]/profile` | `/[slug]/profile` | Ver perfil (lectura) |
| - | `/[slug]/profile/edit` | Editar identidad |

### Actual vs Nuevo

| Sección | Actual | Nuevo |
|----------|--------|-------|
| Datos usuario | Mock | Datos de BD |
| Editar | Botón sin acción | Navega a /edit |
| Clinic Identity | Mock org name | Datos reales org |
| Subscription | Mock | Datos reales |
| Team | Mock | Datos reales |
| Security | Mock | **MOVER a /audits** |

---

## 📋 Campos a Editar (página /edit)

| Campo | Editable | Notas |
|-------|----------|-------|
| firstName | ✅ Sí | |
| lastName | ✅ Sí | |
| specialty | ✅ Sí |Lista de especialidades |
| orgName | ✅Sí | Nombre de organización |
| orgType | ❌ Solo lectura | INDIVIDUAL o CLINIC |
| avatar | ✅ Sí | Base64 |
| email | ❌ Solo lectura | Viene de Supabase |

---

## 🎨 UX/UI - Página Ver Perfil

```
┌─────────────────────────────────────────────────────────────┐
│  [Badge: Clinic Admin]  [Nombre Completo]                  │
│                        [Org Name]                            │
│  [Botón: Settings]    [Botón: Editar Identidad]             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Clinic      │ │ Subscription │ │ Team        │           │
│  │ Identity    │ │ Status      │ │ Summary    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  [Security Vault Section]  [Handshake Protocol]             │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 UX/UI - Página Editar

```
┌─────────────────────────────────────────────────────────────┐
│  ← Volver    [Title: Editar Identidad]   [Guardar]         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐                                               │
│  │  AVATAR  │   [Cambiar foto]                              │
│  │ (edit)   │                                               │
│  └──────────┘                                               │
├─────────────────────────────────────────────────────────────┤
│  [Datos Personales]                                         │
│  - Nombre [input]                                           │
│  - Apellido [input]                                         │
│  - Especialidad [select]                                    │
│  - Email [input disabled]                                   │
├─────────────────────────────────────────────────────────────┤
│  [Datos de la Organización]                                  │
│  - Nombre de la Clínica [input]                            │
│  - Tipo [badge: INDIVIDUAL/CLINIC]                          │
├─────────────────────────────────────────────────────────────┤
│  [Metadata] (solo lectura)                                 │
│  - Tenant ID                                                │
│  - Fecha de creación                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Integración API

### GET /profile/me

```typescript
// Cargar datos al entrar
const response = await fetch(`${API_URL}/profile/me`, {
  credentials: 'include',
})
const { user, organization } = await response.json()
```

### PUT /profile/me

```typescript
const handleSave = async () => {
  await fetch(`${API_URL}/profile/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(formData),
  })
  router.push(`/${slug}/profile`)
}
```

---

## ⚠️ Respuestas

1. **orgName editable**: ✅ Sí
2. **orgType editable**: ✅ Sí, pero mostrar warning: "Cambiar de tipo puede afectar tu suscripción"
3. **specialty**: ✅ Solo el cliente tenant admin (isTenantAdmin = true)

---

## ⚠️ Layout - FixSlug

El layout actual muestra el **slug** en lugar del **orgName**. Hay que ajustar para mostrar `organization.name`.

```typescript
// En layout.tsx del tenant
const orgName = user?.organization?.name || slug
// No: slug.toUpperCase()
// Sí: orgName
```

---

## ✅ Criterios de Aceptación

- [ ] /[slug]/profile muestra datos reales
- [ ] Botón "Editar Identidad" navega a /edit
- [ ] /[slug]/profile/edit permite editar campos
- [ ] Guardar redirige de vuelta a perfil
- [ ] Avatar se puede cambiar
- [ ] Errores de red se manejan gracefully
