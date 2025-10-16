import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateRequestAvailabilityWaterDto } from './dto/create-reques-availability-water.dto';
import { UpdateRequestAvailabilityWaterDto } from './dto/update-reques-availability-water.dto';
import { RequesAvailabilityWater } from './entities/reques-availability-water.entity';
import { UsersService } from 'src/users/users.service';
import { StateRequestService } from 'src/state-request/state-request.service';
import { RequestAvailabilityWaterPagination } from './dto/pagination-request-availabaility.dto';


@Injectable()
export class RequesAvailabilityWaterService {
  constructor(
    @InjectRepository(RequesAvailabilityWater)
    private readonly requesAvailabilityWaterRepository: Repository<RequesAvailabilityWater>,
    @Inject(forwardRef(()=> StateRequestService))
    private readonly stateRequestSv: StateRequestService,
    @Inject(forwardRef(()=> UsersService))
    private readonly userSerive:UsersService
  ) {}
  async create(createRequesAvailabilityWaterDto: CreateRequestAvailabilityWaterDto) {
    const Usersv = await this.userSerive.findOne(createRequesAvailabilityWaterDto.UserId);
    const StateRequestSv = await this.stateRequestSv.findDefaultState();
    const newRequestAvailabilityWater = await this.requesAvailabilityWaterRepository.create({
      Justification: createRequesAvailabilityWaterDto.Justification,
      User: Usersv,
      StateRequest: StateRequestSv
    })
    return await this.requesAvailabilityWaterRepository.save(newRequestAvailabilityWater);
  }

  async findAll() {
    return await this.requesAvailabilityWaterRepository.find({
      where:{IsActive:true},relations:[
        'StateRequest',
        'User',]});
  }
  async search({ page = 1, limit = 10, UserName, StateRequestId, State }: RequestAvailabilityWaterPagination) {
    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * take;

    const qb = this.requesAvailabilityWaterRepository
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

      qb.andWhere('req.IsActive = :State', { State}); // <-- nombre del parámetro correcto
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
    const foundRequestAvailabilityWater = await this.requesAvailabilityWaterRepository.findOne({
      where:{Id,IsActive:true},relations:[
        'StateRequest',
        'User',]});
      if(!foundRequestAvailabilityWater)throw new NotFoundException(`Resquest with ${Id} not found`);
    return foundRequestAvailabilityWater;
  }

  async update(Id: number, updateRequesAvailabilityWaterDto: UpdateRequestAvailabilityWaterDto) {
    const foundRequestAvailabilityWater = await this.requesAvailabilityWaterRepository.findOne({ where: { Id } });
    if(!foundRequestAvailabilityWater) throw new NotFoundException(`RequesAvailabilityWater with ${Id} not found`)
    
      
      const foundUser = await this.userSerive.findOne(updateRequesAvailabilityWaterDto.UserId)
      if(!foundUser){throw new NotFoundException(`user with Id ${Id} not found`)}
        if(updateRequesAvailabilityWaterDto.UserId != undefined && updateRequesAvailabilityWaterDto.UserId !=null)
          foundRequestAvailabilityWater.User = foundUser;

      const foundState = await this.stateRequestSv.findOne(updateRequesAvailabilityWaterDto.StateRequestId)
        if(!foundState){throw new NotFoundException(`state with Id ${Id} not found`)}
          if(updateRequesAvailabilityWaterDto.StateRequestId != undefined && updateRequesAvailabilityWaterDto.StateRequestId != null)
            foundRequestAvailabilityWater.StateRequest = foundState

      if(updateRequesAvailabilityWaterDto.Justification !=undefined && updateRequesAvailabilityWaterDto.Justification != '' && updateRequesAvailabilityWaterDto.Justification != null)
        foundRequestAvailabilityWater.Justification = updateRequesAvailabilityWaterDto.Justification;

    return await this.requesAvailabilityWaterRepository.save(foundRequestAvailabilityWater)
  }

  async updateRequest(reqWater: RequesAvailabilityWater) {
    return await this.requesAvailabilityWaterRepository.save(reqWater);
  } 

  async remove(Id: number) {
    const foundRequestAvailabilityWater = await this.requesAvailabilityWaterRepository.findOne({ where: { Id } })
    if (!foundRequestAvailabilityWater) {
      throw new NotFoundException(`RequesAvailabilityWater with Id ${Id} not found`);
    }
    foundRequestAvailabilityWater.IsActive = false;
    
    return await this.requesAvailabilityWaterRepository.save(foundRequestAvailabilityWater); 
  }

  async isOnRequestState(Id:number){
    const hasActiveRequestState = await this.requesAvailabilityWaterRepository.exist({
      where: {StateRequest:{Id}, IsActive:true}
    })
    return hasActiveRequestState;
  }
}