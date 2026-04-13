import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { from, lastValueFrom, Observable } from 'rxjs';
import { AuditRequestContext, AuditedRequest } from './audit.types';

@Injectable()
export class AuditActorInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<AuditedRequest>();
    const actorUserId = this.extractActorUserId(request);

    if (!this.shouldOpenAuditConnection(request, actorUserId)) {
      return next.handle();
    }

    return from(this.runWithAuditContext(request, actorUserId, next.handle()));
  }

  private async runWithAuditContext(
    request: AuditedRequest,
    actorUserId: number,
    stream$: Observable<unknown>,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    await queryRunner.query('SET @app_user_id = ?', [actorUserId]);

    request.auditContext = { actorUserId, queryRunner };

    try {
      const result = await lastValueFrom(stream$);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await this.cleanupAuditContext(request.auditContext);
      delete request.auditContext;
    }
  }

  private extractActorUserId(request: AuditedRequest): number | null {
    const rawId = request.user?.id ?? request.user?.Id;
    if (typeof rawId !== 'number' || !Number.isInteger(rawId) || rawId <= 0) {
      return null;
    }
    return rawId;
  }

  private shouldOpenAuditConnection(
    request: AuditedRequest,
    actorUserId: number | null,
  ): actorUserId is number {
    return (
      actorUserId !== null &&
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
    );
  }

  private async cleanupAuditContext(
    auditContext: AuditRequestContext | undefined,
  ) {
    if (!auditContext) {
      return;
    }

    try {
      await auditContext.queryRunner.query('SET @app_user_id = NULL');
    } finally {
      if (!auditContext.queryRunner.isReleased) {
        await auditContext.queryRunner.release();
      }
    }
  }
}
