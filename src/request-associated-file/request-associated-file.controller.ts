import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ParseIntPipe, Query, UploadedFiles } from '@nestjs/common';
import { RequestAssociatedFileService } from './request-associated-file.service';
import { CreateRequestAssociatedFileDto } from './dto/create-request-associated-file.dto';
import { UpdateRequestAssociatedFileDto } from './dto/update-request-associated-file.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('request-associated-file')
export class RequestAssociatedFileController {
  constructor(private readonly requestAssociatedFileService: RequestAssociatedFileService) {}

  // POST /projects/:id/files  (form-data: files[], subfolder="Complementarios")
  @Post(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMany(
    @Param('id') id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('subfolder') subfolder?: string,
  ) {
    return this.requestAssociatedFileService.uploadMany(id, files, subfolder);
  }

  // GET /projects/:id/files
  @Get()
  async list(@Param('id', ParseIntPipe) id: number) {
    return this.requestAssociatedFileService.list(id);
  }

  // GET /projects/:id/files/temp-link?fileId=123
  @Get('temp-link')
  async tempLink(@Query('id', ParseIntPipe) fileId: number) {
    return this.requestAssociatedFileService.tempLink(fileId);
  }

  // DELETE /projects/:id/files?fileId=123
  @Delete()
  async remove(@Param('id', ParseIntPipe) id: number, @Body('fileId') fileId?: number) {
    return this.requestAssociatedFileService.remove(fileId!);
  }
}
