import { Injectable } from '@nestjs/common';
import { CreateMailServiceDto } from './dto/create-mail-service.dto';
import { UpdateMailServiceDto } from './dto/update-mail-service.dto';

@Injectable()
export class MailServiceService {
  create(createMailServiceDto: CreateMailServiceDto) {
    return 'This action adds a new mailService';
  }

  findAll() {
    return `This action returns all mailService`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mailService`;
  }

  update(id: number, updateMailServiceDto: UpdateMailServiceDto) {
    return `This action updates a #${id} mailService`;
  }

  remove(id: number) {
    return `This action removes a #${id} mailService`;
  }
}
