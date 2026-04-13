import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommentSupervisionMeter } from './entities/comment-supervision-meter.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestsupervisionMeterService } from 'src/requestsupervision-meter/requestsupervision-meter.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CommentSupervisionMeterService {
  constructor(
    @InjectRepository(CommentSupervisionMeter)
    private readonly commentRepo: Repository<CommentSupervisionMeter>,
    
    @Inject(forwardRef(() => RequestsupervisionMeterService))
    private readonly requestService: RequestsupervisionMeterService,
    
    @Inject(forwardRef(() => UsersService))
    private readonly userSv: UsersService,
  ) {}

  /**
   * ADMIN: Crear comentario SIN archivos
   */
  async createAdminComment(
    requestId: number,
    subject: string,
    comment: string,
    userId: number,
  ) {
    
    const request = await this.requestService.findOne(requestId)
    const user = await this.userSv.findOne(userId);
    const newComment = this.commentRepo.create({
      Subject: subject,
      Comment: comment,
      requestsupervisionMeter: request,
      User: user,
    });

    const saved = await this.commentRepo.save(newComment);
    return saved;
  }

  /**
   * VER: Obtener todos los comentarios de una solicitud
   */
  async findByRequestId(requestId: number) {
    const request = await this.requestService.findOne(requestId);
    
    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    
    const comments = await this.commentRepo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.requestsupervisionMeter', 'request')
      .leftJoinAndSelect('comment.User', 'user')
      .where('request.Id = :requestId', { requestId })
      .orderBy('comment.createdAt', 'ASC')
      .getMany();
    console.log('Comments details:', comments.map(c => ({
      id: c.Id,
      subject: c.Subject,
      requestId: c.requestsupervisionMeter?.Id,
      userId: c.User?.Id
    })));

    return comments;
  }

  async getAll() {
    const data = await this.commentRepo.find({
      relations: ['requestsupervisionMeter', 'User']
    });
    
    console.log('Sample:', data.slice(0, 3).map(c => ({
      id: c.Id,
      subject: c.Subject,
      requestId: c.requestsupervisionMeter?.Id
    })));
    
    return data;
  }
}