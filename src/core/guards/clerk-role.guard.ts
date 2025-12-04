import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClerkUser } from './clerk-auth.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class ClerkRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required
    }

    const request = context.switchToHttp().getRequest();
    const user: ClerkUser = request.user;

    if (!user) {
      return false;
    }

    const hasRequiredRole = requiredRoles.some((role) =>
      user.roles?.includes(role),
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `User lacks required role(s): ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
