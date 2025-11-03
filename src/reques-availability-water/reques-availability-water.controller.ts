import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { RequesAvailabilityWaterService } from './reques-availability-water.service';
import { CreateRequestAvailabilityWaterDto } from './dto/create-reques-availability-water.dto';
import { UpdateRequestAvailabilityWaterDto } from './dto/update-reques-availability-water.dto';
import { RequestAvailabilityWaterPagination } from './dto/pagination-request-availabaility.dto';
import { TokenGuard } from 'src/auth/guards/token.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { PaginationMyRequestsDto } from './dto/pagination-my-requests.dto';

@Controller('request-availability-water')
export class RequesAvailabilityWaterController {
  constructor(private readonly requesAvailabilityWaterService: RequesAvailabilityWaterService) {}

  @Post()
  create(@Body() createRequesAvailabilityWaterDto: CreateRequestAvailabilityWaterDto) {
    return this.requesAvailabilityWaterService.create(createRequesAvailabilityWaterDto);
  }

  @Get()
  findAll() {
    return this.requesAvailabilityWaterService.findAll();
  }

  @Get('search')
  search(@Query() pagination: RequestAvailabilityWaterPagination){
    return this.requesAvailabilityWaterService.search(pagination);
  }

   // === NUEVO: mis solicitudes (sin paginar)
  @UseGuards(TokenGuard)
  @Get('me')
  getMyRequests(@GetUser('id') userId: number) {
    return this.requesAvailabilityWaterService.findAllByUser(userId);
  }

  // === NUEVO: mis solicitudes (paginado)
  @UseGuards(TokenGuard)
  @Get('me/search')
  getMyRequestsPaginated(
    @GetUser('id') userId: number,
    @Query() pagination: PaginationMyRequestsDto,
  ) {
    // Nota: no exponemos isActive aquí; por defecto devolveremos activos en el service.
    return this.requesAvailabilityWaterService.search({
      ...pagination,
      userId,       // fuerza filtro por el usuario autenticado
    } as any);
  }


  @Get(':id')
  findOne(@Param('id') Id: number) {
    return this.requesAvailabilityWaterService.findOne(Id);
  }

  @Put(':id')
  update(@Param('id') Id: number, @Body() updateRequesAvailabilityWaterDto: UpdateRequestAvailabilityWaterDto) {
    return this.requesAvailabilityWaterService.update(Id, updateRequesAvailabilityWaterDto);
  }

  @Delete(':id')
  remove(@Param('id') Id: number) {
    return this.requesAvailabilityWaterService.remove(Id);
  }
}
