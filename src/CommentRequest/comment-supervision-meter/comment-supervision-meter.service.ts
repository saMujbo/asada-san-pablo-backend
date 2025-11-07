import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentSupervisionMeterDto } from './dto/create-comment-supervision-meter.dto';
import { UpdateCommentSupervisionMeterDto } from './dto/update-comment-supervision-meter.dto';
import { CommentSupervisionMeter } from './entities/comment-supervision-meter.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestsupervisionMeterService } from 'src/requestsupervision-meter/requestsupervision-meter.service';

@Injectable()
export class CommentSupervisionMeterService {
  constructor(
    @InjectRepository(CommentSupervisionMeter)
    private readonly commentRepo: Repository<CommentSupervisionMeter>,
    
    @Inject(forwardRef(() => RequestsupervisionMeterService))
    private readonly requestService: RequestsupervisionMeterService,
    
    // @Inject(forwardRef(() => RequestAvailabilityWaterFileService))
    // private readonly fileService: RequestAvailabilityWaterFileService,
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
      requestsupervisionMeter: request,
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
      where: { requestsupervisionMeter: { Id: requestId } },
      relations: ['requestChangeName'],
      order: { createdAt: 'ASC' },
    });
  }

  async getAll(){
    const data = await this.commentRepo.find()
    return data;
  }
}
