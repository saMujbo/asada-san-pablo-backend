import { Injectable } from '@nestjs/common';
import { CreateMailServiceDto } from './dto/create-mail-service.dto';
import { UpdateMailServiceDto } from './dto/update-mail-service.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { RecoverPasswordMail } from './templates/ForgotPassword';
import * as path from 'path';
import { WelcomeMailASADA } from './templates/WelcomeMesage';
import { WelcomeMailASADADto } from './dto/welcome-mail-service.dto';

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
async sendWelcomeEmail(welcomeMailASADADto: WelcomeMailASADADto) {
  try {
    await this.mailService.sendMail({
      from: 'RedSanPablo',
      to: welcomeMailASADADto.to,               // correo destino
      subject: welcomeMailASADADto.subject,     // asunto, ej: "Bienvenido a RedSanPablo"
      text: welcomeMailASADADto?.message,       // versión de texto plano opcional
      html: await WelcomeMailASADA(welcomeMailASADADto.Name,welcomeMailASADADto.LoginURL),
      attachments: [
        {
          filename: 'LogoRedSanPablo.png',
          path: './src/mail-service/assets/LogoRedSanPablo.png',
          cid: 'logoImage', // debe coincidir con el cid del <img src="cid:logoImage">
        },
      ],
    });
  } catch (error) {
    console.error('Error al enviar correo de bienvenida: ' + error);
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
