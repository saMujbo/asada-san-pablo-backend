import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { MoreThan, Repository } from 'typeorm';
import { CommentPaginationDto } from './dto/commentPagination.dto';
import { RecentCountDto } from './dto/recent-count.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    const newComment = this.commentRepo.create(createCommentDto);
    return await this.commentRepo.save(newComment);
  }

  async findAll() {
    return await this.commentRepo.find();
  }

  async search({ page = 1, limit = 10, read }: CommentPaginationDto) {
    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * take;

    const qb = this.commentRepo.createQueryBuilder('comment')
      .skip(skip)
      .take(take);

    // se aplica solo si viene definido (true o false)
    if (read) {
      qb.andWhere('comment.IsRead = :read', { read });
    }

    qb.orderBy('comment.IsRead', 'ASC');

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: take,
        pageCount: Math.max(1, Math.ceil(total / take)),
        hasNextPage: pageNum * take < total,
        hasPrevPage: pageNum > 1,
      },
    };
  }

  async findOne(Id: number) {
    const commentFound = await this.commentRepo.findOne({ 
      where: { Id, IsActive: true },
    });
    
    if (!commentFound) throw new NotFoundException(`Comment with Id ${Id} not found`);
    
    return commentFound;
  }

  async update(id: number) {
    const commentFound = await this.findOne(id);
    commentFound.IsRead = true;

    return await this.commentRepo.save(commentFound);
  }

  async remove(Id: number) {
    const commentDefuse = await this.findOne(Id);

    commentDefuse.IsActive = false;
    return await this.commentRepo.save(commentDefuse);
  }

  async recentCount({ hours, days, unread }: RecentCountDto) {
    // Ventana: prioriza days si viene, si no usa hours; default 24h
    const windowHours = days ? (Number(days) * 24) : (Number(hours) || 24);
    const from = new Date(Date.now() - windowHours * 60 * 60 * 1000);

    const where: any = {
      IsActive: true,
      CreatedAt: MoreThan(from),
    };

    if (unread !== undefined) {
      // unread viene como string 'true' | 'false'
      where.IsRead = (unread === 'true') ? false : true;
    }

    const count = await this.commentRepo.count({ where });
    return { count, from, windowHours, unread: unread ?? 'any' };
  }
}
