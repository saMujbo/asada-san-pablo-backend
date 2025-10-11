import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';

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

  async findOne(Id: number) {
    const commentFound = await this.commentRepo.findOne({ 
      where: { Id, IsActive: true },
    });
    
    if (!commentFound) throw new NotFoundException(`Category with Id ${Id} not found`);
    
    return commentFound;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  async remove(Id: number) {
    const commentDefuse = await this.findOne(Id);

    commentDefuse.IsActive = false;
    return await this.commentRepo.save(commentDefuse);
  }
}
