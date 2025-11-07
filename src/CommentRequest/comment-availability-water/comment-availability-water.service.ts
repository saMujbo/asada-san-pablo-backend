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
import { CommentAvailabilityWater } from './entities/comment-availability-water.entity';
import { RequesAvailabilityWaterService } from 'src/reques-availability-water/reques-availability-water.service';
import { RequestAvailabilityWaterFileService } from 'src/request-availability-water-file/request-availability-water-file.service';
import { RequestAvailabilityWaterFile } from 'src/request-availability-water-file/entities/request-availability-water-file.entity';

@Injectable()
export class CommentAvailabilityWaterService {
  constructor(
    @InjectRepository(CommentAvailabilityWater)
    private readonly commentRepo: Repository<CommentAvailabilityWater>,
    
    @Inject(forwardRef(() => RequesAvailabilityWaterService))
    private readonly requestService: RequesAvailabilityWaterService,
    
    @Inject(forwardRef(() => RequestAvailabilityWaterFileService))
    private readonly fileService: RequestAvailabilityWaterFileService,
  ) {}

  /**
   * 1. ADMIN: Crear comentario SIN archivos
   * Solo necesita: requestId, Subject, Comment
   */
  async createAdminComment(
    requestId: number,
    subject: string,
    comment: string
  ) {
    const request = await this.requestService.findOne(requestId);
    
    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    const newComment = this.commentRepo.create({
      Subject: subject,
      Comment: comment,
      requestAvailability: request,
      hasFileUpdate: false,
    });

    return await this.commentRepo.save(newComment);
  }

  /*
    2. VER: Obtener todos los comentarios de una solicitud
   */
  async findByRequestId(requestId: number) {
    const request = await this.requestService.findOne(requestId);
    
    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    return await this.commentRepo.find({
      where: { requestAvailability: { Id: requestId } },
      relations: ['requestAvailability'],
      order: { createdAt: 'ASC' },
    });
  }

  async getAll(){
    const data = await this.commentRepo.find()
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
    const replyComment = this.commentRepo.create({
      Subject: subject,
      Comment: comment,
      requestAvailability: request,
      hasFileUpdate: true,
    });

    const savedComment = await this.commentRepo.save(replyComment);

    // Subir archivos usando el User de la solicitud
    let uploadedFiles: RequestAvailabilityWaterFile[] = [];
    try {
      uploadedFiles = await this.fileService.uploadMany(
        requestId,
        files,
        'Comentarios',
        request.User.Id // ← UserId viene de la solicitud
      );
    } catch (error) {
      // Si falla, eliminar el comentario
      await this.commentRepo.delete(savedComment.Id);
      throw new BadRequestException(`Error al subir archivos: ${error.message}`);
    }

    return {
      comment: savedComment,
      filesUploaded: uploadedFiles.length,
      files: uploadedFiles,
    };
  }
}