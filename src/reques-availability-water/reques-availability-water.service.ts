import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateRequestAvailabilityWaterDto } from './dto/create-reques-availability-water.dto';
import { UpdateRequestAvailabilityWaterDto } from './dto/update-reques-availability-water.dto';
import { RequesAvailabilityWater } from './entities/reques-availability-water.entity';
import { UsersService } from 'src/users/users.service';
import { StateRequestService } from 'src/state-request/state-request.service';
import { RequestAvailabilityWaterPagination } from './dto/pagination-request-availabaility.dto';

type MonthlyPoint = { year: string; month: string; count: string };
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

  // Método público para contar las solicitudes pendientes de disponibilidad de agua
  async countPendingRequests(): Promise<number> {
    const pendingState = await this.requesAvailabilityWaterRepository
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.StateRequest', 'stateRequest')
      .where('stateRequest.Name = :stateName', { stateName: 'PENDIENTE' })
      .andWhere('req.IsActive = :isActive', { isActive: true })
      .getCount();

    return pendingState;
  }

  // Método público para contar las solicitudes pendientes de disponibilidad de agua
  async countApprovedRequests(): Promise<number> {
    const approvedState = await this.requesAvailabilityWaterRepository
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.StateRequest', 'stateRequest')
      .where('LOWER(stateRequest.Name) IN (:...states)', { states: ['aprobado', 'aprobada'] })
      .andWhere('req.IsActive = :isActive', { isActive: true })
      .getCount();

    return approvedState;
  }
  
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
        'User',
        'RequestAvailabilityWaterFiles']});
  }
  async search({
  page = 1,
  limit = 10,
  q,
  StateRequestId,
  State,     // si lo sigues usando en el endpoint general
  userId,    // <-- viene solo desde /me/search (inyectado)
}: RequestAvailabilityWaterPagination & { userId?: number; q?: string }) {
  const pageNum = Math.max(1, Number(page) || 1);
  const take = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * take;

  const qb = this.requesAvailabilityWaterRepository
    .createQueryBuilder('req')
    .leftJoinAndSelect('req.User', 'user')
    .leftJoinAndSelect('req.StateRequest', 'stateRequest')
    .leftJoinAndSelect('req.RequestAvailabilityWaterFiles', 'files')
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
    const foundRequestAvailabilityWater = await this.requesAvailabilityWaterRepository.findOne({
      where:{Id,IsActive:true},relations:[
        'StateRequest',
        'User',
        'RequestAvailabilityWaterFiles']});
      if(!foundRequestAvailabilityWater)throw new NotFoundException(`Resquest with ${Id} not found`);
    return foundRequestAvailabilityWater;
  }

  async update(Id: number, updateRequesAvailabilityWaterDto: UpdateRequestAvailabilityWaterDto) {
    const foundRequestAvailabilityWater = await this.requesAvailabilityWaterRepository.findOne({ where: { Id } });
    if(!foundRequestAvailabilityWater) throw new NotFoundException(`RequesAvailabilityWater with ${Id} not found`)

    if(updateRequesAvailabilityWaterDto.StateRequestId != undefined && updateRequesAvailabilityWaterDto.StateRequestId != null) {
      const foundState = await this.stateRequestSv.findOne(updateRequesAvailabilityWaterDto.StateRequestId)
      if(!foundState){throw new NotFoundException(`state with Id ${updateRequesAvailabilityWaterDto.StateRequestId} not found`)}
      foundRequestAvailabilityWater.StateRequest = foundState
    }

    if (updateRequesAvailabilityWaterDto.CanComment !== undefined && updateRequesAvailabilityWaterDto.CanComment !== null) {
      foundRequestAvailabilityWater.CanComment = updateRequesAvailabilityWaterDto.CanComment;
    }

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

  async getMonthlyCounts(months = 12) {
    const now = new Date();
    const from = new Date(now);
    from.setMonth(from.getMonth() - (months - 1), 1);
    from.setHours(0, 0, 0, 0);

    const rows = await this.requesAvailabilityWaterRepository
      .createQueryBuilder('req')
      .select('YEAR(req.Date)', 'year')   
      .addSelect('MONTH(req.Date)', 'month') 
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
    return this.requesAvailabilityWaterRepository
      .createQueryBuilder('req')
      .where('req.IsActive = :act', { act: true })
      .andWhere('req.UserId = :uid', { uid: userId })
      .getCount();
  }

  async countPendingByUser(userId: number): Promise<number> {
    return this.requesAvailabilityWaterRepository
      .createQueryBuilder('req')
      .leftJoin('req.StateRequest', 'state')
      .where('req.IsActive = :act', { act: true })
      .andWhere('req.UserId = :uid', { uid: userId })
      .andWhere('UPPER(state.Name) = :p', { p: 'PENDIENTE' })
      .getCount();
  }

  // Listado simple por usuario (sin paginar)
  async findAllByUser(userId: number) {
  return this.requesAvailabilityWaterRepository.find({
    where: { IsActive: true, User: { Id: userId } },
    relations: ['StateRequest','RequestAvailabilityWaterFiles'],
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

  const qb = this.requesAvailabilityWaterRepository
    .createQueryBuilder('req')
    .leftJoinAndSelect('req.StateRequest', 'state')
    .leftJoinAndSelect('req.RequestAvailabilityWaterFiles', 'files')  // ⬅️ AGREGAR ESTA LÍNEA
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