import {Controller,Get,Post,Body,Patch,Param,Delete,ParseIntPipe, UseGuards, Query,} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Roles } from 'src/auth/auth-roles/roles.decorator';
import { Role } from 'src/auth/auth-roles/roles.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { GetUser } from 'src/auth/get-user.decorator';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('pagination')
  @Roles(Role.ADMIN) // Only allow ADMIN role to access this endpoint
  findAllPagination(@Query() pagination: PaginationDto) {
    return this.usersService.findAllPagination(pagination);
  }

  // @Get(':id')
  // findOne(@Param('id', ParseIntPipe) id: number) {
  //   return this.usersService.findOne(id);
  // }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@GetUser('Id') id: number) { // OJO con mayúscula/minúscula
    return this.usersService.findOne(id);
  }
}
