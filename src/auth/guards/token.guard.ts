// auth/guards/token.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly cfg: ConfigService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request & { user?: any }>();

    // DEBUG seguro (nunca accedas a propiedades del payload aquí)
    // console.log('Auth IN :: auth=', req.headers.authorization, ' query.token=', req.query?.token);

    const token = this.extractToken(req);
    if (!token) {
      throw new UnauthorizedException('token ausente');
    }

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.cfg.get<string>('JWT_SECRET'),
      });

      // DEBUG seguro: usa optional chaining
      // console.log('payload OK :: id=', payload?.id, 'jti=', payload?.jti);

      req.user = payload; // <- lo que consumirá @GetUser(...)
      return true;
    } catch (e: any) {
      // console.log('verify error:', e?.message);
      throw new UnauthorizedException('token inválido o expirado');
    }
  }

  private extractToken(req: Request): string | undefined {
    // 1) Authorization: Bearer ...
    const h = req.headers.authorization;
    if (typeof h === 'string' && h.startsWith('Bearer ')) {
      return h.slice(7).trim();
    }
    // 2) ?token=...
    const q = req.query?.token;
    if (typeof q === 'string' && q.length > 0) return q;
    // 3) Cookie 'token' (opcional)
    // const c = (req as any).cookies?.token;
    // if (typeof c === 'string' && c.length > 0) return c;

    return undefined;
  }
}
