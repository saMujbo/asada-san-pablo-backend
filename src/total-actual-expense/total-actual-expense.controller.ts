import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TotalActualExpenseService } from './total-actual-expense.service';
import { CreateTotalActualExpenseDto } from './dto/create-total-actual-expense.dto';
import { UpdateTotalActualExpenseDto } from './dto/update-total-actual-expense.dto';

@Controller('total-actual-expense')
export class TotalActualExpenseController {
  constructor(private readonly totalActualExpenseService: TotalActualExpenseService) {}

  @Post()
  create(@Body() createTotalActualExpenseDto: CreateTotalActualExpenseDto) {
    return this.totalActualExpenseService.create(createTotalActualExpenseDto);
  }

  @Get()
  findAll() {
    return this.totalActualExpenseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.totalActualExpenseService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTotalActualExpenseDto: UpdateTotalActualExpenseDto) {
  //   return this.totalActualExpenseService.update(+id, updateTotalActualExpenseDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.totalActualExpenseService.remove(+id);
  // }
}
