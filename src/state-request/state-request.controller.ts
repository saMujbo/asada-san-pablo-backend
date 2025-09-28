import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StateRequestService } from './state-request.service';
import { CreateStateRequestDto } from './dto/create-state-request.dto';
import { UpdateStateRequestDto } from './dto/update-state-request.dto';

@Controller('state-request')
export class StateRequestController {
  constructor(private readonly stateRequestService: StateRequestService) {}

  @Post()
  create(@Body() createStateRequestDto: CreateStateRequestDto) {
    return this.stateRequestService.create(createStateRequestDto);
  }

  @Get()
  findAll() {
    return this.stateRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stateRequestService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStateRequestDto: UpdateStateRequestDto) {
    return this.stateRequestService.update(+id, updateStateRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stateRequestService.remove(+id);
  }
}
