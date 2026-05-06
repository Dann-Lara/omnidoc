# Blueprint: Fase 1 - Modelo de Datos (OPERATOR)

**Objetivo**: Crear modelo `OperatorTenant` para gestionar asignación tenants→operators.

---

## 1. Schema Prisma

### Archivo: `apps/api/prisma/schema.prisma`

Agregar nuevo modelo:

```prisma
model OperatorTenant {
  id          String   @id @default(uuid())
  operatorId  String
  tenantId    String
  assignedAt  DateTime @default(now())

  @@unique([operatorId, tenantId])
  @@index([operatorId])
  @@index([tenantId])
}
```

### Relaciones existentes (User)

En modelo `User`, verificar que exista:
```prisma
model User {
  // ...campos existentes...
  tenantAssignments OperatorTenant[] @relation("OperatorTenants")
}
```

---

## 2. Migración Prisma

Ejecutar:
```bash
cd apps/api && pnpm prisma generate && pnpm prisma migrate dev --name add_operator_tenant
```

---

## 3. Dependencias

Verificar que el schema no rompa nada. Ejecutar:
```bash
cd apps/api && pnpm build
```

---

## Validación

- [ ] `pnpm prisma generate` pasa sin errores
- [ ] `pnpm build` del api pasa sin errores
- [ ] Migración aplicada en DB

---

## Notes

- No agregar `tenantIds` directo en `User` (separado para no romper modelos existentes)
- La asignación se hace en dos pasos: Invitation → OperatorTenant al completar