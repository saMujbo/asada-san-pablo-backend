// auth/guards/auth.guard.ts
import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request & { user?: any }>();

    // ===== LOGS DE DIAGNÓSTICO =====
    console.log('--- AuthGuard IN ---');
    console.log('headers.authorization:', req.headers.authorization);
    console.log('query.token:', req.query?.token);
    console.log('method/path:', req.method, req.url);

    const token = this.extractToken(req);
    if (!token) {
      console.log('AuthGuard: token ausente');
      throw new UnauthorizedException('AuthGuard: token ausente');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
      console.log('AuthGuard: payload OK:', payload);
      req.user = payload;
      return true;
    } catch (e: any) {
      console.log('AuthGuard: verify error:', e?.message);
      throw new UnauthorizedException('AuthGuard: token inválido o expirado');
    }
  }

  private extractToken(req: Request): string | undefined {
    // 1) Authorization: Bearer ...
    const auth = req.headers.authorization as string | undefined;
    if (auth?.startsWith('Bearer ')) return auth.slice(7).trim();

    // 2) Permitir también ?token= (blindaje)
    const q = req.query?.token;
    if (typeof q === 'string' && q.length > 0) return q;

    return undefined;
  }
}
