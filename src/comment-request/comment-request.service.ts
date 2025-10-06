import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentRequestDto } from './dto/create-comment-request.dto';
import { UpdateCommentRequestDto } from './dto/update-comment-request.dto';
import { CommentRequest } from './entities/comment-request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequesAvailabilityWaterService } from 'src/reques-availability-water/reques-availability-water.service';
import { hasNonEmptyString } from 'src/utils/validation.utils';
import { RequestsupervisionMeterService } from 'src/requestsupervision-meter/requestsupervision-meter.service';
import { RequestChangeMeterService } from 'src/request-change-meter/request-change-meter.service';
import { RequestChangeNameMeterService } from 'src/request-change-name-meter/request-change-name-meter.service';

@Injectable()
export class CommentRequestService {
  constructor(
    @InjectRepository(CommentRequest)
    private readonly commentRequestrepo: Repository<CommentRequest>,
    @Inject(forwardRef(()=>RequesAvailabilityWaterService))
    private readonly requestAvailabilitySv: RequesAvailabilityWaterService,
    @Inject(forwardRef(()=>RequestsupervisionMeterService))
    private readonly requestRevisionMeter: RequestsupervisionMeterService,
    @Inject(forwardRef(()=>RequestChangeMeterService))
    private readonly requestChangeMeter: RequestChangeMeterService,
    @Inject(forwardRef(()=>RequestChangeMeterService))
    private readonly requestChangeNameMeter: RequestChangeNameMeterService
  ){}
  async create(createCommentRequestDto: CreateCommentRequestDto) {
    const foundrequesAvailabilityWS = await this.requestAvailabilitySv.findOne(createCommentRequestDto.RequestAvailabilityWaterId);
    const foundRequestSupervision = await this.requestRevisionMeter.findOne(createCommentRequestDto.RequestSupervisionMeterId);
    const foundRequestChangeMeter = await this.requestChangeMeter.findOne(createCommentRequestDto.RequestChangeMeterId);
    const foundRequestChangeNameMeter = await this.requestChangeNameMeter.findOne(createCommentRequestDto.RequestChangeNameMeterId);
    const foundCommentRequest = this.commentRequestrepo.create({
      Subject: createCommentRequestDto.Subject,
      Comment: createCommentRequestDto.Comment,
      requestAvailability: foundrequesAvailabilityWS,
      RequestSupervisionMeter: foundRequestSupervision,
      RequestChangeMeter:foundRequestChangeMeter,
      RequestChangeNameMeter:foundRequestChangeNameMeter
    })
    return await this.commentRequestrepo.save(foundCommentRequest);
  }

  async findAll() {
    return await this.commentRequestrepo.find({relations:['requestAvailability',' RequestSupervisionMeter','RequestChangeMeter','RequestChangeNameMeter']});}

  async findOne(Id: number) {
    const foundCommentRequest = await this.commentRequestrepo.findOne({
      where:{Id},
      relations:['requestAvailability',' RequestSupervisionMeter','RequestChangeMeter','RequestChangeNameMeter']
    })
    if(!foundCommentRequest) throw new NotFoundException(`CommentRequest with ${Id} not found`);
    return foundCommentRequest;
  }

  async update(Id: number, updateCommentRequestDto: UpdateCommentRequestDto) {
    const foundCommentRequest = await this.commentRequestrepo.findOne({where:{Id}})
    if(!foundCommentRequest) throw new NotFoundException(`CommentRequest with ${Id} not found`)

      if(hasNonEmptyString(updateCommentRequestDto.Subject) && updateCommentRequestDto.Subject != null)
      foundCommentRequest.Subject = updateCommentRequestDto.Subject
      if(hasNonEmptyString(updateCommentRequestDto.Comment) && updateCommentRequestDto.Comment !=null)
      foundCommentRequest.Comment = updateCommentRequestDto.Comment
      
    return await this.commentRequestrepo.save(foundCommentRequest);
  }

async remove(Id: number) {
  const { affected } = await this.commentRequestrepo.delete({Id});
  if (!affected) throw new NotFoundException(`CommentRequest with id ${Id} not found`);
  return { deleted:Id};
}

}

