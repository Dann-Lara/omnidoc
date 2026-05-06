# 02-Backend - API de Autenticación

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 01-auth/02-backend |
| **Estado** | 🔄 Parcial (implementación principal lista) |

---

## 🎯 Propósito

Documentar los cambios requeridos en el backend para implementar el refactor de seguridad: DTOs, rate limiting, y manejo de cookies HttpOnly.

---

## 📁 Archivos Involucrados

```
apps/api/src/
├── main.ts                       # Agregar Helmet, CORS config
├── auth/
│   ├── auth.controller.ts        # Endpoints con DTOs, cookies
│   ├── auth.service.ts           # Lógica de cookies
│   ├── auth.module.ts
│   ├── dto/                      # NUEVO - DTOs con validación
│   │   ├── login.dto.ts
│   │   ├── signup.dto.ts
│   │   ├── forgot-password.dto.ts
│   │   └── reset-password.dto.ts
│   └── types/
│       └── user.types.ts
└── app.module.ts                # Agregar ThrottlerModule
```

---

## 🔧 Cambios Requeridos

### 1. DTOs con class-validator

#### login.dto.ts

```typescript
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}
```

#### signup.dto.ts

```typescript
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72, { message: 'Password too long' })
  password: string;

  @ApiProperty({ example: 'My Clinic' })
  @IsString()
  @MinLength(2, { message: 'Organization name too short' })
  @MaxLength(100, { message: 'Organization name too long' })
  orgName: string;

  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'General Practice', required: false })
  @IsOptional()
  @IsString()
  specialty?: string;
}
```

#### forgot-password.dto.ts

```typescript
import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}
```

#### reset-password.dto.ts

```typescript
import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  access_token: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72, { message: 'Password too long' })
  new_password: string;
}
```

---

### 2. Rate Limiting

#### Configuración en app.module.ts

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,    // 1 segundo
        limit: 3,     // 3 requests por segundo
      },
      {
        name: 'medium',
        ttl: 60000,   // 1 minuto
        limit: 20,    // 20 requests por minuto
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hora
        limit: 100,   // 100 requests por hora (login attempts)
      },
    ]),
  ],
})
export class AppModule {}
```

#### Aplicar en auth.controller.ts

```typescript
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  @Post('login')
  @Throttle({ short: { limit: 5 }, medium: { limit: 10 } })
  async login(@Body() body: LoginDto) { ... }

  @Post('signup')
  @Throttle({ short: { limit: 3 }, medium: { limit: 5 } })
  async signup(@Body() body: SignupDto) { ... }
}
```

---

### 3. Cookies HttpOnly

#### Set Cookies en auth.controller.ts

```typescript
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    // ... lógica de login ...

    // Set HttpOnly cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: data.expires_in * 1000, // milliseconds
    };

    res.cookie('sb-access-token', data.access_token, cookieOptions);
    res.cookie('sb-refresh-token', data.refresh_token, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for refresh
    });

    // Devolver respuesta SIN los tokens en body (más seguro)
    return {
      user: data.user,
      dashboard_route: dashboardRoute,
      message: 'Login successful',
    };
  }
}
```

#### Remover dev-login o Protegerlo

```typescript
@Post('dev-login')
@Throttle({ long: { limit: 1 } }) // Solo 1 request por hora
async devLogin(...): Promise<LoginResponse> {
  // Agregar validación de IP o ambiente
  if (process.env.NODE_ENV === 'production') {
    throw new ForbiddenException('Dev login not available in production');
  }
  // ...
}
```

---

### 4. Headers de Seguridad (main.ts)

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // Strip properties not in DTO
    forbidNonWhitelisted: true, // Throw error on extra properties
    transform: true,            // Transform payloads to DTO instances
  }));

  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
```

---

## 📋 Checklist de Implementación (actualizado según código)

### DTOs
- [x] Crear `apps/api/src/auth/dto/` directory
- [x] Crear `login.dto.ts`
- [x] Crear `signup.dto.ts`
- [x] Crear `forgot-password.dto.ts`
- [x] Crear `reset-password.dto.ts`
- [x] Actualizar imports en auth.controller.ts

### Rate Limiting
- [x] Agregar `@nestjs/throttler` a dependencies
- [x] Importar `ThrottlerModule` en app.module.ts
- [x] Agregar `@UseGuards(ThrottlerGuard)` al controller
- [x] Agregar `@Throttle` decorators

### Cookies
- [x] Importar `Response` de express en controller
- [x] Modificar login para setear cookies
- [x] Modificar signup para setear cookies
- [x] Remover tokens del response body
- [x] Proteger dev-login endpoint

### Seguridad Extra
- [x] Configurar ValidationPipe con `whitelist: true`
- [x] Configurar CORS con origins específicos
- [ ] Agregar Helmet (opcional)

---

## ✅ Criterios de Aceptación (estado)

- [x] DTOs con class-validator funcionando
- [x] Rate limiting activo en endpoints auth
- [x] Cookies HttpOnly configuradas
- [x] Dev-login protegido o eliminado
- [x] Validación whitelist en todos los endpoints

---

## 🔗 Dependencias

- [06-security.md](../00-global/06-security.md) - Reglas de seguridad
- [Skill: nestjs-best-practices](../skills/nestjs-best-practices/SKILL.md)

---

## 🔭 Siguiente Step

[03-frontend.md](./03-frontend.md) → Refactor del frontend (leer cookies, actualizar pages)