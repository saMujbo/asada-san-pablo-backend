import { Controller, Get, Post, Body,Param, Delete, Query, Put, UseGuards } from '@nestjs/common';
import { RequestChangeMeterService } from './request-change-meter.service';
import { CreateRequestChangeMeterDto } from './dto/create-request-change-meter.dto';
import { UpdateRequestChangeMeterDto } from './dto/update-request-change-meter.dto';
import { RequestChangeMeterPagination } from './dto/pagination-request-change-meter.dto';
import { TokenGuard } from 'src/auth/guards/token.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { PaginationMyRequestsChangeMeterDto } from './dto/pagination-my-requestchangemeter.dto';

@Controller('request-change-meter')
export class RequestChangeMeterController {
  constructor(private readonly requestChangeMeterService: RequestChangeMeterService) {}

  @Post()
  create(@Body() createRequestChangeMeterDto: CreateRequestChangeMeterDto) {
    return this.requestChangeMeterService.create(createRequestChangeMeterDto);
  }

  @Get()
  findAll() {
    return this.requestChangeMeterService.findAll();
  }

    @Get('search')
    search(@Query() pagination: RequestChangeMeterPagination){
      return this.requestChangeMeterService.search(pagination);
    }

  // === NUEVO: mis solicitudes (sin paginar)
  @UseGuards(TokenGuard)
  @Get('me')
  getMyRequests(@GetUser('id') userId: number) {
    return this.requestChangeMeterService.findAllByUser(userId);
  }

  // === NUEVO: mis solicitudes (paginado)
  @UseGuards(TokenGuard)
  @Get('me/search')
  getMyRequestsPaginated(
    @GetUser('id') userId: number,
    @Query() pagination: PaginationMyRequestsChangeMeterDto,
  ) {
    // Nota: no exponemos isActive aquí; por defecto devolveremos activos en el service.
    return this.requestChangeMeterService.search({
      ...pagination,
      userId,       // fuerza filtro por el usuario autenticado
    } as any);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.requestChangeMeterService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateRequestChangeMeterDto: UpdateRequestChangeMeterDto) {
    return this.requestChangeMeterService.update(id, updateRequestChangeMeterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.requestChangeMeterService.remove(id);
  }
}
