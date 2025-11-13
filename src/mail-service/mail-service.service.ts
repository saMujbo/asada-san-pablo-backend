import { Injectable } from '@nestjs/common';
import { CreateMailServiceDto } from './dto/create-mail-service.dto';
import { ConfigService } from '@nestjs/config';
import { RecoverPasswordMail } from './templates/ForgotPassword';
import { WelcomeMailASADA } from './templates/WelcomeMesage';
import { WelcomeMailASADADto } from './dto/welcome-mail-service.dto';
import { AdminUserMailASADADto } from './dto/admin-create-user.dto';
import { WelcomeTempPasswordMail } from './templates/Password-defa';
import { NewReportMail } from './templates/NewReport';
import * as brevo from '@getbrevo/brevo';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailServiceService {
  private apiInstance: brevo.TransactionalEmailsApi;

  constructor(private readonly configService: ConfigService) {
    // Configurar la API de Brevo
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    
    if (!apiKey) {
      throw new Error('BREVO_API_KEY no está configurada en las variables de entorno');
    }

    this.apiInstance = new brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      apiKey
    );
  }

  /**
   * Convierte una imagen local a base64 para adjuntarla en Brevo
   */
  private getImageAsBase64(imagePath: string): string {
    try {
      const fullPath = path.resolve(imagePath);
      const imageBuffer = fs.readFileSync(fullPath);
      return imageBuffer.toString('base64');
    } catch (error) {
      console.error(`Error al leer imagen ${imagePath}:`, error);
      return '';
    }
  }

  async sendForgotpasswordEmail(createMailServiceDto: CreateMailServiceDto) {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      
      sendSmtpEmail.sender = { name: 'RedSanPablo', email: this.configService.get<string>('BREVO_SENDER_EMAIL') };
      sendSmtpEmail.to = [{ email: createMailServiceDto.to }];
      sendSmtpEmail.subject = createMailServiceDto.subject;
      sendSmtpEmail.htmlContent = await RecoverPasswordMail(createMailServiceDto.RecoverPasswordURL);
      sendSmtpEmail.textContent = createMailServiceDto?.message;
      
      // Adjuntar logo
      const logoBase64 = this.getImageAsBase64('./src/mail-service/assets/LogoRedSanPablo.png');
      if (logoBase64) {
        sendSmtpEmail.attachment = [
          {
            name: 'LogoRedSanPablo.png',
            content: logoBase64,
          }
        ];
      }

      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('✓ Correo de recuperación enviado exitosamente');
    } catch (error) {
      console.error('Error al enviar el correo electrónico:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(welcomeMailASADADto: WelcomeMailASADADto) {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      
      sendSmtpEmail.sender = { name: 'RedSanPablo', email: this.configService.get<string>('BREVO_SENDER_EMAIL') };
      sendSmtpEmail.to = [{ email: welcomeMailASADADto.to }];
      sendSmtpEmail.subject = welcomeMailASADADto.subject;
      sendSmtpEmail.htmlContent = await WelcomeMailASADA(welcomeMailASADADto.Name, welcomeMailASADADto.LoginURL);
      sendSmtpEmail.textContent = welcomeMailASADADto?.message;
      
      // Adjuntar logo
      const logoBase64 = this.getImageAsBase64('./src/mail-service/assets/LogoRedSanPablo.png');
      if (logoBase64) {
        sendSmtpEmail.attachment = [
          {
            name: 'LogoRedSanPablo.png',
            content: logoBase64,
          }
        ];
      }

      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('✓ Correo de bienvenida enviado exitosamente');
    } catch (error) {
      console.error('Error al enviar correo de bienvenida:', error);
      throw error;
    }
  }

  async sendWelcomeTempPasswordEmail(dto: AdminUserMailASADADto) {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      
      sendSmtpEmail.sender = { 
        name: 'RedSanPablo', 
        email: this.configService.get<string>('BREVO_SENDER_EMAIL') || 'no-reply@redsnp.cr' 
      };
      sendSmtpEmail.to = [{ email: dto.to }];
      sendSmtpEmail.subject = dto.subject;
      sendSmtpEmail.htmlContent = await WelcomeTempPasswordMail(dto.Name, dto.LoginURL, dto.temPasswordL);
      sendSmtpEmail.textContent = `Hola ${dto.Name},\n\nSe ha creado tu cuenta en RedSanPablo.\n\nUsuario: ${dto.to}\nContraseña temporal: ${dto.temPasswordL}\n\nPor seguridad, cámbiala lo antes posible.\nAccede aquí: ${dto.LoginURL}\n\n© 2025 ASADA San Pablo`;
      
      // Adjuntar logo
      const logoBase64 = this.getImageAsBase64('./src/mail-service/assets/LogoRedSanPablo.png');
      if (logoBase64) {
        sendSmtpEmail.attachment = [
          {
            name: 'LogoRedSanPablo.png',
            content: logoBase64,
          }
        ];
      }

      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('✓ Correo con contraseña temporal enviado exitosamente');
    } catch (error) {
      console.error('Error al enviar correo con contraseña temporal:', error);
      throw error;
    }
  }

  async sendReportCreatedEmail(dto: {
    to?: string;
    subject?: string;
    Id: number;
    Location: string;
    Description?: string;
    UserFullName?: string;
    UserEmail?: string;
    CreatedAt: string;
  }) {
    try {
      const to = dto.to ?? this.configService.get<string>('REPORTS_MAIL_TO') ?? 'admin@asada.cr';
      const subject = dto.subject ?? `Nuevo reporte #${dto.Id} — ${dto.Location}`;

      const sendSmtpEmail = new brevo.SendSmtpEmail();
      
      sendSmtpEmail.sender = { name: 'RedSanPablo', email: this.configService.get<string>('BREVO_SENDER_EMAIL') };
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = await NewReportMail({
        Id: dto.Id,
        Location: dto.Location,
        Description: dto.Description,
        UserFullName: dto.UserFullName,
        UserEmail: dto.UserEmail,
        CreatedAt: dto.CreatedAt,
      });
      sendSmtpEmail.textContent = `Nuevo reporte #${dto.Id}
        Ubicación: ${dto.Location}
        Descripción: ${dto.Description ?? '-'}
        Usuario: ${dto.UserFullName ?? '-'} ${dto.UserEmail ? `(${dto.UserEmail})` : ''}
        Fecha: ${dto.CreatedAt}`;

      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('✓ Correo de reporte enviado exitosamente');
    } catch (error) {
      console.error('Error al enviar correo de reporte:', error);
      throw error;
    }
  }
}