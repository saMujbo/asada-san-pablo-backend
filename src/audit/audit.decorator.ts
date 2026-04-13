import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuditRequestContext, AuditedRequest } from './audit.types';

export const GetAuditContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuditRequestContext | undefined => {
    const request = ctx.switchToHttp().getRequest<AuditedRequest>();
    return request.auditContext;
  },
);
