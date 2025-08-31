// auth/get-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<{ user?: any }>();
    const user = req.user ?? {};
    // si quieres aliasar Id -> id o viceversa:
    const normalized = user.Id ? { ...user, id: user.Id } : user;
    return data ? normalized?.[data] : normalized;
  },
);
