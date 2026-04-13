import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Put } from '@nestjs/common';
import { RequestAssociatedService } from './request-associated.service';
import { CreateRequestAssociatedDto } from './dto/create-request-associated.dto';
import { UpdateRequestAssociatedDto } from './dto/update-request-associated.dto';
import { RequestAssociatedPagination } from './dto/pagination-request-associated.dtp';
import { TokenGuard } from 'src/auth/guards/token.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { PaginationMyRequestsAssociatedDto } from './dto/pagination-my-requestassociated.dto';
import { GetAuditContext } from 'src/audit/audit.decorator';
import { AuditRequestContext } from 'src/audit/audit.types';

@Controller('request-associated')
export class RequestAssociatedController {
  constructor(private readonly requestAssociatedService: RequestAssociatedService) {}

  @Post()
  create(@Body() createRequestAssociatedDto: CreateRequestAssociatedDto) {
    return this.requestAssociatedService.create(createRequestAssociatedDto);
  }

  @Get()
  findAll() {
    return this.requestAssociatedService.findAll();
  }
  @Get('search')
  search(@Query() pagination: RequestAssociatedPagination){
    return this.requestAssociatedService.search(pagination);
  }

  // === NUEVO: mis solicitudes (sin paginar)
  @UseGuards(TokenGuard)
  @Get('me')
  getMyRequests(@GetUser('id') userId: number) {
    return this.requestAssociatedService.findAllByUser(userId);
  }

  // === NUEVO: mis solicitudes (paginado)
  @UseGuards(TokenGuard)
  @Get('me/search')
  getMyRequestsPaginated(
    @GetUser('id') userId: number,
    @Query() pagination: PaginationMyRequestsAssociatedDto,
  ) {
    // Nota: no exponemos isActive aquí; por defecto devolveremos activos en el service.
    return this.requestAssociatedService.search({
      ...pagination,
      userId,       // fuerza filtro por el usuario autenticado
    } as any);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.requestAssociatedService.findOne(id);
  }

  @UseGuards(TokenGuard)
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateRequestAssociatedDto: UpdateRequestAssociatedDto,
    @GetAuditContext() auditContext?: AuditRequestContext,
  ) {
    return this.requestAssociatedService.update(id, updateRequestAssociatedDto, auditContext);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.requestAssociatedService.remove(id);
  }
}
