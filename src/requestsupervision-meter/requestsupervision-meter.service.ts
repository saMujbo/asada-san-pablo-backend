import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRequestSupervisionMeterDto } from './dto/create-requestsupervision-meter.dto';
import { UpdateRequestsupervisionMeterDto } from './dto/update-requestsupervision-meter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestSupervisionMeter } from './entities/requestsupervision-meter.entity';
import { Repository } from 'typeorm';
import { StateRequestService } from 'src/state-request/state-request.service';
import { UsersService } from 'src/users/users.service';
import { hasNonEmptyString } from 'src/utils/validation.utils';
import { RequestSupervisionPagination } from './dto/pagination-requesSupervisiom-meter.tdo';

type MonthlyPoint = { year: string; month: string; count: string };
@Injectable()
export class RequestsupervisionMeterService {
  constructor(
    @InjectRepository(RequestSupervisionMeter)
    private readonly requestSupervisionMeterRepo: Repository<RequestSupervisionMeter>,
    @Inject(forwardRef(() => StateRequestService))
    private readonly stateRequestSv: StateRequestService,
    @Inject(forwardRef(() => UsersService))
    private readonly userSv: UsersService
  ){}

  async countPendingRequests(): Promise<number> {
    const pendingState = await this.requestSupervisionMeterRepo
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.StateRequest', 'stateRequest')
      .where('stateRequest.Name = :stateName', { stateName: 'PENDIENTE' })
      .andWhere('req.IsActive = :isActive', { isActive: true })
      .getCount();

    return pendingState;
  }

  // Método público para contar las solicitudes aprobadas de supervisión de medidor
  async countApprovedRequests(): Promise<number> {
    const approvedState = await this.requestSupervisionMeterRepo
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.StateRequest', 'stateRequest')
      .where('LOWER(stateRequest.Name) IN (:...states)', { states: ['aprobado', 'aprobada'] })
      .andWhere('req.IsActive = :isActive', { isActive: true })
      .getCount();

    return approvedState;
  }

  async create(createRequestsupervisionMeterDto: CreateRequestSupervisionMeterDto) {
    
    const UserSv = await this.userSv.findOne(createRequestsupervisionMeterDto.UserId);
    const StateRequestSv = await this.stateRequestSv.findDefaultState();
    const newRequest = await this.requestSupervisionMeterRepo.create({
      Justification:createRequestsupervisionMeterDto.Justification,
      Location:createRequestsupervisionMeterDto.Location,
      NIS:createRequestsupervisionMeterDto.NIS,
      User:UserSv,
      StateRequest:StateRequestSv
    })
    return await this.requestSupervisionMeterRepo.save(newRequest);
  }

  async findAll() {
    return await this.requestSupervisionMeterRepo.find({
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
}: RequestSupervisionPagination & { userId?: number; q?: string }) {
  const pageNum = Math.max(1, Number(page) || 1);
  const take = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * take;

  const qb = this.requestSupervisionMeterRepo
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
    isActiveFilter = typeof State === 'string' ? State.toLowerCase() === 'true' : !!State;
  } else if (typeof userId === 'number') {
    isActiveFilter = true; // default para "mis solicitudes"
  }
  if (typeof isActiveFilter === 'boolean') {
    qb.andWhere('req.IsActive = :isActive', { isActive: isActiveFilter });
  }

  if (typeof StateRequestId === 'number') {
    qb.andWhere('req.StateRequestId = :stateId', { stateId: StateRequestId });
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
    const foundRequestSupervision = await this.requestSupervisionMeterRepo.findOne({
      where:{IsActive:true},relations:[
        'StateRequest',
        'User',]});
      if(!foundRequestSupervision)throw new NotFoundException(`Request with ${Id} not foun`)
    return foundRequestSupervision;
  }

  async update(Id: number, updateRequestsupervisionMeterDto: UpdateRequestsupervisionMeterDto) {
    const foundRequestSupervision = await this.requestSupervisionMeterRepo.findOne({where:{Id, IsActive:true}}) 
    if(!foundRequestSupervision) throw new NotFoundException(`Request with ${Id} not found`)
  

    //satate
      const foundState = await this.stateRequestSv.findOne(updateRequestsupervisionMeterDto.StateRequestId)
    if(!foundState){throw new NotFoundException(`state with Id ${Id} not found`)}
    if(updateRequestsupervisionMeterDto.StateRequestId != undefined && updateRequestsupervisionMeterDto.StateRequestId != null)
        foundRequestSupervision.StateRequest = foundState

    return await this.requestSupervisionMeterRepo.save(foundRequestSupervision)
}

  async remove(Id: number) {
    const foundRequestSupervision = await this.requestSupervisionMeterRepo.findOne({ where: { Id } })
    if (!foundRequestSupervision) {
      throw new NotFoundException(`Request with Id ${Id} not found`);
    }
    foundRequestSupervision.IsActive = false;
    
    return await this.requestSupervisionMeterRepo.save(foundRequestSupervision);
  }
  async isOnRequestState(Id:number){
    const hasActiveRequestState = await this.requestSupervisionMeterRepo.exist({
      where: {StateRequest:{Id}, IsActive:true}
    })
    return hasActiveRequestState
  }

  async getMonthlyCounts(months = 12) {
    const now = new Date();
    const from = new Date(now);
    from.setMonth(from.getMonth() - (months - 1), 1);
    from.setHours(0, 0, 0, 0);

    const rows = await this.requestSupervisionMeterRepo
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
    return this.requestSupervisionMeterRepo
      .createQueryBuilder('req')
      .where('req.IsActive = :act', { act: true })
      .andWhere('req.UserId = :uid', { uid: userId })
      .getCount();
  }

  async countPendingByUser(userId: number): Promise<number> {
    return this.requestSupervisionMeterRepo
      .createQueryBuilder('req')
      .leftJoin('req.StateRequest', 'state')
      .where('req.IsActive = :act', { act: true })
      .andWhere('req.UserId = :uid', { uid: userId })
      .andWhere('UPPER(state.Name) = :p', { p: 'PENDIENTE' })
      .getCount();
  }

  // Listado simple por usuario (sin paginar)
  async findAllByUser(userId: number) {
  return this.requestSupervisionMeterRepo.find({
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

    const qb = this.requestSupervisionMeterRepo
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
