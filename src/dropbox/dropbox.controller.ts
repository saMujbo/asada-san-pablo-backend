import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { DropboxService } from '../dropbox/dropbox.service';

@Controller('dropbox')
export class DropboxController {
  constructor(private readonly dropboxService: DropboxService) {}

  /** Ej: POST /files/upload (form-data: file, folder="Solicitudes/2025", filename="cedula.pdf") */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadOne(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
    @Body('filename') filename?: string,
  ) {
    const name = filename || file.originalname;
    const base = folder ? folder.replace(/^\/*/, '').replace(/\s+/g, '_') : '';
    const destPath = base ? `/${base}/${name}` : `/${name}`;
    return this.dropboxService.uploadBuffer(file.buffer, destPath);
  }

  /** Ej: POST /files/upload-many (form-data: files[], folder="Proyectos/ABC") */
  @Post('upload-many')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMany(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folder') folder?: string,
  ) {
    const base = folder ? folder.replace(/^\/*/, '').replace(/\s+/g, '_') : '';
    const payload = files.map((f) => ({
      buffer: f.buffer,
      path: base ? `/${base}/${f.originalname}` : `/${f.originalname}`,
    }));
    return this.dropboxService.uploadMany(payload);
  }

  /** Ej: GET /files/list?path=Solicitudes/2025 */
  @Get('list')
  async list(@Query('path') path = '') {
    return this.dropboxService.listFolder(path);
  }

  /** Ej: GET /files/temp-link?path=Solicitudes/2025/cedula.pdf */
  @Get('temp-link')
  async tempLink(@Query('path') path: string) {
    return this.dropboxService.getTempLink(path);
  }

  @Get('temp-folder-links')
  async getTempLinksForFolder(@Query('path') path: string) {
    return this.dropboxService.getTempLinksForFolder(path);
  }

  @Get('folder-link')
  async getFolderLink(@Query('path') path: string) {
    return this.dropboxService.getFolderLink(path);  // Devuelve el link de la carpeta
  }

  /** Ej: POST /files/ensure-folder  body: { path: "Solicitudes/2025/Exp_001" } */
  @Post('ensure-folder')
  async ensureFolder(@Body('path') path: string) {
    return this.dropboxService.ensureFolder(path);
  }

  /** Ej: DELETE /files?path=Solicitudes/2025/cedula.pdf */
  @Delete()
  async remove(@Query('path') path: string) {
    return this.dropboxService.delete(path);
  }
}
