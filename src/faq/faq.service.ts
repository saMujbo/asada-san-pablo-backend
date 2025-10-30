import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFAQDto } from './dto/create-faq.dto';
import { UpdateFAQDto } from './dto/update-faq.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FAQ } from './entities/faq.entity';
import { Repository } from 'typeorm';

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
    return this.faqRepo.find();
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
