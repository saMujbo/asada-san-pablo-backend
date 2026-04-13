import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { AuditAction } from '../entities/audit-log.entity';

const AUDIT_ACTION_VALUES = ['INSERT', 'UPDATE', 'DELETE'] as const;

export class AuditQueryDto {
  @IsOptional()
  @IsString()
  tableName?: string;

  @IsOptional()
  @IsIn(AUDIT_ACTION_VALUES)
  action?: AuditAction;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  actorUserId?: number;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : String(value)))
  @IsString()
  recordId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
