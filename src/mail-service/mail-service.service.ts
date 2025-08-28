import { Injectable } from '@nestjs/common';
import { CreateMailServiceDto } from './dto/create-mail-service.dto';
import { UpdateMailServiceDto } from './dto/update-mail-service.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { RecoverPasswordMail } from './templates/ForgotPassword';
import * as path from 'path';

@Injectable()
export class MailServiceService {
  constructor(
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendForgotpasswordEmail(createMailServiceDto: CreateMailServiceDto){
    try {

      await this.mailService.sendMail({
        from: 'RedSanPablo',
        to: createMailServiceDto.to,
        subject: createMailServiceDto.subject,
        text: createMailServiceDto?.message,
        html: await RecoverPasswordMail(createMailServiceDto.RecoverPasswordURL),
        attachments: [
          {
            filename: 'LogoRedSanPablo',
            path: './src/mail-service/assets/LogoRedSanPablo.png',
            cid: 'logoImage',
          },
        ],
      });
    } catch (error) {
      console.error('Error al enviar el correo electrónico'+ error);
    }
  }


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
