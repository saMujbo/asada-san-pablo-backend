import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsPaginationDto } from './dto/Pagination-report.dto';
import { AssignUserDto } from './dto/assign-user.dto';
import { TokenGuard } from 'src/auth/guards/token.guard';
import { GetUser } from 'src/auth/get-user.decorator';

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

  @ApiOperation({ summary: 'Obtener un reporte por ID' })
  @ApiResponse({ status: 200, description: 'Reporte encontrado exitosamente' })
  @ApiResponse({ status: 404, description: 'Reporte no encontrado' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Actualizar un reporte' })
  @ApiResponse({ status: 200, description: 'Reporte actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Reporte no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportsService.update(+id, updateReportDto);
  }

  @ApiOperation({ summary: 'Eliminar un reporte' })
  @ApiResponse({ status: 200, description: 'Reporte eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Reporte no encontrado' })
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

  /** Resumen para el usuario autenticado */
  @UseGuards(TokenGuard)
  @Get('me/count')
  async getMyReportsCount(@GetUser('id') userId: number) {
    return this.reportsService.getMyReportsSummary(userId);
  }

  /** Conteo por estado específico del usuario autenticado */
  @UseGuards(TokenGuard)
  @Get('me/count-by-state')
  async getMyReportsCountByState(
    @GetUser('id') userId: number,
    @Query('state') stateName: string,
  ) {
    const count = await this.reportsService.countByStateNameForUser(userId, stateName);
    return { state: stateName, count };
  }

  @Patch(':reportId/assign-user-in-charge')
  async assignReportInCharge(
    @Param('reportId') reportId: string,
    @Body() assignUserDto: AssignUserDto
  ) {
    return this.reportsService.assignUserInCharge(+reportId, assignUserDto.userInChargeId);
  }
}
