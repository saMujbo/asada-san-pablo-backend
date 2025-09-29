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
  async search({page =1, limit =10, state}:RequestAvailabilityWaterPagination){
        const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * take;

    const qb = this.requesAvailabilityWaterRepository.createQueryBuilder('resquestAvailabilityWater')
      .skip(skip)
      .take(take);

      if (state) {
      qb.andWhere('resquestAvailabilityWater.IsActive = :state', { state });
    }
    const [data, total]= await qb.getManyAndCount();
    return{
      data,
      meta:{
        page:pageNum,
        limit:take,
        pageCount:Math.max(1,Math.ceil(total/take)),
        hasNextPage:pageNum * take < total,
        hasPrevPage: pageNum >1,
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