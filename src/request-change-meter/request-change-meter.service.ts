import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { UpdateRequestChangeMeterDto } from './dto/update-request-change-meter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestChangeMeter } from './entities/request-change-meter.entity';
import { Repository } from 'typeorm';
import { StateRequestService } from 'src/state-request/state-request.service';
import { UsersService } from 'src/users/users.service';
import { CreateRequestChangeMeterDto } from './dto/create-request-change-meter.dto';
import { RequestChangeMeterPagination } from './dto/pagination-request-change-meter.dto';
import { request } from 'http';
import { AuditRequestContext } from 'src/audit/audit.types';
import { NotificationService } from 'src/notification/notification.service';
import { applyDefinedFields } from 'src/utils/validation.utils';

type MonthlyPoint = { year: string; month: string; count: string };
@Injectable()
export class RequestChangeMeterService {
  constructor(
    @InjectRepository(RequestChangeMeter)
    private readonly requestChangeMeterRepo: Repository<RequestChangeMeter>,
    @Inject(forwardRef(()=> StateRequestService))
      private readonly stateRequestSv: StateRequestService,
    @Inject(forwardRef(()=> UsersService))
      private readonly userSerive:UsersService,
    @Inject(forwardRef(() => NotificationService))
      private readonly notificationSv: NotificationService,
  ){}

  private getRequestRepository(auditContext?: AuditRequestContext) {
    return auditContext?.queryRunner.manager.getRepository(RequestChangeMeter) ?? this.requestChangeMeterRepo;
  }

  // Método público para contar las solicitudes pendientes de cambio de medidor
  async countPendingRequests(): Promise<number> {
    const pendingState = await this.requestChangeMeterRepo
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.StateRequest', 'stateRequest')
      .where('stateRequest.Name = :stateName', { stateName: 'PENDIENTE' })
      .andWhere('req.IsActive = :isActive', { isActive: true })
      .getCount();

    return pendingState;
  }
  
  async countApprovedRequests(): Promise<number> {
    const approvedState = await this.requestChangeMeterRepo
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.StateRequest', 'stateRequest')
      .where('LOWER(stateRequest.Name) IN (:...states)', { states: ['aprobado', 'aprobada'] })
      .andWhere('req.IsActive = :isActive', { isActive: true })
      .getCount();

    return approvedState;
  }

  async create(createRequestChangeMeterDto: CreateRequestChangeMeterDto) {
    const Usersv = await this.userSerive.findOne(createRequestChangeMeterDto.UserId);
    const StateRequestSv = await this.stateRequestSv.findDefaultState();
    const newRequestChangeMeter = await this.requestChangeMeterRepo.create({
      Location: createRequestChangeMeterDto.Location,
      NIS:createRequestChangeMeterDto.NIS,
      Justification:createRequestChangeMeterDto.Justification,
      User:Usersv,
      StateRequest:StateRequestSv
    })
    return await this.requestChangeMeterRepo.save(newRequestChangeMeter);
  }

