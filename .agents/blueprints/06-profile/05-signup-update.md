# 06-Profile - Actualización de Signup

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 06-profile/05-signup-update |
| **Estado** | ⏳ Pendiente |

---

## 🎯 Propósito

Agregar selección de tipo de organización (INDIVIDUAL/CLINIC) en el flujo de signup.

---

## 🔄 Cambios Requeridos

### Frontend - Signup Form

Agregar toggle switch después del campo "specialty":

```
┌─────────────────────────────────────────────────────────────┐
│  Practice Name: [___________________________]              │
│                                                             │
│  Specialty: [___________________________]                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ¿Qué tipo de práctica tienes?                      │    │
│  │                                                     │    │
│  │  ○ Individual      ● Clínica / Hospital            │    │
│  │  (Médico único)    (Equipo médico)                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  [Continuar]                                                │
└─────────────────────────────────────────────────────────────┘
```

### UI del Toggle

- Estilo: double button / toggle switch
- Opciones:
  - **Individual**: "Soy médico individual" / "I'm an individual practitioner"
  - **Clinic**: "Tengo una clínica / consultorio" / "I have a clinic"

---

## 📋 DTOs - Agregar Campo

### SignupDto

```typescript
export class SignupDto {
  // ... existing fields
  @ApiProperty({ example: 'CLINIC', enum: ['INDIVIDUAL', 'CLINIC'], required: false })
  @IsOptional()
  @IsEnum(['INDIVIDUAL', 'CLINIC'])
  orgType?: 'INDIVIDUAL' | 'CLINIC';
}
```

### OnboardingDto

```typescript
export const CreateOnboardingSchema = z.object({
  // ... existing fields
  type: z.enum(['INDIVIDUAL', 'CLINIC']), // ya existe
});
```

---

## 🔗 Integración

### Frontend → Backend

```typescript
const handleSignup = async () => {
  await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    body: JSON.stringify({
      // ... existing fields
      orgType: formData.orgType, // 'INDIVIDUAL' | 'CLINIC'
    }),
  })
}
```

### Onboarding Service

El campo `type` ya existe en el DTO de onboarding:
```typescript
const organization = await this.prisma.organization.create({
  data: {
    name: data.organizationName,
    slug,
    type: data.type, // INDIVIDUAL o CLINIC
    // ...
  },
})
```

---

## 🎨 Detalles del Toggle

### Estilo Visual

```tsx
<div className="grid grid-cols-2 gap-3">
  <button
    type="button"
    onClick={() => setOrgType('INDIVIDUAL')}
    className={`
      p-4 rounded-lg border-2 transition-all
      ${formData.orgType === 'INDIVIDUAL' 
        ? 'border-primary bg-primary/5' 
        : 'border-outline-variant hover:border-primary/50'}
    `}
  >
    <Stethoscope className="w-6 h-6 mx-auto mb-2" />
    <span className="block font-semibold">Individual</span>
    <span className="block text-xs text-on-surface-variant">
      Médico único
    </span>
  </button>
  
  <button
    type="button"
    onClick={() => setOrgType('CLINIC')}
    className={`
      p-4 rounded-lg border-2 transition-all
      ${formData.orgType === 'CLINIC' 
        ? 'border-primary bg-primary/5' 
        : 'border-outline-variant hover:border-primary/50'}
    `}
  >
    <Building2 className="w-6 h-6 mx-auto mb-2" />
    <span className="block font-semibold">Clínica</span>
    <span className="block text-xs text-on-surface-variant">
      Equipo médico
    </span>
  </button>
</div>
```

---

## ⚠️ Notas

- Campo `orgType` es obligatorio en signup
- Valor por defecto: `INDIVIDUAL` si no se selecciona
- Este campo determina la estructura inicial pero no el plan
- El plan se muestra después en la página de perfil del tenant

---

## ✅ Criterios de Aceptación

- [ ] Toggle visible en paso 1 del signup
- [ ] Selección guarda valor correcto en BD
- [ ] Default es INDIVIDUAL si no selecciona
- [ ] Validación: campo requerido
- [ ] i18n funcional para ambas opciones
