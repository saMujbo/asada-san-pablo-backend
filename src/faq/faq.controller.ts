import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFAQDto } from './dto/create-faq.dto';
import { UpdateFAQDto } from './dto/update-faq.dto';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  create(@Body() createFaqDto: CreateFAQDto) {
    return this.faqService.create(createFaqDto);
  }

  @Get()
  findAll() {
    return this.faqService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.faqService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateFaqDto: UpdateFAQDto) {
    return this.faqService.update(id, updateFaqDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.faqService.remove(id);
  }
}
