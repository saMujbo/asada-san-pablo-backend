import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindManyOptions, Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditQueryDto } from './dto/audit-query.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async findAll(query: AuditQueryDto) {
    const { page = 1, limit = 20, ...filters } = query;
    const where = this.buildWhere(filters);

    const options: FindManyOptions<AuditLog> = {
      where,
      relations: { actorUser: true },
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [logs, total] = await this.auditLogRepository.findAndCount(options);

    return {
      data: logs.map((log) => this.serializeLog(log)),
      meta: {
        total,
        page,
        limit,
        pageCount: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findByRecord(tableName: string, recordId: string) {
    const logs = await this.auditLogRepository.find({
      where: { tableName, recordId: String(recordId) },
      relations: { actorUser: true },
      order: { createdAt: 'DESC', id: 'DESC' },
    });

    if (!logs.length) {
      throw new NotFoundException(
        `No audit logs found for ${tableName}:${recordId}`,
      );
    }

    return logs.map((log) => this.serializeLog(log));
  }

  private buildWhere(filters: Omit<AuditQueryDto, 'page' | 'limit'>) {
    const where: Record<string, unknown> = {};

    if (filters.tableName) {
      where.tableName = filters.tableName;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.actorUserId !== undefined) {
      where.actorUserId = filters.actorUserId;
    }

    if (filters.recordId) {
      where.recordId = filters.recordId;
    }

    if (filters.from || filters.to) {
      const fromDate = filters.from
        ? new Date(filters.from)
        : new Date('1970-01-01T00:00:00.000Z');
      const toDate = filters.to
        ? new Date(filters.to)
        : new Date('9999-12-31T23:59:59.999Z');
      where.createdAt = Between(fromDate, toDate);
    }

    return where;
  }

  private serializeLog(log: AuditLog) {
    const actor = log.actorUser
      ? {
          Id: log.actorUser.Id,
          Name: log.actorUser.Name,
          Surname1: log.actorUser.Surname1,
          Surname2: log.actorUser.Surname2,
          Email: log.actorUser.Email,
        }
      : null;

    const actorDisplayName = actor
      ? this.buildFullName(actor.Name, actor.Surname1, actor.Surname2)
      : null;
    const targetDisplayName = this.resolveTargetDisplayName(log);

    return {
      id: log.id,
      tableName: log.tableName,
      recordId: log.recordId,
      action: log.action,
      actorUserId: log.actorUserId,
      actor,
      actorDisplayName,
      targetDisplayName,
      oldData: log.oldData,
      newData: log.newData,
      changedFields: log.changedFields,
      description: log.description,
      summary: this.buildSummary(log, actorDisplayName, targetDisplayName),
      createdAt: log.createdAt,
    };
  }

  private resolveTargetDisplayName(log: AuditLog) {
    const sourceData = log.newData ?? log.oldData;
    if (!sourceData) {
      return `${log.tableName}#${log.recordId}`;
    }

    if (log.tableName === 'users') {
      const name = this.readString(sourceData, 'Name');
      const surname1 = this.readString(sourceData, 'Surname1');
      const surname2 = this.readString(sourceData, 'Surname2');
      const email = this.readString(sourceData, 'Email');
      const fullName = this.buildFullName(name, surname1, surname2);

      return fullName || email || `Usuario #${log.recordId}`;
    }

    return `${log.tableName}#${log.recordId}`;
  }

  private buildSummary(
    log: AuditLog,
    actorDisplayName: string | null,
    targetDisplayName: string,
  ) {
    const actorLabel = actorDisplayName ?? 'Actor no identificado';
    const actionLabel = this.translateAction(log.action);
    return `${actorLabel} ${actionLabel} ${targetDisplayName}`;
  }

  private translateAction(action: AuditLog['action']) {
    switch (action) {
      case 'INSERT':
        return 'creó a';
      case 'UPDATE':
        return 'actualizó a';
      case 'DELETE':
        return 'eliminó a';
      default:
        return 'modificó a';
    }
  }

  private buildFullName(...parts: Array<string | null>) {
    return parts
      .filter((part): part is string => Boolean(part && part.trim()))
      .join(' ')
      .trim();
  }

  private readString(
    data: Record<string, unknown>,
    key: string,
  ): string | null {
    const value = data[key];
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }
}
