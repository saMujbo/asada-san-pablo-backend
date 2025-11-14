import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentChangeMeterDto } from './dto/create-comment-change-meter.dto';
import { UpdateCommentChangeMeterDto } from './dto/update-comment-change-meter.dto';
import { CommentChangeMeter } from './entities/comment-change-meter.entity';
import { RequestChangeMeter } from 'src/request-change-meter/entities/request-change-meter.entity';
import { RequestChangeMeterService } from 'src/request-change-meter/request-change-meter.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CommentChangeMeterService {
  constructor(
    @InjectRepository(CommentChangeMeter)
    private readonly commentRepo: Repository<CommentChangeMeter>,
    
    @Inject(forwardRef(() => RequestChangeMeterService))
    private readonly requestService: RequestChangeMeterService,
    
    @Inject(forwardRef(() => UsersService))
    private readonly userSv: UsersService,
    
    // @Inject(forwardRef(() => RequestAvailabilityWaterFileService))
    // private readonly fileService: RequestAvailabilityWaterFileService,
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

    const newComment = this.commentRepo.create({
      Subject: subject,
      Comment: comment,
      requestChangeMeter: request,
      User: user,
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
      where: { requestChangeMeter: { Id: requestId } },
      relations: ['requestChangeMeter', 'User'],
      order: { createdAt: 'ASC' },
    });
  }

  async getAll(){
    const data = await this.commentRepo.find()
    return data;
  }

  // /**
  //   3. USUARIO: Responder con archivos
  //   Los archivos se suben a RequestAvailabilityWaterFile
  //   NO se guardan en CommentAvailabilityWater
  //  */
  // async replyWithFiles(
  //   requestId: number,
  //   subject: string,
  //   comment: string,
  //   files: Express.Multer.File[]
  // ) {
  //   if (!files || files.length === 0) {
  //     throw new BadRequestException('Debe enviar al menos un archivo');
  //   }

  //   const request = await this.requestService.findOne(requestId);
    
  //   if (!request) {
  //     throw new NotFoundException('Solicitud no encontrada');
  //   }

  //   // Crear comentario de respuesta
  //   const replyComment = this.commentRepo.create({
  //     Subject: subject,
  //     Comment: comment,
  //     requestAvailability: request,
  //     hasFileUpdate: true,
  //   });

  //   const savedComment = await this.commentRepo.save(replyComment);

  //   // Subir archivos usando el User de la solicitud
  //   let uploadedFiles: RequestAvailabilityWaterFile[] = [];
  //   try {
  //     uploadedFiles = await this.fileService.uploadMany(
  //       requestId,
  //       files,
  //       'Comentarios',
  //       request.User.Id // ← UserId viene de la solicitud
  //     );
  //   } catch (error) {
  //     // Si falla, eliminar el comentario
  //     await this.commentRepo.delete(savedComment.Id);
  //     throw new BadRequestException(`Error al subir archivos: ${error.message}`);
  //   }

  //   return {
  //     comment: savedComment,
  //     filesUploaded: uploadedFiles.length,
  //     files: uploadedFiles,
  //   };
  }

