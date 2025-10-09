import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MailServiceService } from './mail-service.service';
import { CreateMailServiceDto } from './dto/create-mail-service.dto';
import { UpdateMailServiceDto } from './dto/update-mail-service.dto';

@Controller('mail-service')
export class MailServiceController {
  constructor(private readonly mailServiceService: MailServiceService) {}

  @Post()
  create(@Body() createMailServiceDto: CreateMailServiceDto) {
    return this.mailServiceService.sendForgotpasswordEmail(createMailServiceDto);
  }

  @Get()
  findAll() {
    return this.mailServiceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mailServiceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMailServiceDto: UpdateMailServiceDto) {
    return this.mailServiceService.update(+id, updateMailServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mailServiceService.remove(+id);
  }
}
