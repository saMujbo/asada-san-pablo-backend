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
    
      //user
      const foundUser = await this.userSv.findOne(updateRequestsupervisionMeterDto.UserId)
    if(!foundUser){throw new NotFoundException(`user with Id ${Id} not found`)}
    if(updateRequestsupervisionMeterDto.UserId != undefined && updateRequestsupervisionMeterDto.UserId !=null)
        foundRequestSupervision.User = foundUser;

    //satate
      const foundState = await this.stateRequestSv.findOne(updateRequestsupervisionMeterDto.StateRequestId)
    if(!foundState){throw new NotFoundException(`state with Id ${Id} not found`)}
    if(updateRequestsupervisionMeterDto.StateRequestId != undefined && updateRequestsupervisionMeterDto.StateRequestId != null)
        foundRequestSupervision.StateRequest = foundState

    if(hasNonEmptyString(updateRequestsupervisionMeterDto.Justification)&& updateRequestsupervisionMeterDto !=null)
      foundRequestSupervision.Justification = updateRequestsupervisionMeterDto.Justification
    if(hasNonEmptyString(updateRequestsupervisionMeterDto.Location)&& updateRequestsupervisionMeterDto.Location !=null)
      foundRequestSupervision.Location = updateRequestsupervisionMeterDto.Location;
    if(updateRequestsupervisionMeterDto.NIS !=undefined && updateRequestsupervisionMeterDto.NIS != null)
      foundRequestSupervision.NIS = updateRequestsupervisionMeterDto.NIS

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
}
