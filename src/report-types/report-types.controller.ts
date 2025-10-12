import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReportTypesService } from './report-types.service';
import { CreateReportTypeDto } from './dto/create-report-type.dto';
import { UpdateReportTypeDto } from './dto/update-report-type.dto';

@Controller('report-types')
export class ReportTypesController {
  constructor(private readonly reportTypesService: ReportTypesService) {}

  @Post()
  create(@Body() createReportTypeDto: CreateReportTypeDto) {
    return this.reportTypesService.create(createReportTypeDto);
  }

  @Get()
  findAll() {
    return this.reportTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportTypesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportTypeDto: UpdateReportTypeDto) {
    return this.reportTypesService.update(+id, updateReportTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportTypesService.remove(+id);
  }
}
