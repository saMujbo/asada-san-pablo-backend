import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRequestAssociatedDto } from './dto/create-request-associated.dto';
import { UpdateRequestAssociatedDto } from './dto/update-request-associated.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestAssociated } from './entities/request-associated.entity';
import { Repository } from 'typeorm';
import { StateRequestService } from 'src/state-request/state-request.service';
import { UsersService } from 'src/users/users.service';
import { hasNonEmptyString } from 'src/utils/validation.utils';
import { RequestAssociatedPagination } from './dto/pagination-request-associated.dtp';

@Injectable()
export class RequestAssociatedService {
  constructor(
    @InjectRepository(RequestAssociated)
    private readonly requestAssociatedRepo: Repository<RequestAssociated>,
    @Inject(forwardRef(()=> StateRequestService))
    private readonly stateRequestSv: StateRequestService,
    @Inject(forwardRef(()=> UsersService))
    private readonly userSerive:UsersService
    
  ){}

  // Método público para contar las solicitudes pendientes asociadas
  async countPendingRequests(): Promise<number> {
    const pendingState = await this.requestAssociatedRepo
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.StateRequest', 'stateRequest')
      .where('stateRequest.Name = :stateName', { stateName: 'PENDIENTE' })
      .andWhere('req.IsActive = :isActive', { isActive: true })
      .getCount();

    return pendingState;
  }

  async countApprovedRequests(): Promise<number> {
    const approvedState = await this.requestAssociatedRepo
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.StateRequest', 'stateRequest')
      .where('LOWER(stateRequest.Name) IN (:...states)', { states: ['aprobado', 'aprobada'] })
      .andWhere('req.IsActive = :isActive', { isActive: true })
      .getCount();
    return approvedState;
  }

  async create(createRequestAssociatedDto: CreateRequestAssociatedDto) {
  if (!createRequestAssociatedDto.IDcard) {
    throw new BadRequestException('Debe ingresar una cédula válida.');
  }

  const user = await this.userSerive.findByIdCardRaw(createRequestAssociatedDto.IDcard); // método que vimos antes

  if (!user) {
    throw new BadRequestException('No se encontró ningún usuario con esa cédula.');
  }

  const isAbonado = user.Roles?.some(
    (r) => r.Rolname?.toUpperCase() === 'ABONADO'
  );
  if (!isAbonado) {
    throw new BadRequestException('El usuario no tiene rol ABONADO.');
  }

  const state =  await this.stateRequestSv.findDefaultState();

  if (!state) {
    throw new BadRequestException('No se encontró un estado válido para la solicitud.');
  }

  const request = this.requestAssociatedRepo.create({
    IDcard:createRequestAssociatedDto.IDcard,
    Name: createRequestAssociatedDto.Name,
    Justificattion:createRequestAssociatedDto.Justification,
    Surname1: createRequestAssociatedDto.Surname1,
    Surname2: createRequestAssociatedDto.Surname2,
    NIS:createRequestAssociatedDto.NIS,
    User: user,
    StateRequest: state,
  });

  return await this.requestAssociatedRepo.save(request);
  }

  async findAll() {
    return await this.requestAssociatedRepo.find({
      where:{IsActive:true},relations:[
        'User',
        'StateRequest'
      ]
    })
  }
async search({ page = 1, limit = 10, UserName, StateRequestId, State }: RequestAssociatedPagination) {
  const pageNum = Math.max(1, Number(page) || 1);
  const take = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * take;

  const qb = this.requestAssociatedRepo
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
    const foundRequestAssociated = await this.requestAssociatedRepo.findOne({
      where:{Id,IsActive:true},relations:[
        'StateRequest','User']});
    if(!foundRequestAssociated) throw new NotFoundException(`Resquest with ${Id} not found`)
    return foundRequestAssociated;
  }

  async update(Id: number, updateRequestAssociatedDto:UpdateRequestAssociatedDto) {
    const foundRequestAssociated = await this.requestAssociatedRepo.findOne({where:{Id}})
    if(!foundRequestAssociated){throw new NotFoundException(`Request with ${Id} not found`) }

    if (updateRequestAssociatedDto.StateRequestId !== undefined && updateRequestAssociatedDto.StateRequestId !== null) {
      const foundState = await this.stateRequestSv.findOne(updateRequestAssociatedDto.StateRequestId);
      if (!foundState) {
        throw new NotFoundException(`state with Id ${updateRequestAssociatedDto.StateRequestId} not found`);
      }
      foundRequestAssociated.StateRequest = foundState;
    }

    if(updateRequestAssociatedDto.IDcard !== undefined && updateRequestAssociatedDto.IDcard != null && updateRequestAssociatedDto.IDcard != ''){
      foundRequestAssociated.IDcard = updateRequestAssociatedDto.IDcard;
      return await this.requestAssociatedRepo.save(foundRequestAssociated);
    }
    if(hasNonEmptyString(updateRequestAssociatedDto.Name)){
      foundRequestAssociated.Name = updateRequestAssociatedDto.Name}
    if(hasNonEmptyString(updateRequestAssociatedDto.Justification)){
      foundRequestAssociated.Justificattion = updateRequestAssociatedDto.Justification;
    }
    if(hasNonEmptyString(updateRequestAssociatedDto.Surname1)){
      foundRequestAssociated.Surname1 = updateRequestAssociatedDto.Surname1;
    }
    
    if(hasNonEmptyString(updateRequestAssociatedDto.Surname2)){
      foundRequestAssociated.Surname2 = updateRequestAssociatedDto.Surname2;
    }

    if(updateRequestAssociatedDto.NIS != undefined && updateRequestAssociatedDto.NIS != null )
      foundRequestAssociated.NIS = updateRequestAssociatedDto.NIS;
  }

  async remove(Id: number) {
    const foundRequestAssociated = await this.requestAssociatedRepo.findOne({ where: { Id } })
    if (!foundRequestAssociated) {
      throw new NotFoundException(`Requestwith Id ${Id} not found`);
    }
    foundRequestAssociated.IsActive = false;
    
    return await this.requestAssociatedRepo.save(foundRequestAssociated); 
  }

    async isOnRequestState(Id:number){
    const hasActiveRequestState = await this.requestAssociatedRepo.exist({
      where: {StateRequest:{Id}, IsActive:true}
    })
    return hasActiveRequestState;
  }

    async updateRequestAssociated(requestAssociated: RequestAssociated) {
      this.requestAssociatedRepo.save(requestAssociated);
    }
}
