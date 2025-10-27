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
async search({ page = 1, limit = 10, UserName, StateRequestId, NIS, State }: RequestSupervisionPagination) {
  const pageNum = Math.max(1, Number(page) || 1);
  const take = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * take;

  const qb = this.requestSupervisionMeterRepo
    .createQueryBuilder('req')
    .leftJoinAndSelect('req.User', 'user')
    .leftJoinAndSelect('req.StateRequest', 'state')
    .skip(skip)
    .take(take);

  // --- Filtros SIEMPRE fuera del if(State) ---
  if (UserName && UserName.trim() !== '') {
    qb.andWhere('LOWER(user.Name) LIKE LOWER(:userName)', { userName: `%${UserName.trim()}%` });
  }

  // Filtro por nombre del estado (PENDIENTE, TERMINADO, etc.)
  if (typeof StateRequestId === 'number') {
    qb.andWhere('req.StateRequestId = :stateId', { stateId: StateRequestId });
  }

  if (typeof NIS === 'number' && !Number.isNaN(NIS)) {
    qb.andWhere('req.NIS = :nis', { nis: NIS });
  }

  if (State !== undefined && State !== null && State !== '') {
    // Si tu DTO manda string "true"/"false":
    const isActive =
      typeof State === 'string'
        ? State.toLowerCase() === 'true'
        : !!State;

    qb.andWhere('req.IsActive = :State', { State }); // <-- nombre del parámetro correcto
  }
  const [data, total] = await qb.getManyAndCount();

  return {
    data,
    meta: {
      page: pageNum,
      limit: take,
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
}
