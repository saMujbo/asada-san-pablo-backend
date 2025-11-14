// comment-availability-water.service.ts
import { 
  forwardRef, 
  Inject, 
  Injectable, 
  NotFoundException,
  BadRequestException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentAssociated } from './entities/comment-associated.entity';
import { RequestAssociated } from 'src/request-associated/entities/request-associated.entity';
import { RequestAssociatedService } from 'src/request-associated/request-associated.service';
import { RequestAssociatedFileService } from 'src/request-associated-file/request-associated-file.service';
import { RequestAssociatedFile } from 'src/request-associated-file/entities/request-associated-file.entity';


@Injectable()
export class CommentAssociatedService {
  constructor(
    @InjectRepository(CommentAssociated)
    private readonly commentAssociatedrep: Repository<CommentAssociated>,
    
    @Inject(forwardRef(() => RequestAssociatedService))
    private readonly requestService: RequestAssociatedService,
    
    @Inject(forwardRef(() => RequestAssociatedFileService))
    private readonly fileService: RequestAssociatedFileService,
  ) {}

  /**
   * 1. ADMIN: Crear comentario SIN archivos
   * Solo necesita: requestId, Subject, Comment
   */
  async createAdminCommentAssociated(
    requestId: number,
    subject: string,
    comment: string
  ) {
    const request = await this.requestService.findOne(requestId);
    
    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    const newComment = this.commentAssociatedrep.create({
      Subject: subject,
      Comment: comment,
      requestAssociated: request,
    });

    return await this.commentAssociatedrep.save(newComment);
  }

  /*
    2. VER: Obtener todos los comentarios de una solicitud
   */
  async findByRequestAssociatedId(requestId: number) {
    const request = await this.requestService.findOne(requestId);
    
    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    return await this.commentAssociatedrep.find({
      where: { requestAssociated: { Id: requestId } },
      relations: ['requestAssociated'],
      order: { createdAt: 'ASC' },
    });
  }

  async getAll(){
    const data = await this.commentAssociatedrep.find()
    return data;
  }

  /**
    3. USUARIO: Responder con archivos
    Los archivos se suben a RequestAvailabilityWaterFile
    NO se guardan en CommentAvailabilityWater
   */
  async replyWithFiles(
    requestId: number,
    subject: string,
    comment: string,
    files: Express.Multer.File[]
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Debe enviar al menos un archivo');
    }

    const request = await this.requestService.findOne(requestId);
    
    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    // Crear comentario de respuesta
    const replyComment = this.commentAssociatedrep.create({
      Subject: subject,
      Comment: comment,
      requestAssociated: request,
    });

    const savedComment = await this.commentAssociatedrep.save(replyComment);

    // Subir archivos usando el User de la solicitud
    let uploadedFiles: RequestAssociatedFile[];
    try {
      uploadedFiles = await this.fileService.uploadMany(
        requestId,
        files,
        'Comentarios',
        request.User.Id // ← UserId viene de la solicitud
      );
    } catch (error) {
      // Si falla, eliminar el comentario
      await this.commentAssociatedrep.delete(savedComment.Id);
      throw new BadRequestException(`Error al subir archivos: ${error.message}`);
    }

    return {
      comment: savedComment,
      filesUploaded: uploadedFiles.length,
      files: uploadedFiles,
    };
  }
}