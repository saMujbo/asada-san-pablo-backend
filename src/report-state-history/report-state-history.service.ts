import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportAssignment } from 'src/report-assignments/entities/report-assignment.entity';
import { Report } from 'src/reports/entities/report.entity';
import { ReportStateEnum } from 'src/reports/enums/report-state.enum';
import { User } from 'src/users/entities/user.entity';
import { ReportStateHistory } from './entities/report-state-history.entity';

@Injectable()
export class ReportStateHistoryService {
  constructor(
    @InjectRepository(ReportStateHistory)
    private readonly reportStateHistoryRepository: Repository<ReportStateHistory>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(ReportAssignment)
    private readonly reportAssignmentRepository: Repository<ReportAssignment>,
  ) {}

  private ensureValidStateTransition(currentState: ReportStateEnum, newState: ReportStateEnum) {
    if (currentState === newState) {
      throw new BadRequestException('El reporte ya se encuentra en ese estado');
    }

    const allowedTransitions: Record<ReportStateEnum, ReportStateEnum[]> = {
      [ReportStateEnum.PENDIENTE]: [ReportStateEnum.EN_PROCESO],
      [ReportStateEnum.EN_PROCESO]: [ReportStateEnum.PENDIENTE, ReportStateEnum.RESUELTO],
      [ReportStateEnum.RESUELTO]: [ReportStateEnum.EN_PROCESO],
    };

    if (!allowedTransitions[currentState].includes(newState)) {
      throw new BadRequestException(`No se puede cambiar de "${currentState}" a "${newState}"`);
    }
  }

  async createHistory(params: {
    reportId: number;
    previousState: ReportStateEnum | null;
    newState: ReportStateEnum;
    reasonChange: string;
    changedByUserId: number;
  }) {
    const history = this.reportStateHistoryRepository.create({
      ReportId: params.reportId,
      PreviousState: params.previousState,
      NewState: params.newState,
      ReasonChange: params.reasonChange,
      ChangedByUserId: params.changedByUserId,
    });

    await this.reportStateHistoryRepository.save(history);
  }

  async changeState(
    reportId: number,
    newState: ReportStateEnum,
    reasonChange: string,
    changedByUserId: number,
  ): Promise<void> {
    const report = await this.reportRepository.findOne({ where: { Id: reportId } });
    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }

    await this.usersRepository.findOneOrFail({ where: { Id: changedByUserId } }).catch(() => {
      throw new NotFoundException('Usuario no encontrado');
    });

    this.ensureValidStateTransition(report.ReportState, newState);

    if (newState === ReportStateEnum.EN_PROCESO || newState === ReportStateEnum.RESUELTO) {
      const assignment = await this.reportAssignmentRepository.findOne({ where: { ReportId: reportId } });
      if (!assignment) {
        throw new BadRequestException(`El reporte debe tener un fontanero asignado antes de pasar a "${newState}"`);
      }
    }

    const previousState = report.ReportState;
    report.ReportState = newState;
    await this.reportRepository.save(report);

    await this.createHistory({
      reportId,
      previousState,
      newState,
      reasonChange,
      changedByUserId,
    });
  }
}
