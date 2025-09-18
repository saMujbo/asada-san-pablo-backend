import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { ActualExpenseService } from './actual-expense.service';
import { CreateActualExpenseDto } from './dto/create-actual-expense.dto';
import { UpdateActualExpenseDto } from './dto/update-actual-expense.dto';

@Controller('actual-expense')
export class ActualExpenseController {
  constructor(private readonly actualExpenseService: ActualExpenseService) {}

  @Post()
  create(@Body() createActualExpenseDto: CreateActualExpenseDto) {
    return this.actualExpenseService.create(createActualExpenseDto);
  }

  @Get()
  findAll() {
    return this.actualExpenseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.actualExpenseService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, 
  @Body() updateActualExpenseDto: UpdateActualExpenseDto) {
    return this.actualExpenseService.update(id, updateActualExpenseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.actualExpenseService.remove(id);
  }
}
