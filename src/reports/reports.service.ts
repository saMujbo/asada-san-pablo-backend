import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsGateway } from './reports.gateway';
import { MailServiceService } from 'src/mail-service/mail-service.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly reportsGateway: ReportsGateway,
     private readonly mailService: MailServiceService, 
  ) {}

  async create(createReportDto: CreateReportDto) {
    // Crear el reporte
    const report = this.reportRepository.create(createReportDto);
    const saved = await this.reportRepository.save(report);

    // Cargar el reporte con la información del usuario
    const reportWithUser = await this.reportRepository.findOne({
      where: { Id: saved.Id },
      relations: ['User'], // Esto carga la relación User
    });

    if (!reportWithUser) {
      throw new Error('Error al crear el reporte');
    }

    // Emitir evento WebSocket con información del usuario
    this.reportsGateway.emitReportCreated({
      Id: saved.Id,
      Location: saved.Location,
      Description: saved.Description,
      User: {
        Id: reportWithUser.User.Id,
        Name: reportWithUser.User.Name,
        Email: reportWithUser.User.Email,
        FullName: `${reportWithUser.User.Name} ${reportWithUser.User.Surname1} ${reportWithUser.User.Surname2 || ''}`.trim(),
      },
      CreatedAt: saved.CreatedAt,
    });

    // Enviar correo (no bloquea la respuesta)
    this.mailService
      .sendReportCreatedEmail({
        // si no pasas "to", usará REPORTS_MAIL_TO del .env
        Id: saved.Id,
        Location: saved.Location,
        Description: saved.Description ?? '',
        UserFullName: `${reportWithUser.User.Name} ${reportWithUser.User.Surname1} ${reportWithUser.User.Surname2 || ''}`.trim(),
        UserEmail: reportWithUser.User.Email,
        CreatedAt: new Date(saved.CreatedAt).toLocaleString('es-CR'),
      })
      .catch(console.error);

    return reportWithUser;
  }

  findAll() {
    return this.reportRepository.find({
      relations: ['User'], // Incluir información del usuario
      order: { CreatedAt: 'DESC' } // Ordenar por fecha más reciente primero
    });
  }

  findOne(id: number) {
    return this.reportRepository.findOne({
      where: { Id: id },
      relations: ['User'] // Incluir información del usuario
    });
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return this.reportRepository.update(id, updateReportDto);
  }

  remove(id: number) {
    return this.reportRepository.delete(id);
  }
}
