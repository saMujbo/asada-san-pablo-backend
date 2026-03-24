import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.decorator';
import { TokenGuard } from 'src/auth/guards/token.guard';
import { AssignPlumberDto } from './dto/assign-plumber.dto';
import { ChangeReportStateDto } from './dto/change-report-state.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsPaginationDto } from './dto/Pagination-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportStateEnum } from './enums/report-state.enum';
import { ReportsService } from './reports.service';

@UseGuards(TokenGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@Body() createReportDto: CreateReportDto, @GetUser('id') userId: number) {
    return this.reportsService.create(createReportDto);
  }

  @Post(':reportId/photo')
  @ApiOperation({ summary: 'Subir o reemplazar la foto de un reporte' })
  @UseInterceptors(FileInterceptor('photo', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  uploadPhoto(
    @Param('reportId') reportId: string,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    return this.reportsService.uploadPhoto(+reportId, photo);
  }

  @Get('search')
  findAll(@Query() paginationDto: ReportsPaginationDto) {
    return this.reportsService.findAll(paginationDto);
  }

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

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar Excel de reportes del mes con formato legible' })
  async exportExcel(
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

    const buffer = await this.reportsService.buildExportExcel(year, month);
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const filename = `reportes-${monthNames[month - 1]}-${year}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get('stats/monthly')
  getMonthly(
    @Query('months') months?: string,
    @Query('state') state?: ReportStateEnum,
    @Query('reportLocationId') reportLocationId?: string,
    @Query('reportTypeId') reportTypeId?: string,
  ) {
    return this.reportsService.getMonthlyCounts({
      months: months ? Number(months) : 12,
      state,
      reportLocationId: reportLocationId ? Number(reportLocationId) : undefined,
      reportTypeId: reportTypeId ? Number(reportTypeId) : undefined,
    });
  }

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

  @Get('me/count')
  getMyReportsCount(@GetUser('id') userId: number) {
    return this.reportsService.getMyReportsSummary(userId);
  }

  @Get('me/count-by-state')
  async getMyReportsCountByState(
    @GetUser('id') userId: number,
    @Query('state') stateName: string,
  ) {
    const count = await this.reportsService.countByStateNameForUser(userId, stateName);
    return { state: stateName, count };
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

  @Post(':reportId/assignments')
  assignPlumber(
    @Param('reportId') reportId: string,
    @Body() assignPlumberDto: AssignPlumberDto,
    @GetUser('id') userId: number,
  ) {
    return this.reportsService.assignPlumber(
      +reportId,
      assignPlumberDto.plumberUserId,
      assignPlumberDto.instructions,
      userId,
    );
  }

  @Post(':reportId/state-transitions')
  changeState(
    @Param('reportId') reportId: string,
    @Body() changeReportStateDto: ChangeReportStateDto,
    @GetUser('id') userId: number,
  ) {
    return this.reportsService.changeState(
      +reportId,
      changeReportStateDto.newState,
      changeReportStateDto.reasonChange,
      userId,
    );
  }

  @ApiOperation({ summary: 'Eliminar un reporte' })
  @ApiResponse({ status: 200, description: 'Reporte eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Reporte no encontrado' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportsService.remove(+id);
  }
}
