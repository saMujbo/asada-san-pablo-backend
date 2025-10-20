import { IsBooleanString, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RecentCountDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  hours?: number;         // p.ej. 24 (por defecto)

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  days?: number;          // alternativo a hours

  @IsOptional()
  @IsBooleanString()
  unread?: string;        // 'true' | 'false' (como querystring)
}
