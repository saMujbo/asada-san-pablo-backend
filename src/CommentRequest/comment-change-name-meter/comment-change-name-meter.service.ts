import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentChangeNameMeterDto } from './dto/create-comment-change-name-meter.dto';
import { UpdateCommentChangeNameMeterDto } from './dto/update-comment-change-name-meter.dto';
import { CommentChangeNameMeter } from './entities/comment-change-name-meter.entity';
import { RequestChangeNameMeterService } from 'src/request-change-name-meter/request-change-name-meter.service';
import { RequestChangeNameMeterFileService } from 'src/request-change-name-meter-file/request-change-name-meter-file.service';
import { RequestChangeMeter } from 'src/request-change-meter/entities/request-change-meter.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestChangeNameMeter } from 'src/request-change-name-meter/entities/request-change-name-meter.entity';
import { RequestChangeNameMeterFile } from 'src/request-change-name-meter-file/entities/request-change-name-meter-file.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CommentChangeNameMeterService {
  constructor(
    @InjectRepository(CommentChangeNameMeter)
    private readonly commentChangeNameMeterRepo: Repository<CommentChangeNameMeter>,
    
    @Inject(forwardRef(() => RequestChangeNameMeterService))
    private readonly requestService: RequestChangeNameMeterService,
    
    @Inject(forwardRef(() => UsersService))
    private readonly userSv: UsersService,
    
    @Inject(forwardRef(() => RequestChangeNameMeterFileService))
    private readonly fileService: RequestChangeNameMeterFileService,
  ) {}

  /**
   * 1. ADMIN: Crear comentario SIN archivos
   * Solo necesita: requestId, Subject, Comment, userId
   */
  async createAdminComment(
    requestId: number,
    subject: string,
    comment: string,
    userId: number,
  ) {
    const request = await this.requestService.findOne(requestId);
    const user = await this.userSv.findOne(userId);

    const newComment = this.commentChangeNameMeterRepo.create({
      Subject: subject,
      Comment: comment,
      requestChangeNameMeter: request,
      User: user,
    });

    return await this.commentChangeNameMeterRepo.save(newComment);
  }

  /*
    2. VER: Obtener todos los comentarios de una solicitud
   */
  async findByRequestId(requestId: number) {
    const request = await this.requestService.findOne(requestId);
    
    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    return await this.commentChangeNameMeterRepo.find({
      where: { requestChangeNameMeter: { Id: requestId } },
      relations: ['requestChangeNameMeter', 'User'],
      order: { createdAt: 'ASC' },
    });
  }

  async getAll(){
    const data = await this.commentChangeNameMeterRepo.find()
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
    userId: number,
    files: Express.Multer.File[]
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Debe enviar al menos un archivo');
    }

    const request = await this.requestService.findOne(requestId);
    const user = await this.userSv.findOne(userId);

    // Crear comentario de respuesta
    const replyComment = this.commentChangeNameMeterRepo.create({
      Subject: subject,
      Comment: comment,
      requestChangeNameMeter: request,
      User: user,
    });

    const savedComment = await this.commentChangeNameMeterRepo.save(replyComment);

    // Subir archivos usando el User de la solicitud
    let uploadedFiles: RequestChangeNameMeterFile[] = [];
    try {
      uploadedFiles = await this.fileService.uploadMany(
        requestId,
        files,
        'Comentarios',
        request.User.Id // ← UserId viene de la solicitud
      );
    } catch (error) {
      // Si falla, eliminar el comentario
      await this.commentChangeNameMeterRepo.delete(savedComment.Id);
      throw new BadRequestException(`Error al subir archivos: ${error.message}`);
    }

    return {
      comment: savedComment,
      filesUploaded: uploadedFiles.length,
      files: uploadedFiles,
    };
  }
}
