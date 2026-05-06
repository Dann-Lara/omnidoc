# Blueprint: Fase 2 - API Backend (OPERATOR)

**Objetivo**: Crear endpoints para gestionar operators e invitación con selección múltiple de tenants.

---

## 1. Extender DTOs (Invitations)

### Archivo: `apps/api/src/invitations/invitations.dto.ts`

```typescript
export const CreateInvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(['OWNER', 'COLLABORATOR', 'OPERATOR']),  // AGREGAR OPERATOR
  organizationId: z.string().uuid().optional(),
  organizationName: z.string().optional(),
  tenantIds: z.array(z.string().uuid()).optional(),  // NUEVO
});
```

---

## 2. Extender InvitationsService

### Archivo: `apps/api/src/invitations/invitations.service.ts`

### 2.1 En `createInvitation()`:
```typescript
async createInvitation(data: CreateInvitationDto & { createdBy: string }) {
  // ...lógica existente...
  
  // Si role=OPERATOR, guardar tenantIds
  if (data.role === 'OPERATOR' && data.tenantIds) {
    // Guardar tenantIds en la invitación (nuevo campo en Invitation)
  }
}
```

### 2.2 En `completeInvitation()`:
```typescript
async completeInvitation(data: {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
}) {
  // ...lógica existente...
  
  // Si role=OPERATOR, crear OperatorTenant records
  if (invitation.role === 'OPERATOR' && invitation.tenantIds) {
    for (const tenantId of invitation.tenantIds) {
      await this.prisma.operatorTenant.create({
        data: {
          operatorId: user.id,  // ID del usuario creado
          tenantId,
        },
      });
    }
  }
}
```

---

## 3. Agregar campo en modelo Invitation

### Schema Prisma:
```prisma
model Invitation {
  // ...campos existentes...
  tenantIds String[] @default([])  // NUEVO para OPERATOR
}
```

---

## 4. Nuevo Controllers: OperatorsModule

### Archivo: `apps/api/src/admin/operators/operators.module.ts`
```typescript
@Module({
  imports: [],
  controllers: [OperatorsController],
  providers: [OperatorsService],
})
export class OperatorsModule {}
```

### Archivo: `apps/api/src/admin/operators/operators.service.ts`
```typescript
@Injectable()
export class OperatorsService {
  constructor(private prisma: PrismaService) {}

  async getOperators() {
    return this.prisma.user.findMany({
      where: { userType: 'OPERATOR' },
      include: {
        tenantAssignments: { include: { tenant: true } },
      },
    });
  }

  async getOperatorById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { tenantAssignments: { include: { tenant: true } } },
    });
  }

  async updateOperatorTenants(id: string, tenantIds: string[]) {
    // Eliminar asignaciones existentes
    await this.prisma.operatorTenant.deleteMany({ where: { operatorId: id } });
    
    // Crear nuevas asignaciones
    const assignments = tenantIds.map(tenantId => ({
      operatorId: id,
      tenantId,
    }));
    
    return this.prisma.operatorTenant.createMany({ data: assignments });
  }

  async deactivateOperator(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }
}
```

### Archivo: `apps/api/src/admin/operators/operators.controller.ts`
```typescript
@ApiTags('admin - operators')
@Controller('admin/operators')
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService) {}

  @Get()
  async getOperators() {
    return this.operatorsService.getOperators();
  }

  @Get(':id')
  async getOperator(@Param('id') id: string) {
    return this.operatorsService.getOperatorById(id);
  }

  @Put(':id/tenants')
  async updateTenants(
    @Param('id') id: string,
    @Body() body: { tenantIds: string[] },
  ) {
    return this.operatorsService.updateOperatorTenants(id, body.tenantIds);
  }

  @Delete(':id')
  async deactivateOperator(@Param('id') id: string) {
    return this.operatorsService.deactivateOperator(id);
  }
}
```

---

## 5. Extender TenantsController (filter)

### Archivo: `apps/api/src/admin/tenants/tenants.service.ts`

Agregar parámetro `operatorId` al filtro.

```typescript
async getTenants(filters: {
  // ...filtros existentes...
  operatorId?: string;  // NUEVO
}) {
  const where: Prisma.OrganizationWhereInput = {};
  
  // Si es OPERATOR, filtrar por tenantIds assignments
  if (filters.operatorId) {
    const operator = await this.prisma.user.findUnique({
      where: { id: filters.operatorId },
      include: { tenantAssignments: true },
    });
    const tenantIds = operator?.tenantAssignments.map(t => t.tenantId) || [];
    where.id = { in: tenantIds };
  }
  
  return this.prisma.organization.findMany({
    where,
    // ...resto de lógica
  });
}
```

---

## 6. Registrar en AppModule

### Archivo: `apps/api/src/app.module.ts`

```typescript
import { OperatorsModule } from './admin/operators/operators.module';

@Module({
  imports: [
    // ...otros módulos
    OperatorsModule,
  ],
})
export class AppModule {}
```

---

## Validación

- [ ] Endpoints responden correctamente
- [ ] `createInvitation` con role=OPERATOR crea OperatorTenant records
- [ ] `/admin/tenants` filtra por tenantIds para OPERATOR
- [ ] TypeScript sin errores

---

## Notes

- Reutilizar `InvitationsService` existente para invitación
- No crear endpoint de invitación nuevo (reutilizar `/invitations`)
- Verificar queredirectUrl sea `/admin` no `/tenant` para OPERATOR