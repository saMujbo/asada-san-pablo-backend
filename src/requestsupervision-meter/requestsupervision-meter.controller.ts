import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { RequestsupervisionMeterService } from './requestsupervision-meter.service';
import { CreateRequestSupervisionMeterDto } from './dto/create-requestsupervision-meter.dto';
import { UpdateRequestsupervisionMeterDto } from './dto/update-requestsupervision-meter.dto';
import { RequestSupervisionPagination } from './dto/pagination-requesSupervisiom-meter.tdo';
import { TokenGuard } from 'src/auth/guards/token.guard';
import { GetUser } from 'src/auth/get-user.decorator';

@Controller('requestsupervision-meter')
export class RequestsupervisionMeterController {
  constructor(private readonly requestsupervisionMeterService: RequestsupervisionMeterService) {}

  @Post()
  create(@Body() createRequestsupervisionMeterDto: CreateRequestSupervisionMeterDto) {
    return this.requestsupervisionMeterService.create(createRequestsupervisionMeterDto);
  }

  @Get()
  findAll() {
    return this.requestsupervisionMeterService.findAll();
  }

  @Get('search')
  search(@Query() pagination:RequestSupervisionPagination){
    return this.requestsupervisionMeterService.search(pagination);
  }

  // === NUEVO: mis solicitudes (sin paginar)
  @UseGuards(TokenGuard)
  @Get('me')
  getMyRequests(@GetUser('id') userId: number) {
    return this.requestsupervisionMeterService.findAllByUser(userId);
  }

  // === NUEVO: mis solicitudes (paginado)
  @UseGuards(TokenGuard)
  @Get('me/search')
  getMyRequestsPaginated(
    @GetUser('id') userId: number,
    @Query() pagination: RequestSupervisionPagination,
  ) {
    // Nota: no exponemos isActive aquí; por defecto devolveremos activos en el service.
    return this.requestsupervisionMeterService.search({
      ...pagination,
      userId,       // fuerza filtro por el usuario autenticado
    } as any);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.requestsupervisionMeterService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateRequestsupervisionMeterDto: UpdateRequestsupervisionMeterDto) {
    return this.requestsupervisionMeterService.update(id, updateRequestsupervisionMeterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.requestsupervisionMeterService.remove(id);
  }
}
