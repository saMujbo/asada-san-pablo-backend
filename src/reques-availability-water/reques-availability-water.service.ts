import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateRequestAvailabilityWaterDto } from './dto/create-reques-availability-water.dto';
import { UpdateRequestAvailabilityWaterDto } from './dto/update-reques-availability-water.dto';
import { RequesAvailabilityWater } from './entities/reques-availability-water.entity';
import { UsersService } from 'src/users/users.service';
import { StateRequestService } from 'src/state-request/state-request.service';


@Injectable()
export class RequesAvailabilityWaterService {
  constructor(
    @InjectRepository(RequesAvailabilityWater)
    private readonly requesAvailabilityWaterRepository: Repository<RequesAvailabilityWater>,
    @Inject(forwardRef(()=> StateRequestService))
    private readonly stateRequestSv: StateRequestService,
    private readonly userSerive:UsersService
  ) {}
  async create(createRequesAvailabilityWaterDto: CreateRequestAvailabilityWaterDto) {
    const Usersv = await this.userSerive.findOne(createRequesAvailabilityWaterDto.UserId);
    const StateRequestSv = await this.stateRequestSv.findOne(createRequesAvailabilityWaterDto.StateRequestId);
    const newRequestAvailabilityWater = this.requesAvailabilityWaterRepository.create({
      Justification: createRequesAvailabilityWaterDto.Justification,
      IdCardFiles: createRequesAvailabilityWaterDto.IdCardFiles,
      PlanoPrintFiles: createRequesAvailabilityWaterDto.PlanoPrintFiles,
      LiteralCertificateFile: createRequesAvailabilityWaterDto.LiteralCertificateFile,
      RequestLetterFile: createRequesAvailabilityWaterDto.RequestLetterFile,
      ConstructionPermitFile: createRequesAvailabilityWaterDto.ConstructionPermitFile,
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
    if(!foundRequestAvailabilityWater) throw new NotFoundException(`RequesAvailabilityWater with Id ${Id} not found`)
      if(updateRequesAvailabilityWaterDto.Justification !=undefined && updateRequesAvailabilityWaterDto.Justification != '' && updateRequesAvailabilityWaterDto.Justification != null)
        foundRequestAvailabilityWater.Justification = updateRequesAvailabilityWaterDto.Justification;
      if(updateRequesAvailabilityWaterDto.IdCardFiles !=undefined && updateRequesAvailabilityWaterDto.IdCardFiles != null)
        foundRequestAvailabilityWater.IdCardFiles = updateRequesAvailabilityWaterDto.IdCardFiles;
      if(updateRequesAvailabilityWaterDto.PlanoPrintFiles != undefined && updateRequesAvailabilityWaterDto.PlanoPrintFiles != null)
        foundRequestAvailabilityWater.PlanoPrintFiles = updateRequesAvailabilityWaterDto.PlanoPrintFiles;
      if(updateRequesAvailabilityWaterDto.LiteralCertificateFile != undefined && updateRequesAvailabilityWaterDto.LiteralCertificateFile != null)
        foundRequestAvailabilityWater.LiteralCertificateFile = updateRequesAvailabilityWaterDto.LiteralCertificateFile;
      if(updateRequesAvailabilityWaterDto.RequestLetterFile != undefined && updateRequesAvailabilityWaterDto.RequestLetterFile != null)
        foundRequestAvailabilityWater.RequestLetterFile = updateRequesAvailabilityWaterDto.RequestLetterFile;
      if(updateRequesAvailabilityWaterDto.ConstructionPermitFile != undefined && updateRequesAvailabilityWaterDto.ConstructionPermitFile != null)
        foundRequestAvailabilityWater.ConstructionPermitFile = updateRequesAvailabilityWaterDto.ConstructionPermitFile;

    return await this.requesAvailabilityWaterRepository.save(foundRequestAvailabilityWater)
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
    const hasActiveProjectState = await this.requesAvailabilityWaterRepository.exist({
      where: {StateRequest:{Id}, IsActive:true}
    })
    return hasActiveProjectState;
  }
}