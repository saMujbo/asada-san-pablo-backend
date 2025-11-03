import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFAQDto } from './dto/create-faq.dto';
import { UpdateFAQDto } from './dto/update-faq.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FAQ } from './entities/faq.entity';
import { Repository } from 'typeorm';
import { MaterialPaginationDto } from 'src/material/dto/pagination-material.st';
import { FAQPaginationDto } from './dto/pagination-faq.dto';

@Injectable()
export class FaqService {
  constructor (
    @InjectRepository(FAQ)
    private readonly faqRepo: Repository<FAQ>
  ){ }

  async create(createFAQDto: CreateFAQDto) {
    const newFAQ = this.faqRepo.create(createFAQDto);

    return this.faqRepo.save(newFAQ);
  }

  async findAll() {
    return this.faqRepo.find({where: {IsActive: true}});
  }

  async search({ page =1, limit = 10, question, state}:FAQPaginationDto){
      const pageNum = Math.max(1, Number(page)||1);
      const take = Math.min(100, Math.max(1,Number(limit)||10));
      const skip = (pageNum -1)* take;

      const qb = this.faqRepo.createQueryBuilder('faq')
      .skip(skip)
      .take(take);
  
          if (question?.trim()) {
          qb.andWhere('LOWER(faq.Question) LIKE :question', {
            question: `%${question.trim().toLowerCase()}%`,
          });
        }
  
        // se aplica solo si viene definido (true o false)
        if (state) {
          qb.andWhere('faq.IsActive = :state', { state });
        }

            qb.orderBy('faq.Question', 'ASC');

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
    const faqFound = await this.faqRepo.findOneBy({ Id });
    if (!faqFound) {
      throw new NotFoundException(`FAQ with ID ${Id} not found`);
    }
    return faqFound;
  }

  async update(id: number, updateFaqDto: UpdateFAQDto) {
    const faq = await this.findOne(id);

    this.faqRepo.merge(faq, updateFaqDto);
    await this.faqRepo.save(faq);
    
    return faq;
  }

  async remove(id: number) {
    const faq = await this.findOne(id);

    faq.IsActive = false;
    return await this.faqRepo.save(faq);
  }
}
