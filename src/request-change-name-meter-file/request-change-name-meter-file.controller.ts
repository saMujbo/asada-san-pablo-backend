import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, ParseIntPipe, Query } from '@nestjs/common';
import { RequestChangeNameMeterFileService } from './request-change-name-meter-file.service';
import { CreateRequestChangeNameMeterFileDto } from './dto/create-request-change-name-meter-file.dto';
import { UpdateRequestChangeNameMeterFileDto } from './dto/update-request-change-name-meter-file.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProjectFileService } from 'src/project-file/project-file.service';
import { RequestChangeMeterService } from 'src/request-change-meter/request-change-meter.service';

@Controller('request-change-name-meter-file')
export class RequestChangeNameMeterFileController {
  constructor(private readonly requestChangeMeterFileService: RequestChangeNameMeterFileService) {}

  // POST /projects/:id/files  (form-data: files[], subfolder="Complementarios")
  @Post(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMany(
    @Param('id') id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('subfolder') subfolder?: string,
  ) {
    return this.requestChangeMeterFileService.uploadMany(id, files, subfolder);
  }

  // GET /projects/:id/files
  @Get()
  async list(@Param('id', ParseIntPipe) id: number) {
    return this.requestChangeMeterFileService.list(id);
  }

  // GET /projects/:id/files/temp-link?fileId=123
  @Get('temp-link')
  async tempLink(@Query('id', ParseIntPipe) fileId: number) {
    return this.requestChangeMeterFileService.tempLink(fileId);
  }

  // DELETE /projects/:id/files?fileId=123
  @Delete()
  async remove(@Param('id', ParseIntPipe) id: number, @Body('fileId') fileId?: number) {
    return this.requestChangeMeterFileService.remove(fileId!);
  }
}
