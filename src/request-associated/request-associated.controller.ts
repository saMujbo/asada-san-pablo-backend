import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { RequestAssociatedService } from './request-associated.service';
import { CreateRequestAssociatedDto } from './dto/create-request-associated.dto';
import { UpdateRequestAssociatedDto } from './dto/update-request-associated.dto';
import { RequestAssociatedPagination } from './dto/pagination-request-associated.dtp';
import { TokenGuard } from 'src/auth/guards/token.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { PaginationMyRequestsAssociatedDto } from './dto/pagination-my-requestassociated.dto';

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

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateRequestAssociatedDto: UpdateRequestAssociatedDto) {
    return this.requestAssociatedService.update(id, updateRequestAssociatedDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.requestAssociatedService.remove(id);
  }
}
