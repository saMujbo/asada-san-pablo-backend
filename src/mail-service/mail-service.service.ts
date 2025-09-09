import { Injectable } from '@nestjs/common';
import { CreateMailServiceDto } from './dto/create-mail-service.dto';
import { UpdateMailServiceDto } from './dto/update-mail-service.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { RecoverPasswordMail } from './templates/ForgotPassword';
import * as path from 'path';
import { WelcomeMailASADA } from './templates/WelcomeMesage';
import { WelcomeMailASADADto } from './dto/welcome-mail-service.dto';
import { AdminUserMailASADADto } from './dto/admin-create-user.dto';
import { WelcomeTempPasswordMail } from './templates/Password-defa';

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
  async sendWelcomeTempPasswordEmail(dto:AdminUserMailASADADto) {
    try {
      await this.mailService.sendMail({
        from: 'RedSanPablo <no-reply@redsnp.cr>',
        to: dto.to,
        subject: dto.subject,
        // versión texto plano (opcional)
        text: `Hola ${dto.Name},\n\nSe ha creado tu cuenta en RedSanPablo.\n\nUsuario: ${dto.to}\nContraseña temporal: ${dto.temPasswordL}\n\nPor seguridad, cámbiala lo antes posible.\nAccede aquí: ${dto.LoginURL}\n\n© 2025 ASADA San Pablo`,
        // versión HTML con template
        html: await WelcomeTempPasswordMail(dto.Name, dto.LoginURL, dto.temPasswordL),
        attachments: [
          {
            filename: 'LogoRedSanPablo.png',
            path: './src/mail-service/assets/LogoRedSanPablo.png',
            cid: 'logoImage',
          },
        ],
      });
    } catch (error) {
      console.error('Error al enviar correo con contraseña temporal: ' + error);
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
