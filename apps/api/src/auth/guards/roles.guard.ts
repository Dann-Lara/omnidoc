import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class IsSuperadminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const role = user?.role;

    if (role !== 'SUPERADMIN') {
      throw new ForbiddenException('Only superadmin can access this resource');
    }

    return true;
  }
}

@Injectable()
export class IsOperatorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const role = user?.role;

    if (role !== 'SUPERADMIN' && role !== 'OPERATOR') {
      throw new ForbiddenException('Only superadmin or operator can access this resource');
    }

    return true;
  }
}

@Injectable()
export class IsNotOperatorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const role = user?.role;

    if (role === 'OPERATOR') {
      throw new ForbiddenException('Operators cannot access this resource');
    }

    return true;
  }
}