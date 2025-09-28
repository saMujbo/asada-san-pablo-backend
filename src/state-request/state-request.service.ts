import { BadGatewayException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStateRequestDto } from './dto/create-state-request.dto';
import { UpdateStateRequestDto } from './dto/update-state-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StateRequest } from './entities/state-request.entity';
import { Repository } from 'typeorm';
import { RequesAvailabilityWaterService } from 'src/reques-availability-water/reques-availability-water.service';
import { hasNonEmptyString } from 'src/utils/validation.utils';

@Injectable()
export class StateRequestService {
  constructor(
    @InjectRepository(StateRequest)
    private readonly stateRequesRepo : Repository<StateRequest>,
    @Inject(forwardRef(()=>RequesAvailabilityWaterService))
    private readonly RequesAvailabilityWaterSv :  RequesAvailabilityWaterService,
  ){}
  async create(createStateRequestDto: CreateStateRequestDto) {
    const newRequestState = await this.stateRequesRepo.create(createStateRequestDto)

    return await this.stateRequesRepo.save(newRequestState);
  }

  async findAll() {
    return await this.stateRequesRepo.find({where:{IsActive:true}});
}

  async findOne(Id: number) {
    const foundProjectState = await this.stateRequesRepo.findOne({
      where:{Id,IsActive:true}
    });
    if(!foundProjectState) throw new NotFoundException(`RequestState with ${Id} not found`);
    return foundProjectState;
  }

  async update(Id: number, updateStateRequestDto: UpdateStateRequestDto) {
    const foundProjectState = await this.stateRequesRepo.findOne({where:{Id}});

    if(!foundProjectState) throw new NotFoundException(`RequestState with ${Id} not found`);

    const hasState = await this.RequesAvailabilityWaterSv.isOnRequestState(Id);

    if(hasState && updateStateRequestDto.IsActive===false){
    throw new NotFoundException(
        `No se puede desactivar este state ${Id} porque está asociado a al menos a una request.`
    )}

    if(hasNonEmptyString(updateStateRequestDto.Name)&& updateStateRequestDto.Name !== undefined)
      foundProjectState.Name = updateStateRequestDto.Name;

    if(hasNonEmptyString(updateStateRequestDto.Description)&& updateStateRequestDto.Description !== undefined)
      foundProjectState.Description = updateStateRequestDto.Description;
    
    return await this.stateRequesRepo.save(foundProjectState);
  }

  async remove(Id: number) {
    const stateRequest = await this.findOne(Id);

    const hasRequest = await this.RequesAvailabilityWaterSv.isOnRequestState(Id)

    if(hasRequest){
      throw new BadGatewayException(
        `No se puede desactivar el estado de la solicitud ${Id} porque está asociado al menos a una solicitud`
      )
    }
    stateRequest.IsActive = false;
    return await this.stateRequesRepo.save(stateRequest);
  }
}
