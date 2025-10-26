import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReportStatesService } from './report-states.service';
import { CreateReportStateDto } from './dto/create-report-state.dto';
import { UpdateReportStateDto } from './dto/update-report-state.dto';

@Controller('report-states')
export class ReportStatesController {
  constructor(private readonly reportStatesService: ReportStatesService) {}

  @Post()
  create(@Body() createReportStateDto: CreateReportStateDto) {
    return this.reportStatesService.create(createReportStateDto);
  }

  @Get()
  findAll() {
    return this.reportStatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportStatesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportStateDto: UpdateReportStateDto) {
    return this.reportStatesService.update(+id, updateReportStateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportStatesService.remove(+id);
  }

  @Get('en-proceso/count')
  async countEnProceso() {
    const totalReportsInProcess = await this.reportStatesService.countReportsInProcess();
    return { totalReportsInProcess };
  }
}
