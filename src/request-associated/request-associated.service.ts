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

type MonthlyPoint = { year: string; month: string; count: string };
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
async search({
  page = 1,
  limit = 10,
  q,
  StateRequestId,
  State,     // si lo sigues usando en el endpoint general
  userId,    // <-- viene solo desde /me/search (inyectado)
}: RequestAssociatedPagination & { userId?: number; q?: string }) {
  const pageNum = Math.max(1, Number(page) || 1);
  const take = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * take;

  const qb = this.requestAssociatedRepo
    .createQueryBuilder('req')
    .leftJoinAndSelect('req.User', 'user')
    .leftJoinAndSelect('req.StateRequest', 'stateRequest')
    .orderBy('req.Date', 'DESC')
    .skip(skip)
    .take(take);

  // isActive: si viene State en el search general, conviértelo;
  // si viene userId (me/search) y no se especificó nada, por defecto solo activos.
  let isActiveFilter: boolean | undefined = undefined;
  if (State !== undefined && State !== null && State !== '') {
    isActiveFilter = typeof State === 'string' ? State.toLowerCase() === 'true' : !!State;
  } else if (typeof userId === 'number') {
    isActiveFilter = true; // default para "mis solicitudes"
  }
  if (typeof isActiveFilter === 'boolean') {
    qb.andWhere('req.IsActive = :isActive', { isActive: isActiveFilter });
  }

  if (typeof StateRequestId === 'number') {
    qb.andWhere('req.StateRequestId = :stateId', { stateId: StateRequestId });
  }

  if (typeof userId === 'number') {
    qb.andWhere('req.UserId = :uid', { uid: userId });
  }

  if (q && q.trim() !== '') {
    qb.andWhere('(LOWER(req.Justification) LIKE :q OR LOWER(user.Name) LIKE :q)', {
      q: `%${q.toLowerCase()}%`,
    });
  }

  const [data, total] = await qb.getManyAndCount();
  return {
    data,
    meta: {
      page: pageNum,
      limit: take,
      total,
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
      await this.requestAssociatedRepo.save(foundRequestAssociated);
      return foundRequestAssociated;
    }
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

  async getMonthlyCounts(months = 12) {
    const now = new Date();
    const from = new Date(now);
    from.setMonth(from.getMonth() - (months - 1), 1);
    from.setHours(0, 0, 0, 0);

    const rows = await this.requestAssociatedRepo
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
    return this.requestAssociatedRepo
      .createQueryBuilder('req')
      .where('req.IsActive = :act', { act: true })
      .andWhere('req.UserId = :uid', { uid: userId })
      .getCount();
  }

  async countPendingByUser(userId: number): Promise<number> {
    return this.requestAssociatedRepo
      .createQueryBuilder('req')
      .leftJoin('req.StateRequest', 'state')
      .where('req.IsActive = :act', { act: true })
      .andWhere('req.UserId = :uid', { uid: userId })
      .andWhere('UPPER(state.Name) = :p', { p: 'PENDIENTE' })
      .getCount();
  }

  // Listado simple por usuario (sin paginar)
  async findAllByUser(userId: number) {
  return this.requestAssociatedRepo.find({
    where: { IsActive: true, User: { Id: userId } },
    relations: ['StateRequest'],
    order: { Date: 'DESC' },
  });
  }

  // Listado paginado por usuario
  async searchByUser(
    userId: number,
    { page = 1, limit = 10 }: { page?: number; limit?: number }
  ) {
    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * take;

    const qb = this.requestAssociatedRepo
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.StateRequest', 'state')
      .where('req.IsActive = :act', { act: true })
      .andWhere('req.UserId = :uid', { uid: userId })
      .orderBy('req.Date', 'DESC')
      .skip(skip)
      .take(take);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        page: pageNum,
        limit: take,
        total,
        pageCount: Math.max(1, Math.ceil(total / take)),
        hasNextPage: pageNum * take < total,
        hasPrevPage: pageNum > 1,
      },
    };
  }
}
