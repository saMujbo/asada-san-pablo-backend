// auth/get-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Si no quieres importar la entidad para evitar ciclos, usa string:
// export const GetUser = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
export const GetUser = createParamDecorator(
  (data: keyof import('../users/entities/user.entity').User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user; // <- lo setea tu JwtStrategy.validate

    // Sin 'data' -> devuelve todo el user del req
    if (!data) return user;

    // Con 'data' -> devuelve solo esa propiedad
    return user?.[data];
  },
);
