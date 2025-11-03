import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateRequestAssociatedFileDto } from './dto/create-request-associated-file.dto';
import { UpdateRequestAssociatedFileDto } from './dto/update-request-associated-file.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestAssociatedFile } from './entities/request-associated-file.entity';
import { Repository } from 'typeorm';
import { ProjectService } from 'src/project/project.service';
import { RequestAssociatedService } from 'src/request-associated/request-associated.service';
import { DropboxService } from 'src/dropbox/dropbox.service';
import { RequestAssociated } from 'src/request-associated/entities/request-associated.entity';
import { slug } from 'src/utils/slug.util';

@Injectable()
export class RequestAssociatedFileService {
  constructor(
    @InjectRepository(RequestAssociatedFile) private readonly requestAssociatedFileRepo: Repository<RequestAssociatedFile>,
    private readonly requestAssociatedSV: RequestAssociatedService,
    @Inject(forwardRef(()=> DropboxService))
    private readonly dropbox: DropboxService,
  ) {}

  private buildBasePath(requestAssociated:RequestAssociated) {
    // Si ya guardaste la ruta base en SpaceOfDocument, úsala.
    if (requestAssociated.SpaceOfDocument) return requestAssociated.SpaceOfDocument.startsWith('/') ? requestAssociated.SpaceOfDocument : `/${requestAssociated.SpaceOfDocument}`;
    const base = `/Solicitud-Asociado/${slug(requestAssociated.User.Name)}`;
    return base;
  }

  async ensureProjectFolder(requestAssociatedId: number, subfolder?: string) {
    const requestAssociated = await this.requestAssociatedSV.findOne(requestAssociatedId);

    const base = this.buildBasePath(requestAssociated);
    await this.dropbox.ensureFolder(base);
    let finalPath = base;

    if (subfolder) {
      finalPath = `${base}/${subfolder.replace(/^\/*/, '')}`;
      await this.dropbox.ensureFolder(finalPath);
    }

    // Si nunca guardaste SpaceOfDocument, persiste la base:
    if (!requestAssociated.SpaceOfDocument) {
      requestAssociated.SpaceOfDocument = base;
      await this.requestAssociatedSV.updateRequestAssociated(requestAssociated);
    }

    return finalPath;
  }

  async uploadMany(requestAssociatedIdId: number, files: Express.Multer.File[], subfolder?: string, uploadedByUserId?: number) {
    if (!files?.length) throw new BadRequestException('No se enviaron archivos');
    const requestAssociated = await this.requestAssociatedSV.findOne(requestAssociatedIdId);

    // Asegura carpeta
    const targetFolder = await this.ensureProjectFolder(requestAssociatedIdId, subfolder ?? 'Documentos');

    // Sube a Dropbox
    const payload = files.map((f) => ({
      buffer: f.buffer,
      path: `${targetFolder}/${f.originalname}`,
    }));
    const results = await this.dropbox.uploadMany(payload);

    // Persiste metadatos
    const rows = results.map((r, i) =>
      this.requestAssociatedFileRepo.create({
        RequestAssociated: requestAssociated,
        Path: r.path_lower ?? `${targetFolder}/${files[i].originalname}`.toLowerCase(),
        FileName: r.name ?? files[i].originalname,
        MimeType: files[i].mimetype,
        Size: files[i].size,
        Rev: (r as any).rev,
        // UploadedBy: ... (si lo pasas)
      }),
    );
    await this.requestAssociatedFileRepo.save(rows);
    return rows;
  }

  async list(requestAssociatedId: number) {
    return this.requestAssociatedFileRepo.find({
      where: { RequestAssociated: { Id:requestAssociatedId } },
      order: { UploadedAt: 'DESC' },
    });
  }

  async tempLink(fileId: number) {
    const file = await this.requestAssociatedFileRepo.findOne({ where: { Id: fileId }, relations: ['RequestAssociated'] });
    if (!file) throw new BadRequestException('Archivo no existe');
    const link = await this.dropbox.getTempLink(file.Path);
    return { ...link, file };
  }

  async getFolderLink(reqWaterId: number) {
    const requestAssociated = await this.requestAssociatedSV.findOne(reqWaterId);

    return this.dropbox.getFolderLink(requestAssociated.SpaceOfDocument || this.buildBasePath(requestAssociated));
  }

  async remove(fileId: number) {
    const file = await this.requestAssociatedFileRepo.findOne({ where: { Id: fileId } });
    if (!file) throw new BadRequestException('Archivo no existe');

    await this.dropbox.delete(file.Path);
    await this.requestAssociatedFileRepo.delete(fileId);
    return { ok: true };
  }
}
