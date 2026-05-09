import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PharmacyPermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // OWNER always has full access
    if (user.isTenantAdmin || user.role === 'OWNER') {
      return true;
    }

    const requiredPermission = this.reflector.get<string>(
      'pharmacy:permission',
      context.getHandler(),
    );

    if (!requiredPermission) {
      return true;
    }

    const userPermissions = user.permissions || {};
    const hasPermission = userPermissions[requiredPermission] === true;

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermission}`,
      );
    }

    return true;
  }
}
