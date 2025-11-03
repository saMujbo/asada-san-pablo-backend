import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DropboxService } from 'src/dropbox/dropbox.service';
import { Project } from 'src/project/entities/project.entity';
import { slug } from 'src/utils/slug.util';
import { ProjectService } from 'src/project/project.service';
import { RequestAvailabilityWaterFile } from './entities/request-availability-water-file.entity';
import { RequesAvailabilityWaterService } from 'src/reques-availability-water/reques-availability-water.service';
import { RequesAvailabilityWater } from 'src/reques-availability-water/entities/reques-availability-water.entity';

@Injectable()
export class RequestAvailabilityWaterFileService {
  constructor(
    @InjectRepository(RequestAvailabilityWaterFile) private readonly reqFileFileRepo: Repository<RequestAvailabilityWaterFile>,
    private readonly reqWaterSV: RequesAvailabilityWaterService,
    private readonly dropbox: DropboxService,
  ) {}

  private buildBasePath(reqWater: RequesAvailabilityWater) {
    // Si ya guardaste la ruta base en SpaceOfDocument, úsala.
    if (reqWater.SpaceOfDocument) return reqWater.SpaceOfDocument.startsWith('/') ? reqWater.SpaceOfDocument : `/${reqWater.SpaceOfDocument}`;
    const base = `/Disponibilidad-Agua/${slug(`${reqWater.User.Name} ${reqWater.User.Surname1}`)}`;
    return base;
  }

  async ensureProjectFolder(reqWaterId: number, subfolder?: string) {
    const reqWater = await this.reqWaterSV.findOne(reqWaterId);

    const base = this.buildBasePath(reqWater);
    await this.dropbox.ensureFolder(base);
    let finalPath = base;

    if (subfolder) {
      finalPath = `${base}/${subfolder.replace(/^\/*/, '')}`;
      await this.dropbox.ensureFolder(finalPath);
    }

    // Si nunca guardaste SpaceOfDocument, persiste la base:
    if (!reqWater.SpaceOfDocument) {
      reqWater.SpaceOfDocument = base;
      await this.reqWaterSV.updateRequest(reqWater);
    }

    return finalPath;
  }

  async uploadMany(reqWaterId: number, files: Express.Multer.File[], subfolder?: string, uploadedByUserId?: number) {
    if (!files?.length) throw new BadRequestException('No se enviaron archivos');
    const reqWater = await this.reqWaterSV.findOne(reqWaterId);

    // Asegura carpeta
    const targetFolder = await this.ensureProjectFolder(reqWaterId, subfolder ?? 'Documentos');

    // Sube a Dropbox
    const payload = files.map((f) => ({
      buffer: f.buffer,
      path: `${targetFolder}/${f.originalname}`,
    }));
    const results = await this.dropbox.uploadMany(payload);

    // Persiste metadatos
    const rows = results.map((r, i) =>
      this.reqFileFileRepo.create({
        RequesAvailabilityWater: reqWater,
        Path: r.path_lower ?? `${targetFolder}/${files[i].originalname}`.toLowerCase(),
        FileName: r.name ?? files[i].originalname,
        MimeType: files[i].mimetype,
        Size: files[i].size,
        Rev: (r as any).rev,
        // UploadedBy: ... (si lo pasas)
      }),
    );
    await this.reqFileFileRepo.save(rows);
    return rows;
  }

  async list(reqWaterId: number) {
    return this.reqFileFileRepo.find({
      where: { RequesAvailabilityWater: { Id: reqWaterId } },
      order: { UploadedAt: 'DESC' },
    });
  }

  async tempLink(fileId: number) {
    const file = await this.reqFileFileRepo.findOne({ where: { Id: fileId }, relations: ['RequesAvailabilityWater'] });
    if (!file) throw new BadRequestException('Archivo no existe');
    const link = await this.dropbox.getTempLink(file.Path);
    return { ...link, file };
  }

  // async folderLink(fileId: number) {
  //   const file = await this.reqFileFileRepo.findOne({ where: { Id: fileId }, relations: ['RequesAvailabilityWater'] });
  //   if (!file) throw new BadRequestException('Archivo no existe');
  //   const link = await this.dropbox.getFolderLink(file.Path);
  //   return { link };
  // }

  async remove(fileId: number) {
    const file = await this.reqFileFileRepo.findOne({ where: { Id: fileId } });
    if (!file) throw new BadRequestException('Archivo no existe');

    await this.dropbox.delete(file.Path);
    await this.reqFileFileRepo.delete(fileId);
    return { ok: true };
  }

  
  async getFolderLink(reqWaterId: number) {
    const reqWater = await this.reqWaterSV.findOne(reqWaterId);

    return this.dropbox.getFolderLink(reqWater.SpaceOfDocument || this.buildBasePath(reqWater));
  }
}