  async findAll() {
    return await this.requestChangeMeterRepo.find({
      where:{IsActive:true},relations:[
        'StateRequest',
        'User',]});
  }
async search({
  page = 1,
  limit = 10,
  q,
  StateRequestId,
  State,     // si lo sigues usando en el endpoint general
  userId,    // <-- viene solo desde /me/search (inyectado)
}: RequestChangeMeterPagination & { userId?: number; q?: string }) {
  const pageNum = Math.max(1, Number(page) || 1);
  const take = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * take;

  const stateRequestIdNum =
    StateRequestId !== undefined && StateRequestId !== null
      ? Number(StateRequestId)
      : undefined;

  const qb = this.requestChangeMeterRepo
    .createQueryBuilder('req')
    .leftJoinAndSelect('req.User', 'user')
    .leftJoinAndSelect('req.StateRequest', 'stateRequest')
    .orderBy('req.Date', 'DESC')
    .skip(skip)
    .take(take);

  // isActive: si viene State en el search general, conviértelo;
  // si viene userId (me/search) y no se especificó nada, por defecto solo activos.
  let isActiveFilter: boolean | undefined = undefined;
  if (State !== undefined && State !== null && State !== '') {
    const normalizedState = String(State).trim().toLowerCase();
    if (['true', '1', 'activo', 'active', 'si', 'sí'].includes(normalizedState)) {
      isActiveFilter = true;
    } else if (['false', '0', 'inactivo', 'inactive', 'no'].includes(normalizedState)) {
      isActiveFilter = false;
    }
  } else if (typeof userId === 'number') {
    isActiveFilter = true; // default para "mis solicitudes"
  }
  if (typeof isActiveFilter === 'boolean') {
    qb.andWhere('req.IsActive = :isActive', { isActive: isActiveFilter });
  }

  if (typeof stateRequestIdNum === 'number' && !Number.isNaN(stateRequestIdNum)) {
    qb.andWhere('req.StateRequestId = :stateId', { stateId: stateRequestIdNum });
  }

  if (typeof userId === 'number') {
    qb.andWhere('req.UserId = :uid', { uid: userId });
  }

  if (q && q.trim() !== '') {
    qb.andWhere('(LOWER(req.Justification) LIKE :q OR LOWER(user.Name) LIKE :q)', {
      q: `%${q.toLowerCase()}%`,
    });
  }

  const [data, total] = await qb.getManyAndCount();
  return {
    data,
    meta: {
      page: pageNum,
      limit: take,
      total,
      pageCount: Math.max(1, Math.ceil(total / take)),
      hasNextPage: pageNum * take < total,
      hasPrevPage: pageNum > 1,
    },
  };
}
  async findOne(Id: number) {
    const foundRequestChangeMeter = await this.requestChangeMeterRepo.findOne({
      where:{Id,IsActive:true},relations:[
        'StateRequest',
        'User',]});
      if(!foundRequestChangeMeter)throw new NotFoundException(`Resquest with ${Id} not found`);
    return foundRequestChangeMeter;
  }

  async update(
    Id: number,
    updateRequestChangeMeterDto: UpdateRequestChangeMeterDto,
    auditContext?: AuditRequestContext,
  ) {
    const requestChangeMeterRepository = this.getRequestRepository(auditContext);
    const foundRequestChangeMeter = await requestChangeMeterRepository.findOne({
      where: { Id },
      relations: ['User', 'StateRequest'],
    });
    if(!foundRequestChangeMeter) throw new NotFoundException(`Request with ${Id} not found`);

    if(updateRequestChangeMeterDto.StateRequestId != null) {
      const foundState = await this.stateRequestSv.findOne(updateRequestChangeMeterDto.StateRequestId)
      if(!foundState){throw new NotFoundException(`state with Id ${updateRequestChangeMeterDto.StateRequestId} not found`)}
      foundRequestChangeMeter.StateRequest = foundState;
    }

    const { CanComment } = updateRequestChangeMeterDto;
    applyDefinedFields(foundRequestChangeMeter, { CanComment });

    const updatedRequest = await requestChangeMeterRepository.save(foundRequestChangeMeter);

    const stateName = updatedRequest.StateRequest?.Name ?? 'actualizado';
    const normalizedState = stateName.trim().toLowerCase();

    let subject = 'Actualización de solicitud de cambio de medidor';
    let message = `Tu solicitud #${updatedRequest.Id} ahora se encuentra en estado: ${stateName}.`;

    if (['aprobado', 'aprobada'].includes(normalizedState)) {
      subject = 'Solicitud de cambio de medidor aprobada';
      message = `Tu solicitud #${updatedRequest.Id} fue aprobada.`;
    } else if (normalizedState === 'pendiente') {
      subject = 'Solicitud de cambio de medidor en revisión';
      message = `Tu solicitud #${updatedRequest.Id} se encuentra pendiente de revisión.`;
    } else if (['rechazado', 'rechazada', 'denegado', 'denegada'].includes(normalizedState)) {
      subject = 'Solicitud de cambio de medidor rechazada';
      message = `Tu solicitud #${updatedRequest.Id} fue rechazada.`;
    }

    await this.notificationSv.createNotificationByUserID({
      UserID: updatedRequest.User.Id,
      Subject: subject,
      Message: message,
    });

    return updatedRequest;
  }

