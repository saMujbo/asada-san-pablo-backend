import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import { extname } from 'path';
import { hasNonEmptyString, isValidDate } from 'src/utils/validation.utils';
import { ProjectPaginationDto } from './dto/pagination-project.dto';
import { ProjectStateService } from './project-state/project-state.service';
import { UsersService } from 'src/users/users.service';
import { TotalActualExpenseService } from 'src/total-actual-expense/total-actual-expense.service';
import { buildPaginationMeta } from 'src/common/pagination/pagination.util';
import { PaginatedResponse } from 'src/common/pagination/types/paginated-response';
import { DropboxService } from 'src/dropbox/dropbox.service';
import { slug } from 'src/utils/slug.util';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @Inject(forwardRef(() => ProjectStateService))
    private readonly projectStateSv: ProjectStateService,
    private readonly userSv: UsersService,
    @Inject(forwardRef(() => TotalActualExpenseService))
    private readonly totalAESv: TotalActualExpenseService,
    private readonly dropbox: DropboxService,
  ){}

  private buildBasePath(project: Project) {
    if (project.SpaceOfDocument) {
      return project.SpaceOfDocument.startsWith('/') ? project.SpaceOfDocument : `/${project.SpaceOfDocument}`;
    }

    return `/Proyectos/${slug(project.Name)}`;
  }

  private async ensureProjectBaseFolder(project: Project) {
    const basePath = this.buildBasePath(project);
    await this.dropbox.ensureFolder(basePath);

    if (!project.SpaceOfDocument) {
      project.SpaceOfDocument = basePath;
      await this.projectRepo.save(project);
    }

    return basePath;
  }

  async create(createProjectDto: CreateProjectDto) {
    const { ProjectStateId, UserId,...rest } = createProjectDto;

    const normalizedName = rest.Name.trim().toLowerCase();
    const existingProject = await this.projectRepo
      .createQueryBuilder('project')
      .where('LOWER(project.Name) = :name', { name: normalizedName })
      .getOne();

    if (existingProject) {
      throw new ConflictException('Ya existe un proyecto con ese nombre.');
    }

    if (rest.InnitialDate && rest.EndDate) {
      const ini = new Date(rest.InnitialDate);
      const end = new Date(rest.EndDate);
      if (!isNaN(ini.getTime()) && !isNaN(end.getTime()) && end < ini) {
        throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de finalización.');
      }
    }
    const projectState = await this.projectStateSv.findOne(ProjectStateId);
    const user = await this.userSv.findOne(UserId);
    const project = this.projectRepo.create({ ProjectState: projectState, User: user, ...rest });
    await this.projectRepo.save(project);

    await this.totalAESv.create({ProjectId: project.Id});
    return project;
  }

  async findAll() {
    return await this.projectRepo.find({where:{IsActive:true}, relations:[
      'ProjectState',
      'ProjectProjection', 
      'ProjectProjection.ProductDetails', 
      'ProjectProjection.ProductDetails.Product',
      'ProjectProjection.ProductDetails.Product.Category',
      'ProjectProjection.ProductDetails.Product.UnitMeasure', 
      'TraceProject',
      'TraceProject.ActualExpense',
      'TraceProject.ActualExpense.ProductDetails',
      'TraceProject.ActualExpense.ProductDetails.Product',
      'TraceProject.ActualExpense.ProductDetails.Product.Category',
      'TraceProject.ActualExpense.ProductDetails.Product.UnitMeasure',
      'User',
      'ProjectFiles',
      'TotalActualExpense',
      'TotalActualExpense.ProductDetails',
      'TotalActualExpense.ProductDetails.Product',
      'TotalActualExpense.ProductDetails.Product.Category',
      'TotalActualExpense.ProductDetails.Product.UnitMeasure',
    ] });
  }
  
  async search({
    page = 1,
    limit = 10,
    name,
    projectState,
  }: ProjectPaginationDto): Promise<PaginatedResponse<Project>> {
    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * take;

    const qb = this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.ProjectState', 'ProjectState')
      .leftJoinAndSelect('project.User', 'User')
      .leftJoinAndSelect('project.TraceProject', 'TraceProject')
      .leftJoinAndSelect('project.ProjectFiles', 'ProjectFiles')
      .leftJoinAndSelect('project.ProjectProjection', 'ProjectProjection')
      .leftJoinAndSelect('ProjectProjection.ProductDetails', 'ProductDetails')
      .leftJoinAndSelect('ProductDetails.Product', 'Product')
      .leftJoinAndSelect('Product.Category', 'Category')
      .leftJoinAndSelect('Product.UnitMeasure', 'UnitMeasure')
      .leftJoinAndSelect('TraceProject.ActualExpense', 'ActualExpense')
      .leftJoinAndSelect('ActualExpense.ProductDetails', 'ActualExpenseProductDetails')
      .leftJoinAndSelect('ActualExpenseProductDetails.Product', 'ActualExpenseProduct')
      .leftJoinAndSelect('ActualExpenseProduct.Category', 'ActualExpenseCategory')
      .leftJoinAndSelect('ActualExpenseProduct.UnitMeasure', 'ActualExpenseUnitMeasure')
      .leftJoinAndSelect('project.TotalActualExpense', 'TotalActualExpense')
      .leftJoinAndSelect('TotalActualExpense.ProductDetails', 'TotalActualExpenseProductDetails')
      .leftJoinAndSelect('TotalActualExpenseProductDetails.Product', 'TotalActualExpenseProduct')
      .leftJoinAndSelect('TotalActualExpenseProduct.Category', 'TotalActualExpenseCategory')
      .leftJoinAndSelect('TotalActualExpenseProduct.UnitMeasure', 'TotalActualExpenseUnitMeasure')
      .skip(skip)
      .take(take);

    if (name?.trim()) {
      qb.andWhere('LOWER(project.Name) LIKE :name', {
        name: `%${name.trim().toLowerCase()}%`,
      });
    }

    if (projectState) {
      qb.andWhere('project.ProjectState = :projectState', { projectState });
    }

    qb.orderBy('project.Name', 'ASC');
    const [data, totalItems] = await qb.getManyAndCount();

    return {
      data,
      meta: buildPaginationMeta({
        totalItems,
        page: pageNum,
        limit: take,
        itemCount: data.length,
      }),
    };
  }

  async findOne(Id: number) {
    const foundProject = await this.projectRepo.findOne({
      where: { Id, IsActive: true },
      relations:[
      'ProjectState',
      'ProjectProjection', 
      'ProjectProjection.ProductDetails', 
      'ProjectProjection.ProductDetails.Product',
      'ProjectProjection.ProductDetails.Product.Category',
      'ProjectProjection.ProductDetails.Product.UnitMeasure', 
      'TraceProject',
      'TraceProject.ActualExpense',
      'TraceProject.ActualExpense.ProductDetails',
      'TraceProject.ActualExpense.ProductDetails.Product',
      'TraceProject.ActualExpense.ProductDetails.Product.Category',
      'TraceProject.ActualExpense.ProductDetails.Product.UnitMeasure',
      'User',
      'ProjectFiles',
      'TotalActualExpense',
      'TotalActualExpense.ProductDetails',
      'TotalActualExpense.ProductDetails.Product',
      'TotalActualExpense.ProductDetails.Product.Category',
      'TotalActualExpense.ProductDetails.Product.UnitMeasure',
    ]
    });
    
    if(!foundProject) throw new NotFoundException(`Project with Id ${Id} not found`);
    return foundProject;
  }

  async buildProjectPdf(Id: number): Promise<{ buffer: Buffer; filename: string }> {
    const project = await this.findOne(Id);

    const stripHtml = (value?: string | null) =>
      (value ?? '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
        .replace(/<li>/gi, '• ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]{2,}/g, ' ')
        .trim();

    const formatDate = (value?: Date | string | null) => {
      if (!value) return '—';
      const dt = new Date(value);
      return Number.isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('es-CR');
    };

    const safeName = (project.Name ?? `proyecto-${Id}`)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();

    const filename = `${safeName || `proyecto-${Id}`}.pdf`;

    const userName =
      [project.User?.Name, project.User?.Surname1, project.User?.Surname2]
        .filter(Boolean)
        .join(' ')
        .trim() || '—';

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve({ buffer: Buffer.concat(chunks), filename }));
      doc.on('error', reject);

      const ensureSpace = (required = 80) => {
        if (doc.y + required > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
        }
      };

      const section = (title: string) => {
        ensureSpace(36);
        doc.moveDown(0.4);
        doc.font('Helvetica-Bold').fontSize(13).fillColor('#091540').text(title);
        doc.moveDown(0.2);
        doc.strokeColor('#D9E0EA').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.5);
      };

      const line = (label: string, value: string) => {
        ensureSpace(20);
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text(`${label}: `, { continued: true });
        doc.font('Helvetica').fillColor('#374151').text(value || '—');
      };

      const paragraph = (value?: string | null, fallback = '—') => {
        ensureSpace(36);
        doc.font('Helvetica').fontSize(10).fillColor('#374151').text(stripHtml(value) || fallback, {
          lineGap: 2,
        });
        doc.moveDown(0.6);
      };

      doc.font('Helvetica-Bold').fontSize(18).fillColor('#091540').text('Reporte de Proyecto', {
        align: 'center',
      });
      doc.moveDown(0.4);
      doc.font('Helvetica').fontSize(11).fillColor('#374151').text(project.Name ?? `Proyecto ${project.Id}`, {
        align: 'center',
      });
      doc.moveDown(1);

      section('Informacion general');
      line('ID', String(project.Id ?? '—'));
      line('Nombre', project.Name ?? '—');
      line('Ubicacion', project.Location ?? '—');
      line('Fecha de inicio', formatDate(project.InnitialDate));
      line('Fecha de fin', formatDate(project.EndDate));
      line('Estado', project.ProjectState?.Name ?? '—');
      line('Encargado', userName);

      section('Objetivo');
      paragraph(project.Objective, 'Sin objetivo registrado.');

      section('Descripcion');
      paragraph(project.Description, 'Sin descripcion registrada.');

      if (stripHtml(project.Observation)) {
        section('Observaciones');
        paragraph(project.Observation);
      }

      if (project.ProjectProjection) {
        section('Proyeccion');

        if (stripHtml(project.ProjectProjection.Observation)) {
          paragraph(project.ProjectProjection.Observation);
        }

        const projectedDetails = project.ProjectProjection.ProductDetails ?? [];
        if (projectedDetails.length === 0) {
          paragraph('', 'Sin productos proyectados.');
        } else {
          projectedDetails.forEach((detail) => {
            ensureSpace(24);
            const productName = detail.Product?.Name ?? 'Producto';
            const unit = detail.Product?.UnitMeasure?.Name ?? 'unidad';
            const category = detail.Product?.Category?.Name ?? '—';
            doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text(productName);
            doc.font('Helvetica').fontSize(10).fillColor('#374151').text(
              `Cantidad proyectada: ${detail.Quantity ?? 0} ${unit} | Categoria: ${category}`,
            );
            doc.moveDown(0.4);
          });
        }
      }

      section('Seguimientos');
      const traces = (project.TraceProject ?? []).filter((trace) => trace?.IsActive !== false);
      if (traces.length === 0) {
        paragraph('', 'Sin seguimientos registrados.');
      } else {
        traces.forEach((trace, index) => {
          ensureSpace(48);
          doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text(
            `${index + 1}. ${trace.Name || 'Seguimiento'}`,
          );
          doc.font('Helvetica').fontSize(10).fillColor('#374151').text(`Fecha: ${formatDate((trace as any).date)}`);
          if (stripHtml(trace.Observation)) {
            paragraph(trace.Observation, '');
          } else {
            doc.moveDown(0.4);
          }

          const details = trace.ActualExpense?.ProductDetails ?? [];
          details.forEach((detail) => {
            ensureSpace(18);
            const productName = detail.Product?.Name ?? 'Producto';
            const unit = detail.Product?.UnitMeasure?.Name ?? 'unidad';
            doc.font('Helvetica').fontSize(9).fillColor('#4B5563').text(
              `• ${productName}: ${detail.Quantity ?? 0} ${unit}`,
            );
          });
          doc.moveDown(0.5);
        });
      }

      doc.end();
    });
  }

  async uploadCoverImage(Id: number, file: Express.Multer.File) {
    const project = await this.findOne(Id);

    if (!file?.buffer?.length) {
      throw new BadRequestException('No se recibió ningún archivo para la portada.');
    }

    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('La portada debe ser una imagen válida.');
    }

    const basePath = await this.ensureProjectBaseFolder(project);
    const coverFolder = `${basePath}/Portada`;
    await this.dropbox.ensureFolder(coverFolder);

    const rawName = file.originalname?.replace(/\.[^.]+$/, '') || `portada-${project.Id}`;
    const extension = extname(file.originalname || '').toLowerCase() || '.jpg';
    const safeName = slug(rawName) || `portada-${project.Id}`;
    const destinationPath = `${coverFolder}/${Date.now()}-${safeName}${extension}`;

    if (project.CoverImagePath) {
      try {
        await this.dropbox.delete(project.CoverImagePath);
      } catch {
        // Si el archivo anterior ya no existe en Dropbox, no bloqueamos el reemplazo.
      }
    }

    const uploaded = await this.dropbox.uploadBuffer(file.buffer, destinationPath);
    const storedPath = uploaded.path_lower ?? destinationPath.toLowerCase();
    const coverUrl = await this.dropbox.getFileSharedLink(storedPath);

    project.CoverImagePath = storedPath;
    project.CoverImageUrl = coverUrl;

    return this.projectRepo.save(project);
  }

  async removeCoverImage(Id: number) {
    const project = await this.findOne(Id);

    if (project.CoverImagePath) {
      try {
        await this.dropbox.delete(project.CoverImagePath);
      } catch {
        // Si ya no existe en Dropbox, limpiamos igualmente la referencia local.
      }
    }

    project.CoverImagePath = null;
    project.CoverImageUrl = null;

    await this.projectRepo.save(project);
    return { ok: true };
  }

  async update(Id: number, updateProjectDto: UpdateProjectDto) {
    const updateProject = await this.projectRepo.findOne({where:{Id}});
    
    if(!updateProject) throw new ConflictException(`Project with Id ${Id} not found`);
    
    if (hasNonEmptyString(updateProjectDto.Name) && updateProjectDto.Name !== undefined) 
      updateProject.Name = updateProjectDto.Name;
    
    if (hasNonEmptyString(updateProjectDto.Location) && updateProjectDto.Location !== undefined) 
      updateProject.Location = updateProjectDto.Location;
    
    if (isValidDate(updateProjectDto.InnitialDate) && updateProjectDto.InnitialDate !== undefined) 
      updateProject.InnitialDate = updateProjectDto.InnitialDate as any;
    
    if (isValidDate(updateProjectDto.EndDate) && updateProjectDto.EndDate !== undefined) 
      updateProject.EndDate = updateProjectDto.EndDate as any;
    
    if (hasNonEmptyString(updateProjectDto.Objective) && updateProjectDto.Objective !== undefined) 
      updateProject.Objective = updateProjectDto.Objective;
    
    if (hasNonEmptyString(updateProjectDto.Description) && updateProjectDto.Description !== undefined) 
      updateProject.Description = updateProjectDto.Description;
    
    if (hasNonEmptyString(updateProjectDto.Observation) && updateProjectDto.Observation !== undefined) 
      updateProject.Observation = updateProjectDto.Observation;
    
    if (hasNonEmptyString(updateProjectDto.SpaceOfDocument) && updateProjectDto.SpaceOfDocument !== undefined) 
      updateProject.SpaceOfDocument = updateProjectDto.SpaceOfDocument;

    if(updateProjectDto.UserId !== undefined && updateProjectDto.UserId != null) {
      updateProject.User = await this.userSv.findOne(updateProjectDto.UserId);
    }

    if (updateProjectDto.IsActive !== undefined && updateProjectDto.IsActive != null) 
      updateProject.IsActive = updateProjectDto.IsActive;

    if (updateProjectDto.CanComment !== undefined && updateProjectDto.CanComment !== null) 
      updateProject.CanComment = updateProjectDto.CanComment;

    if (updateProjectDto.ProjectStateId !== undefined)
      updateProject.ProjectState = await this.projectStateSv.findOne(updateProjectDto.ProjectStateId);
    
    return await this.projectRepo.save(updateProject);
  }

  async updateState(Id: number, projectStateId: number) {
    const project = await this.findOne(Id);

    project.ProjectState = await this.projectStateSv.findOne(projectStateId);
    return await this.projectRepo.save(project);
  }

  async updateProject(project: Project) {
    return await this.projectRepo.save(project);
  }

  async remove(Id: number) {
    const project = await this.findOne(Id);
  
    project.IsActive = false;
    return await this.projectRepo.save(project);
  }

  async isOnProjectState(Id: number) {
    const hasActiveProjectState = await this.projectRepo.exists({
      where: { ProjectState: { Id }, IsActive: true },
    });
    return hasActiveProjectState;
  }
  async isTraceProjectOnProject(Id: number) {
    const hasActiveTraceProject = await this.projectRepo.exists({
      where: {TraceProject:{Id}, IsActive:true},
    });
    return hasActiveTraceProject;
  }

  async countByState(stateId: number): Promise<number> {
    return this.projectRepo.count({
      where: {
        ProjectState: { Id: stateId }, // ajusta el nombre de la relación si difiere
        IsActive: true,
      },
    });
  }
}
