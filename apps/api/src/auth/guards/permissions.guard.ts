import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const PERMISSIONS_KEY = 'workflow:permission';

export function Permissions(module: string, action: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(PERMISSIONS_KEY, { module, action }, descriptor.value);
    return descriptor;
  };
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.isTenantAdmin || user.role === 'OWNER') {
      return true;
    }

    const required = this.reflector.get<{ module: string; action: string }>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!required) {
      return true;
    }

    const userPermissions = user.permissions || {};
    const key = `${required.module}.${required.action}`;
    const hasPermission = userPermissions[key] === true;

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${key}`,
      );
    }

    return true;
  }
}
