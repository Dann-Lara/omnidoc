# 06-Profile - Admin Profile Page

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 06-profile/03-admin-profile |
| **Estado** | ⏳ Pendiente |

---

## 🎯 Propósito

Refactorizar `/admin/profile` para:
- Quitar datos mock y secciones de auditorías
- Conectar con API para load/save de perfil
- Mostrar datos reales del superadmin/operator

---

## 🔄 Cambios Requeridos

### Actual vs Nuevo

| Sección | Actual | Nuevo |
|----------|--------|-------|
| Datos usuario | Mock hardcoded | Datos de BD vía API |
| Avatar | Mock | Upload a API |
| Métricas/Sesiones | Mock | **MOVER a /admin/audits** |
| Sistema de seguridad | Mock toggle | **MOVER a /admin/audits** |
| Handshake logs | Mock | **MOVER a /admin/audits** |
| Guardar | Solo mock (delay) | LLamar API PUT |

---

## 📋 Campos a Editar

| Campo | Editable | Notas |
|-------|----------|-------|
| firstName | ✅ Sí | |
| lastName | ✅ Sí | |
| email | ❌ Solo lectura | Viene de Supabase Auth |
| role | ❌ Solo lectura | SUPERADMIN u OPERATOR |
| avatar | ✅ Sí | Base64, máx 500KB |

---

## 🎨 UX/UI

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Title: "Mi Perfil"]              [Botón: Guardar]        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐                                               │
│  │  AVATAR  │   Nombre Apellido                              │
│  │ (upload) │   email@proveedor.com                         │
│  │          │   Rol: Super Admin • Root Access              │
│  └──────────┘                                               │
├─────────────────────────────────────────────────────────────┤
│  [Form: Datos Personales]                                    │
│  - First Name [input]                                       │
│  - Last Name [input]                                        │
│  - Email [input disabled]                                    │
├─────────────────────────────────────────────────────────────┤
│  [Info: Metadatos] (solo lectura)                           │
│  - ID de Usuario                                            │
│  - Fecha de creación                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Integración API

### GET /profile/me (cargar)

```typescript
useEffect(() => {
  fetch(`${API_URL}/profile/me`, { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      setFormData({
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
      })
      setAvatarPreview(data.user.avatar)
    })
}, [])
```

### PUT /profile/me (guardar)

```typescript
const handleSave = async () => {
  setIsSaving(true)
  const res = await fetch(`${API_URL}/profile/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(formData),
  })
  const data = await res.json()
  // actualizar estado local
  setIsSaving(false)
  setShowSuccess(true)
}
```

### PUT /profile/avatar

```typescript
const handleAvatarChange = (file: File) => {
  const reader = new FileReader()
  reader.onload = async () => {
    const base64 = reader.result as string
    await fetch(`${API_URL}/profile/avatar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ avatar: base64 }),
    })
  }
  reader.readAsDataURL(file)
}
```

---

## ⚠️ Preguntas

1. **Ruta exacta**: `/admin/profile`
2. **i18n**: Labels en español y inglés
3. **Navegación**: No agregar en sidebar (ya está en navbar)

---

## ✅ Criterios de Aceptación

- [ ] Datos se cargan desde API al entrar a la página
- [ ] Guardar actualiza BD y muestra éxito
- [ ] Avatar se puede subir y guardar
- [ ] Errores de red se manejan gracefully
- [ ] Layout sigue estética actual del repo
