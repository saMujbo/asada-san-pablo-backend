import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
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

  /** Exportar PDF: reportes del mes/año + figura por ubicación. Query: year, month (1-12). */
  @Get('export/pdf')
  @ApiOperation({ summary: 'Exportar PDF de reportes del mes con gráfico por ubicación' })
  async exportPdf(
    @Query('year') yearParam: string,
    @Query('month') monthParam: string,
    @Res() res: Response,
  ) {
    const year = Number(yearParam);
    const month = Number(monthParam);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return res.status(400).json({ message: 'Query "year" es requerido y debe ser un año válido (2000-2100)' });
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Query "month" es requerido y debe ser entre 1 y 12' });
    }
    const buffer = await this.reportsService.buildExportPdf(year, month);
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const filename = `reportes-${monthNames[month - 1]}-${year}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
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

  // GET reportes por mes y ubicación - para figuras por barrio
  @Get('stats/monthly-by-location')
  getMonthlyByLocation(
    @Query('months') months?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.reportsService.getMonthlyCountsByLocation({
      months: months ? Number(months) : 12,
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
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
