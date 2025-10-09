import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectFile } from './entities/project-file.entity';
import { Repository } from 'typeorm';
import { DropboxService } from 'src/dropbox/dropbox.service';
import { Project } from 'src/project/entities/project.entity';
import { slug } from 'src/utils/slug.util';
import { ProjectService } from 'src/project/project.service';

@Injectable()
export class ProjectFileService {
  constructor(
    @InjectRepository(ProjectFile) private readonly projectFileRepo: Repository<ProjectFile>,
    private readonly projectSV: ProjectService,
    private readonly dropbox: DropboxService,
  ) {}

  private buildBasePath(project: Project) {
    // Si ya guardaste la ruta base en SpaceOfDocument, úsala.
    if (project.SpaceOfDocument) return project.SpaceOfDocument.startsWith('/') ? project.SpaceOfDocument : `/${project.SpaceOfDocument}`;
    const base = `/Proyectos/${slug(project.Name)}`;
    return base;
  }

  async ensureProjectFolder(projectId: number, subfolder?: string) {
    const project = await this.projectSV.findOne(projectId);

    const base = this.buildBasePath(project);
    await this.dropbox.ensureFolder(base);
    let finalPath = base;

    if (subfolder) {
      finalPath = `${base}/${subfolder.replace(/^\/*/, '')}`;
      await this.dropbox.ensureFolder(finalPath);
    }

    // Si nunca guardaste SpaceOfDocument, persiste la base:
    if (!project.SpaceOfDocument) {
      project.SpaceOfDocument = base;
      await this.projectSV.updateProject(project);
    }

    return finalPath;
  }

  async uploadMany(projectId: number, files: Express.Multer.File[], subfolder?: string, uploadedByUserId?: number) {
    if (!files?.length) throw new BadRequestException('No se enviaron archivos');
    const project = await this.projectSV.findOne(projectId);

    // Asegura carpeta
    const targetFolder = await this.ensureProjectFolder(projectId, subfolder ?? 'Documentos');

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

  async list(projectId: number) {
    return this.projectFileRepo.find({
      where: { Project: { Id: projectId } },
      order: { UploadedAt: 'DESC' },
    });
  }

  async tempLink(fileId: number) {
    const file = await this.projectFileRepo.findOne({ where: { Id: fileId }, relations: ['Project'] });
    if (!file) throw new BadRequestException('Archivo no existe');
    const link = await this.dropbox.getTempLink(file.Path);
    return { ...link, file };
  }

  async remove(fileId: number) {
    const file = await this.projectFileRepo.findOne({ where: { Id: fileId } });
    if (!file) throw new BadRequestException('Archivo no existe');

    await this.dropbox.delete(file.Path);
    await this.projectFileRepo.delete(fileId);
    return { ok: true };
  }
}
