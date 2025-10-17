import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReportLocationService } from './report-location.service';
import { CreateReportLocationDto } from './dto/create-report-location.dto';
import { UpdateReportLocationDto } from './dto/update-report-location.dto';

@Controller('report-location')
export class ReportLocationController {
  constructor(private readonly reportLocationService: ReportLocationService) {}

  @Post()
  create(@Body() createReportLocationDto: CreateReportLocationDto) {
    return this.reportLocationService.create(createReportLocationDto);
  }

  @Get()
  findAll() {
    return this.reportLocationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportLocationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportLocationDto: UpdateReportLocationDto) {
    return this.reportLocationService.update(+id, updateReportLocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportLocationService.remove(+id);
  }
}
