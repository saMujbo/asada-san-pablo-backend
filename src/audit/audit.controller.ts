import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TokenGuard } from 'src/auth/guards/token.guard';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(TokenGuard)
@Controller('audit/logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@Query() query: AuditQueryDto) {
    return this.auditService.findAll(query);
  }

  @Get(':tableName/:recordId')
  findByRecord(
    @Param('tableName') tableName: string,
    @Param('recordId') recordId: string,
  ) {
    return this.auditService.findByRecord(tableName, recordId);
  }
}
