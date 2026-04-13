import { Request } from 'express';
import { QueryRunner } from 'typeorm';

export interface AuthenticatedRequestUser {
  id?: number;
  Id?: number;
}

export interface AuditRequestContext {
  actorUserId: number;
  queryRunner: QueryRunner;
}

export interface AuditedRequest extends Request {
  user?: AuthenticatedRequestUser;
  auditContext?: AuditRequestContext;
}
