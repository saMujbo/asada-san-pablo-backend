import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsPaginationDto } from './dto/Pagination-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto);
  }

  @Post('admin')
  createAdminReport(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.createAdminReport(createReportDto);
  }

  @Get('search')
  findAll(@Query() paginationDto: ReportsPaginationDto) {
    return this.reportsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportsService.update(+id, updateReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportsService.remove(+id);
  }

  // GET reportes por mes - grafica
  @Get('stats/monthly')
  getMonthly(
    @Query('months') months?: string,
    @Query('state') stateName?: string,
    @Query('locationId') locationId?: string,
    @Query('reportTypeId') reportTypeId?: string,
  ) {
    return this.reportsService.getMonthlyCounts({
      months: months ? Number(months) : 12,
      stateName,
      locationId: locationId ? Number(locationId) : undefined,
      reportTypeId: reportTypeId ? Number(reportTypeId) : undefined,
    });
  }
}
