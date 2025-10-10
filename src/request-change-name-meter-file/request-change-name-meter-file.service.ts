import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateRequestChangeNameMeterFileDto } from './dto/create-request-change-name-meter-file.dto';
import { UpdateRequestChangeNameMeterFileDto } from './dto/update-request-change-name-meter-file.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestChangeNameMeterFile } from './entities/request-change-name-meter-file.entity';
import { Repository } from 'typeorm';
import { RequestChangeNameMeterService } from 'src/request-change-name-meter/request-change-name-meter.service';
import { DropboxService } from 'src/dropbox/dropbox.service';
import { RequestChangeNameMeter } from 'src/request-change-name-meter/entities/request-change-name-meter.entity';
import { slug } from 'src/utils/slug.util';

@Injectable()
export class RequestChangeNameMeterFileService {
  constructor(
    @InjectRepository(RequestChangeNameMeterFile) private readonly projectFileRepo: Repository<RequestChangeNameMeterFile>,
    private readonly requestChangeNameMeterSv: RequestChangeNameMeterService,
    @Inject(forwardRef(()=> DropboxService))
    private readonly dropbox: DropboxService,
  ) {}

  private buildBasePath(requestChangeNameMeter: RequestChangeNameMeter) {
    // Si ya guardaste la ruta base en SpaceOfDocument, úsala.
    if (requestChangeNameMeter.SpaceOfDocument) return requestChangeNameMeter.SpaceOfDocument.startsWith('/') ? requestChangeNameMeter.SpaceOfDocument : `/${requestChangeNameMeter.SpaceOfDocument}`;
    const base = `/Cambio-Nombre-Medidor/${slug(requestChangeNameMeter.User.Name)}`;
    return base;
  }

  async ensureProjectFolder(projectId: number, subfolder?: string) {
    const requestChangeNameMeter = await this.requestChangeNameMeterSv.findOne(projectId);

    const base = this.buildBasePath(requestChangeNameMeter);
    await this.dropbox.ensureFolder(base);
    let finalPath = base;

    if (subfolder) {
      finalPath = `${base}/${subfolder.replace(/^\/*/, '')}`;
      await this.dropbox.ensureFolder(finalPath);
    }

    // Si nunca guardaste SpaceOfDocument, persiste la base:
    if (!requestChangeNameMeter.SpaceOfDocument) {
      requestChangeNameMeter.SpaceOfDocument = base;
      await this.requestChangeNameMeterSv.updateRequestChangeNameMeter(requestChangeNameMeter);
    }

    return finalPath;
  }

  async uploadMany(RequestChangeNameMeterId: number, files: Express.Multer.File[], subfolder?: string, uploadedByUserId?: number) {
    if (!files?.length) throw new BadRequestException('No se enviaron archivos');
    const project = await this.requestChangeNameMeterSv.findOne(RequestChangeNameMeterId);

    // Asegura carpeta
    const targetFolder = await this.ensureProjectFolder(RequestChangeNameMeterId, subfolder ?? 'Documentos');

    // Sube a Dropbox
    const payload = files.map((f) => ({
      buffer: f.buffer,
      path: `${targetFolder}/${f.originalname}`,
    }));
    const results = await this.dropbox.uploadMany(payload);

    // Persiste metadatos
    const rows = results.map((r, i) =>
      this.projectFileRepo.create({
        Project: project,
        Path: r.path_lower ?? `${targetFolder}/${files[i].originalname}`.toLowerCase(),
        FileName: r.name ?? files[i].originalname,
        MimeType: files[i].mimetype,
        Size: files[i].size,
        Rev: (r as any).rev,
        // UploadedBy: ... (si lo pasas)
      }),
    );
    await this.projectFileRepo.save(rows);
    return rows;
  }

  async list(RequestChangeNameMeterId: number) {
    return this.projectFileRepo.find({
      where: { Project: { Id: RequestChangeNameMeterId } },
      order: { UploadedAt: 'DESC' },
    });
  }

  async tempLink(RequestChangeNameMeterId: number) {
    const file = await this.projectFileRepo.findOne({ where: { Id:RequestChangeNameMeterId}, relations: ['Project'] });
    if (!file) throw new BadRequestException('Archivo no existe');
    const link = await this.dropbox.getTempLink(file.Path);
    return { ...link, file };
  }

  async remove(RequestChangeNameMeterId: number) {
    const file = await this.projectFileRepo.findOne({ where: { Id: RequestChangeNameMeterId } });
    if (!file) throw new BadRequestException('Archivo no existe');

    await this.dropbox.delete(file.Path);
    await this.projectFileRepo.delete(RequestChangeNameMeterId);
    return { ok: true };
  }
}
