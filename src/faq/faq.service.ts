import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFAQDto } from './dto/create-faq.dto';
import { UpdateFAQDto } from './dto/update-faq.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FAQ } from './entities/faq.entity';
import { Repository } from 'typeorm';
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

async update(Id: number, updateFaqDto: UpdateFAQDto) {
  const foundFaq = await this.faqRepo.findOne({ where: { Id } });

  if (!foundFaq) {
    throw new ConflictException(`FAQ with Id ${Id} not found`);
  }

  if (
    updateFaqDto.Question !== undefined &&
    updateFaqDto.Question != null &&
    updateFaqDto.Question !== ''
  ) {
    foundFaq.Question = updateFaqDto.Question;
  }

  if (
    updateFaqDto.Answer !== undefined &&
    updateFaqDto.Answer != null &&
    updateFaqDto.Answer !== ''
  ) {
    foundFaq.Answer = updateFaqDto.Answer;
  }

  if (updateFaqDto.IsActive !== undefined && updateFaqDto.IsActive != null) {
    foundFaq.IsActive = updateFaqDto.IsActive;
  }

  return await this.faqRepo.save(foundFaq);
}


  async remove(id: number) {
    const faq = await this.findOne(id);

    faq.IsActive = false;
    return await this.faqRepo.save(faq);
  }
}
