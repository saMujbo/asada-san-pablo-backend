import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRequestChangeNameMeterDto } from './dto/create-request-change-name-meter.dto';
import { UpdateRequestChangeNameMeterDto } from './dto/update-request-change-name-meter.dto';
import { RequestChangeNameMeter } from './entities/request-change-name-meter.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StateRequestService } from 'src/state-request/state-request.service';
import { UsersService } from 'src/users/users.service';
import { RequestChangeNameMeterPagination } from './dto/pagination-request-change-name-meter.dt';
import { Project } from 'src/project/entities/project.entity';

type MonthlyPoint = { year: string; month: string; count: string };
@Injectable()
export class RequestChangeNameMeterService {
  constructor(
    @InjectRepository(RequestChangeNameMeter)
    private readonly requestChangeNameMeterRepo: Repository<RequestChangeNameMeter>,
    @Inject(forwardRef(()=> StateRequestService))
        private readonly stateRequestSv: StateRequestService,
    @Inject(forwardRef(()=> UsersService))
        private readonly userSerive:UsersService
  ){}

  // Método público para contar las solicitudes pendientes de cambio de nombre de medidor
  async countPendingRequests(): Promise<number> {
    const pendingState = await this.requestChangeNameMeterRepo
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.StateRequest', 'stateRequest')
      .where('stateRequest.Name = :stateName', { stateName: 'PENDIENTE' })
      .andWhere('req.IsActive = :isActive', { isActive: true })
      .getCount();

    return pendingState;
  }

  async countApprovedRequests(): Promise<number> {
    const approvedState = await this.requestChangeNameMeterRepo
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.StateRequest', 'stateRequest')
      .where('LOWER(stateRequest.Name) IN (:...states)', { states: ['aprobado', 'aprobada'] })
      .andWhere('req.IsActive = :isActive', { isActive: true })
      .getCount();

    return approvedState;
  }

  async create(createRequestChangeNameMeterDto: CreateRequestChangeNameMeterDto) {
    const Usersv = await this.userSerive.findOne(createRequestChangeNameMeterDto.UserId);
    const StateRequestSv = await this.stateRequestSv.findDefaultState();
    const newRequestChangeNameMeter = await this.requestChangeNameMeterRepo.create({
      Justification:createRequestChangeNameMeterDto.Justification,
      User:Usersv,
      StateRequest:StateRequestSv
    })
    return await this.requestChangeNameMeterRepo.save(newRequestChangeNameMeter);
  }

  async findAll() {
    return await this.requestChangeNameMeterRepo.find({
      where:{IsActive:true},relations:[
        'StateRequest',
        'User',]});
  }
async search({ page = 1, limit = 10, UserName, StateRequestId, State }: RequestChangeNameMeterPagination) {
  const pageNum = Math.max(1, Number(page) || 1);
  const take = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * take;

  const qb = this.requestChangeNameMeterRepo
    .createQueryBuilder('req')
    .leftJoinAndSelect('req.User', 'user')
    .leftJoinAndSelect('req.StateRequest', 'stateRequest')
    .skip(skip)
    .take(take);

  // IsActive (opcional)
  if (State !== undefined && State !== null && State !== '') {
    // Si tu DTO manda string "true"/"false":
    const isActive =
      typeof State === 'string'
        ? State.toLowerCase() === 'true'
        : !!State;

    qb.andWhere('req.IsActive = :State', { State }); // <-- nombre del parámetro correcto
  }

  // Filtro por nombre del encargado
  if (UserName) {
    qb.andWhere('LOWER(user.Name) LIKE LOWER(:UserName)', { UserName: `%${UserName}%` });
  }

  // Filtro por nombre del estado (PENDIENTE, TERMINADO, etc.)
  if (typeof StateRequestId === 'number') {
    qb.andWhere('req.StateRequestId = :stateId', { stateId: StateRequestId });
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
    const foundRequestChangeNameMeter = await this.requestChangeNameMeterRepo.findOne({
      where:{Id,IsActive:true},relations:[
        'StateRequest',
        'User',]});
      if(!foundRequestChangeNameMeter)throw new NotFoundException(`Resquest with ${Id} not found`);
    return foundRequestChangeNameMeter;
  }

  async update(Id: number, updateRequestChangeNameMeterDto: UpdateRequestChangeNameMeterDto) {
    const foundRequestChangeNameMeter = await this.requestChangeNameMeterRepo.findOne({where:{Id}});
    if(!foundRequestChangeNameMeter)  throw new NotFoundException(`Request with ${Id} not found`)

          const foundUser = await this.userSerive.findOne(updateRequestChangeNameMeterDto.UserId)
      if(!foundUser){throw new NotFoundException(`user with Id ${Id} not found`)}
      if(updateRequestChangeNameMeterDto.UserId != undefined && updateRequestChangeNameMeterDto.UserId !=null)
      foundRequestChangeNameMeter.User = foundUser;

      const foundState = await this.stateRequestSv.findOne(updateRequestChangeNameMeterDto.StateRequestId)
      if(!foundState){throw new NotFoundException(`state with Id ${Id} not found`)}
      if(updateRequestChangeNameMeterDto.StateRequestId != undefined && updateRequestChangeNameMeterDto.StateRequestId != null)
            foundRequestChangeNameMeter.StateRequest = foundState

      return await this.requestChangeNameMeterRepo.save(foundRequestChangeNameMeter);
  }

  async remove(Id: number) {
    const foundRequestChangeNameMeterr = await this.requestChangeNameMeterRepo.findOne({ where: { Id } })
    if (!foundRequestChangeNameMeterr) {
      throw new NotFoundException(`Request with Id ${Id} not found`);
    }
    foundRequestChangeNameMeterr.IsActive = false;
    
    return await this.requestChangeNameMeterRepo.save(foundRequestChangeNameMeterr); 
  }

    async updateRequestChangeNameMeter(RequestchangeNameMeter: RequestChangeNameMeter) {
      this.requestChangeNameMeterRepo.save(RequestchangeNameMeter);
    }
    async isOnRequestChangeNameMeter(Id:number){
    const hasActiveRequestState = await this.requestChangeNameMeterRepo.exist({
      where: {StateRequest:{Id}, IsActive:true}
    })
    return hasActiveRequestState;
  }

  async getMonthlyCounts(months = 12) {
    const now = new Date();
    const from = new Date(now);
    from.setMonth(from.getMonth() - (months - 1), 1);
    from.setHours(0, 0, 0, 0);

    const rows = await this.requestChangeNameMeterRepo
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
}