  async remove(Id: number) {
    const foundRequestChangeMeter = await this.requestChangeMeterRepo.findOne({ where: { Id } })
    if (!foundRequestChangeMeter) {
      throw new NotFoundException(`Request with Id ${Id} not found`);
    }
    foundRequestChangeMeter.IsActive = false;
    
    return await this.requestChangeMeterRepo.save(foundRequestChangeMeter); 
  }

  async isOnRequestState(Id:number){
    const hasActiveRequestState = await this.requestChangeMeterRepo.exist({
      where: {StateRequest:{Id}, IsActive:true}
    })
    return hasActiveRequestState;
  }

  async getMonthlyCounts(months = 12) {
    const now = new Date();
    const from = new Date(now);
    from.setMonth(from.getMonth() - (months - 1), 1);
    from.setHours(0, 0, 0, 0);

    const rows = await this.requestChangeMeterRepo
      .createQueryBuilder('req')
      .select('YEAR(req.Date)', 'year')   // Si usas Postgres: EXTRACT(YEAR FROM req."Date") AS year
      .addSelect('MONTH(req.Date)', 'month') // Postgres: EXTRACT(MONTH FROM ...)
      .addSelect('COUNT(*)', 'count')
      .where('req.IsActive = :act', { act: true })
      .andWhere('req.Date >= :from', { from })
      .groupBy('YEAR(req.Date)')
      .addGroupBy('MONTH(req.Date)')
      .orderBy('YEAR(req.Date)', 'ASC')
      .addOrderBy('MONTH(req.Date)', 'ASC')
      .getRawMany<MonthlyPoint>();

    return rows.map(r => ({
      year: Number(r.year),
      month: Number(r.month),
      count: Number(r.count),
    }));
  }

  async countAllByUser(userId: number): Promise<number> {
    return this.requestChangeMeterRepo
      .createQueryBuilder('req')
      .where('req.IsActive = :act', { act: true })
      .andWhere('req.UserId = :uid', { uid: userId })
      .getCount();
  }

  async countPendingByUser(userId: number): Promise<number> {
    return this.requestChangeMeterRepo
      .createQueryBuilder('req')
      .leftJoin('req.StateRequest', 'state')
      .where('req.IsActive = :act', { act: true })
      .andWhere('req.UserId = :uid', { uid: userId })
      .andWhere('UPPER(state.Name) = :p', { p: 'PENDIENTE' })
      .getCount();
  }

  // Listado simple por usuario (sin paginar)
  async findAllByUser(userId: number) {
  return this.requestChangeMeterRepo.find({
    where: { IsActive: true, User: { Id: userId } },
    relations: ['StateRequest'],
    order: { Date: 'DESC' },
  });
  }

  // Listado paginado por usuario
  async searchByUser(
    userId: number,
    { page = 1, limit = 10 }: { page?: number; limit?: number }
  ) {
    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * take;

    const qb = this.requestChangeMeterRepo
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.StateRequest', 'state')
      .where('req.IsActive = :act', { act: true })
      .andWhere('req.UserId = :uid', { uid: userId })
      .orderBy('req.Date', 'DESC')
      .skip(skip)
      .take(take);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        page: pageNum,
        limit: take,
        total,
        pageCount: Math.max(1, Math.ceil(total / take)),
        hasNextPage: pageNum * take < total,
        hasPrevPage: pageNum > 1,
      },
    };
  }
}
