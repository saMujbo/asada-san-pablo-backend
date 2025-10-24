import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { UpdateRequestChangeMeterDto } from './dto/update-request-change-meter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestChangeMeter } from './entities/request-change-meter.entity';
import { Repository } from 'typeorm';
import { create } from 'domain';
import { StateRequestService } from 'src/state-request/state-request.service';
import { UsersService } from 'src/users/users.service';
import { number } from 'yargs';
import { CreateRequestChangeMeterDto } from './dto/create-request-change-meter.dto';
import { StateRequest } from 'src/state-request/entities/state-request.entity';
import { hasNonEmptyString } from 'src/utils/validation.utils';
import { RequestChangeMeterPagination } from './dto/pagination-request-change-meter.dto';

type MonthlyPoint = { year: string; month: string; count: string };
@Injectable()
export class RequestChangeMeterService {
  constructor(
    @InjectRepository(RequestChangeMeter)
    private readonly requestChangeMeterRepo: Repository<RequestChangeMeter>,
    @Inject(forwardRef(()=> StateRequestService))
      private readonly stateRequestSv: StateRequestService,
    @Inject(forwardRef(()=> UsersService))
      private readonly userSerive:UsersService
  ){}

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
async search({ page = 1, limit = 10, UserName, StateRequestId, State }: RequestChangeMeterPagination) {
  const pageNum = Math.max(1, Number(page) || 1);
  const take = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * take;

  const qb = this.requestChangeMeterRepo
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
    const foundRequestChangeMeter = await this.requestChangeMeterRepo.findOne({
      where:{Id,IsActive:true},relations:[
        'StateRequest',
        'User',]});
      if(!foundRequestChangeMeter)throw new NotFoundException(`Resquest with ${Id} not found`);
    return foundRequestChangeMeter;
  }

  async update(Id: number, updateRequestChangeMeterDto: UpdateRequestChangeMeterDto) {
    const foundRequestChangeMeter = await this.requestChangeMeterRepo.findOne({ where: { Id } });
    if(!foundRequestChangeMeter) throw new NotFoundException(`Request with ${Id} not found`)
    
      //User search
      const foundUser = await this.userSerive.findOne(updateRequestChangeMeterDto.UserId)
      if(!foundUser){throw new NotFoundException(`user with Id ${Id} not found`)}
      if(updateRequestChangeMeterDto.UserId != undefined && updateRequestChangeMeterDto.UserId !=null)
      foundRequestChangeMeter.User = foundUser;
      
      //State search
        const foundState = await this.stateRequestSv.findOne(updateRequestChangeMeterDto.StateRequestId)
        if(!foundState){throw new NotFoundException(`state with Id ${Id} not found`)}
        if(updateRequestChangeMeterDto.StateRequestId != undefined && updateRequestChangeMeterDto.StateRequestId != null)
        foundRequestChangeMeter.StateRequest = foundState;

        if(hasNonEmptyString(updateRequestChangeMeterDto.Location)&& updateRequestChangeMeterDto.Location !=null)
          foundRequestChangeMeter.Location = updateRequestChangeMeterDto.Location;
        if(updateRequestChangeMeterDto.NIS != undefined && updateRequestChangeMeterDto.NIS != null)
          foundRequestChangeMeter.NIS = updateRequestChangeMeterDto.NIS;
        if(hasNonEmptyString(updateRequestChangeMeterDto.Justification)&& updateRequestChangeMeterDto.Justification != '')
          foundRequestChangeMeter.Justification = updateRequestChangeMeterDto.Justification;

    return await this.requestChangeMeterRepo.save(foundRequestChangeMeter);
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
}
