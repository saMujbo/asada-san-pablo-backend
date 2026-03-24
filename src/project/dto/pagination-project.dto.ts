import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';

export class ProjectPaginationDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtro por nombre (LIKE)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return undefined;
    const v = value.trim();
    return v.length ? v : undefined;
  })
  name?: string;

  @ApiPropertyOptional({ description: 'Filtro por estado proyecto' })
  @IsOptional()
  @IsString()
  projectState?: string;
}
