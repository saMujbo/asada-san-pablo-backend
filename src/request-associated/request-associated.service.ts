import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRequestAssociatedDto } from './dto/create-request-associated.dto';
import { UpdateRequestAssociatedDto } from './dto/update-request-associated.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestAssociated } from './entities/request-associated.entity';
import { Repository } from 'typeorm';
import { StateRequestService } from 'src/state-request/state-request.service';
import { UsersService } from 'src/users/users.service';
import { RequestAssociatedPagination } from './dto/pagination-request-associated.dtp';
import { AuditRequestContext } from 'src/audit/audit.types';

type MonthlyPoint = { year: string; month: string; count: string };
@Injectable()
export class RequestAssociatedService {
  constructor(
    @InjectRepository(RequestAssociated)
    private readonly requestAssociatedRepo: Repository<RequestAssociated>,
    @Inject(forwardRef(()=> StateRequestService))
    private readonly stateRequestSv: StateRequestService,
    @Inject(forwardRef(()=> UsersService))
    private readonly userSv:UsersService
    
  ){}

  private getRequestRepository(auditContext?: AuditRequestContext) {
    return auditContext?.queryRunner.manager.getRepository(RequestAssociated) ?? this.requestAssociatedRepo;
  }

  // Método público para contar las solicitudes pendientes asociadas
  async countPendingRequests(): Promise<number> {
    const pendingState = await this.requestAssociatedRepo
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.StateRequest', 'stateRequest')
      .where('stateRequest.Name = :stateName', { stateName: 'PENDIENTE' })
      .andWhere('req.IsActive = :isActive', { isActive: true })
      .getCount();

    return pendingState;
  }

  async countApprovedRequests(): Promise<number> {
    const approvedState = await this.requestAssociatedRepo
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.StateRequest', 'stateRequest')
      .where('LOWER(stateRequest.Name) IN (:...states)', { states: ['aprobado', 'aprobada'] })
      .andWhere('req.IsActive = :isActive', { isActive: true })
      .getCount();
    return approvedState;
  }

  async create(createRequestAssociatedDto: CreateRequestAssociatedDto) {
  const UserSv = await this.userSv.findOne(createRequestAssociatedDto.UserId);
  const StateRequestSv = await this.stateRequestSv.findDefaultState();
  const request = this.requestAssociatedRepo.create({
    Justification:createRequestAssociatedDto.Justification,
    NIS:createRequestAssociatedDto.NIS,
    User: UserSv,
    StateRequest: StateRequestSv,
  });

  return await this.requestAssociatedRepo.save(request);
  }

  async findAll() {
    return await this.requestAssociatedRepo.find({
      where:{IsActive:true},relations:[
        'User',
        'StateRequest',
        'RequestAssociatedFile',
      ]
    })
  }
async search({
  page = 1,
  limit = 10,
  q,
  UserName,
  StateRequestId,
  State,     // si lo sigues usando en el endpoint general
  userId,    // <-- viene solo desde /me/search (inyectado)
}: RequestAssociatedPagination & { userId?: number; q?: string; UserName?: string }) {
  const pageNum = Math.max(1, Number(page) || 1);
  const take = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * take;

  const stateRequestIdNum =
      StateRequestId !== undefined && StateRequestId !== null
        ? Number(StateRequestId)
        : undefined;
                                                                                                                             
    const searchText = (q ?? UserName ?? '').trim().toLowerCase();

  const qb = this.requestAssociatedRepo
    .createQueryBuilder('req')
    .leftJoinAndSelect('req.User', 'user')
    .leftJoinAndSelect('req.StateRequest', 'stateRequest')
    .leftJoinAndSelect('req.RequestAssociatedFile', 'files')
    .orderBy('req.Date', 'DESC')
    .skip(skip)
    .take(take);


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
    const foundRequestAssociated = await this.requestAssociatedRepo.findOne({
      where:{Id,IsActive:true},relations:[
        'StateRequest','User','RequestAssociatedFile']});
    if(!foundRequestAssociated) throw new NotFoundException(`Resquest with ${Id} not found`)
    return foundRequestAssociated;
  }

  async update(
    Id: number,
    updateRequestAssociatedDto:UpdateRequestAssociatedDto,
    auditContext?: AuditRequestContext,
  ) {
    const requestAssociatedRepository = this.getRequestRepository(auditContext);
    const foundRequestAssociated = await requestAssociatedRepository.findOne({where:{Id}})
    if(!foundRequestAssociated){throw new NotFoundException(`Request with ${Id} not found`) }

    if (updateRequestAssociatedDto.StateRequestId != null) {
      const foundState = await this.stateRequestSv.findOne(updateRequestAssociatedDto.StateRequestId);
      if (!foundState) {throw new NotFoundException(`state with Id ${updateRequestAssociatedDto.StateRequestId} not found`);}
      foundRequestAssociated.StateRequest = foundState;
    }

    const patch: Partial<typeof foundRequestAssociated> = {}
    if (updateRequestAssociatedDto.CanComment !== undefined) patch.CanComment = updateRequestAssociatedDto.CanComment
        requestAssociatedRepository.merge(foundRequestAssociated, patch);
    
    return await requestAssociatedRepository.save(foundRequestAssociated);
  }

  async remove(Id: number) {
    const foundRequestAssociated = await this.requestAssociatedRepo.findOne({ where: { Id } })
    if (!foundRequestAssociated) {
      throw new NotFoundException(`Request with Id ${Id} not found`);
    }
    foundRequestAssociated.IsActive = false;
    
    return await this.requestAssociatedRepo.save(foundRequestAssociated); 
  }

    async isOnRequestState(Id:number){
    const hasActiveRequestState = await this.requestAssociatedRepo.exist({
      where: {StateRequest:{Id}, IsActive:true}
    })
    return hasActiveRequestState;
  }

  async updateRequestAssociated(requestAssociated: RequestAssociated) {
    this.requestAssociatedRepo.save(requestAssociated);
  }

  async getMonthlyCounts(months = 12) {
    const now = new Date();
    const from = new Date(now);
    from.setMonth(from.getMonth() - (months - 1), 1);
    from.setHours(0, 0, 0, 0);

    const rows = await this.requestAssociatedRepo
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
    return this.requestAssociatedRepo
      .createQueryBuilder('req')
      .where('req.IsActive = :act', { act: true })
      .andWhere('req.UserId = :uid', { uid: userId })
      .getCount();
  }

  async countPendingByUser(userId: number): Promise<number> {
    return this.requestAssociatedRepo
      .createQueryBuilder('req')
      .leftJoin('req.StateRequest', 'state')
      .leftJoinAndSelect('req.RequestAssociatedFile', 'files')
      .where('req.IsActive = :act', { act: true })
      .andWhere('req.UserId = :uid', { uid: userId })
      .andWhere('UPPER(state.Name) = :p', { p: 'PENDIENTE' })
      .getCount();
  }

  // Listado simple por usuario (sin paginar)
  async findAllByUser(userId: number) {
  return this.requestAssociatedRepo.find({
    where: { IsActive: true, User: { Id: userId } },
    relations: ['StateRequest','RequestAssociatedFile'],
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

    const qb = this.requestAssociatedRepo
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.StateRequest', 'state')
      .leftJoinAndSelect('req.RequestAssociatedFile', 'files')
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
