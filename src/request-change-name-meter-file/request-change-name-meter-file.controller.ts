import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, ParseIntPipe } from '@nestjs/common';
import { RequestChangeNameMeterFileService } from './request-change-name-meter-file.service';
import { FilesInterceptor } from '@nestjs/platform-express';

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
  @Get(':id')
  async list(@Param('id') id: number) {
    return this.requestChangeMeterFileService.list(id);
  }

  // GET /projects/:id/files/temp-link?fileId=123
  @Get('temp-link/:id')
  async tempLink(@Param('id') fileId: number) {
    return this.requestChangeMeterFileService.tempLink(fileId);
  }

  @Get('folder-link/:id')
    async getFolderLink(@Param('id') fileId: number) {
    return this.requestChangeMeterFileService.getFolderLink(fileId);  // Devuelve el link de la carpeta
  }

  // DELETE /projects/:id/files?fileId=123
  @Delete()
  async remove(@Param('id', ParseIntPipe) id: number, @Body('fileId') fileId?: number) {
    return this.requestChangeMeterFileService.remove(fileId!);
  }
}
