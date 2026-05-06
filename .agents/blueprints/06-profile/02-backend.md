# 06-Profile - Backend

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 06-profile/02-backend |
| **Estado** | ⏳ Pendiente |

---

## 🎯 Propósito

Crear API endpoints para gestión de perfiles de usuario.

---

## 📋 Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/profile/me` | Obtener perfil del usuario actual |
| PUT | `/profile/me` | Actualizar perfil del usuario actual |
| GET | `/profile/avatar` | Obtener avatar del usuario actual |
| PUT | `/profile/avatar` | Actualizar avatar (base64) |

---

## 📋 DTOs

### GetProfileResponse

```typescript
interface GetProfileResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    specialty?: string;
    avatar?: string;
    isTenantAdmin: boolean;
    createdAt: Date;
  };
  organization?: {
    id: string;
    name: string;
    slug: string;
    type: OrganizationType;
    subscriptionStatus: SubscriptionStatus;
  };
}
```

### UpdateProfileDto

```typescript
class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialty?: string;
}
```

### UpdateAvatarDto

```typescript
class UpdateAvatarDto {
  @IsString()
  @MaxLength(500000) // ~500KB base64
  @ApiProperty({ description: 'Base64 encoded image' })
  avatar: string;
}
```

---

## 🏗️ Archivos a Crear

### profile.controller.ts

```typescript
@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: Request): Promise<GetProfileResponse> {
    return this.profileService.getProfile(req.user['id']);
  }

  @Put('me')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Req() req: Request,
    @Body() dto: UpdateProfileDto,
  ): Promise<GetProfileResponse> {
    return this.profileService.updateProfile(req.user['id'], dto);
  }

  @Put('avatar')
  @UseGuards(AuthGuard)
  async updateAvatar(
    @Req() req: Request,
    @Body() dto: UpdateAvatarDto,
  ): Promise<{ avatar: string }> {
    return this.profileService.updateAvatar(req.user['id'], dto.avatar);
  }
}
```

### profile.service.ts

```typescript
@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId: userId },
      include: { organization: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.isTenantAdmin ? 'CLIENT' : 'SUBORDINATE',
        specialty: user.specialty,
        avatar: user.avatar,
        isTenantAdmin: user.isTenantAdmin,
        createdAt: user.createdAt,
      },
      organization: user.organization ? {
        id: user.organization.id,
        name: user.organization.name,
        slug: user.organization.slug,
        type: user.organization.type,
        subscriptionStatus: user.organization.subscriptionStatus,
      } : undefined,
    };
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { supabaseId: userId },
      data: {
        firstName: data.firstName ?? undefined,
        lastName: data.lastName ?? undefined,
        specialty: data.specialty ?? undefined,
      },
      include: { organization: true },
    });
  }

  async updateAvatar(userId: string, avatar: string) {
    return this.prisma.user.update({
      where: { supabaseId: userId },
      data: { avatar },
    });
  }
}
```

---

## 🔧 Schema Prisma - Agregar Campo

```prisma
model User {
  // ... existing fields
  avatar       String?  // base64 encoded image
}
```

---

## 🔒 Notas de Seguridad

- Todos los endpoints requieren autenticación (token en cookie)
- El usuario solo puede editar su propio perfil
- Avatar limitado a 500KB base64
- Validación de inputs con class-validator

---

## ⚠️ Pendiente

- ¿Necesita el tenant ability de editar organization.name?
- ¿El admin puede editar specialty de otros usuarios?

---

## ✅ Criterios de Aceptación

- [ ] GET /profile/me retorna datos correctos
- [ ] PUT /profile/me actualiza y retorna datos actualizados
- [ ] PUT /profile/avatar guarda base64 correctamente
- [ ] Errores claros cuando usuario no existe
