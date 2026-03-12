import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportStateHistoryService } from 'src/report-state-history/report-state-history.service';
import { Report } from 'src/reports/entities/report.entity';
import { ReportStateEnum } from 'src/reports/enums/report-state.enum';
import { User } from 'src/users/entities/user.entity';
import { ReportAssignment } from './entities/report-assignment.entity';

@Injectable()
export class ReportAssignmentsService {
  constructor(
    @InjectRepository(ReportAssignment)
    private readonly reportAssignmentRepository: Repository<ReportAssignment>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly reportStateHistoryService: ReportStateHistoryService,
  ) {}

  private async validatePlumberUser(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { Id: userId },
      relations: ['Roles'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isPlumber = (user.Roles ?? []).some((role) => role.Rolname === 'FONTANERO');
    if (!isPlumber) {
      throw new BadRequestException('El usuario asignado no tiene rol FONTANERO');
    }

    return user;
  }

  async hasAssignment(reportId: number): Promise<boolean> {
    const assignment = await this.reportAssignmentRepository.findOne({
      where: { ReportId: reportId },
    });

    return !!assignment;
  }

  async assignPlumber(
    reportId: number,
    plumberUserId: number,
    instructions: string,
    assignedByUserId: number,
  ): Promise<void> {
    const report = await this.reportRepository.findOne({ where: { Id: reportId } });
    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }

    if (report.ReportState === ReportStateEnum.RESUELTO) {
      throw new BadRequestException('No se puede asignar un fontanero a un reporte resuelto');
    }

    await this.usersRepository.findOneOrFail({ where: { Id: assignedByUserId } }).catch(() => {
      throw new NotFoundException('Usuario asignador no encontrado');
    });
    await this.validatePlumberUser(plumberUserId);

    const assignment =
      (await this.reportAssignmentRepository.findOne({ where: { ReportId: reportId } })) ??
      this.reportAssignmentRepository.create({ ReportId: reportId });

    assignment.PlumberUserId = plumberUserId;
    assignment.AssignedByUserId = assignedByUserId;
    assignment.Instructions = instructions;
    await this.reportAssignmentRepository.save(assignment);

    if (report.ReportState === ReportStateEnum.PENDIENTE) {
      const previousState = report.ReportState;
      report.ReportState = ReportStateEnum.EN_PROCESO;
      await this.reportRepository.save(report);
      await this.reportStateHistoryService.createHistory({
        reportId,
        previousState,
        newState: ReportStateEnum.EN_PROCESO,
        reasonChange: 'Asignación de fontanero responsable',
        changedByUserId: assignedByUserId,
      });
    }
  }
}
