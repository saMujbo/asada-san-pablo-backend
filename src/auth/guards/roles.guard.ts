// src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../auth-roles/roles.decorator';
import { Role } from '../auth-roles/roles.enum';
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(ctx: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
        ]);
        // Si la ruta no pide roles, solo exige estar autenticado
        if (!requiredRoles || requiredRoles.length === 0) return true;

        const request = ctx.switchToHttp().getRequest();
        const user = request.user as { roles?: string[] };

        if (!user || !Array.isArray(user.roles)) {
        throw new ForbiddenException('No roles found in user');
        }

        const hasRole = requiredRoles.some((r) => (user.roles ?? []).includes(r));
        if (!hasRole) {
        throw new ForbiddenException('Insufficient role');
        }
        return true;
    }
}
