import {Controller,Get,Post,Body,Patch,Param,Delete,ParseIntPipe, UseGuards, Query, Put,} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Roles } from 'src/auth/auth-roles/roles.decorator';
import { Role } from 'src/auth/auth-roles/roles.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateRolesUserDto } from './dto/updateRoles-user.dto';
import { TokenGuard } from 'src/auth/guards/token.guard';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(TokenGuard)
  @Get('me')
  async getMe(@GetUser('id') id: number) {
    return this.usersService.findMe(id);
  }

  @UseGuards(TokenGuard)
  @Put('me')
  async updateMe(@GetUser('id') id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(id, dto);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  //@UseGuards(RolesGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  //@UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('pagination')
  //@Roles(Role.ADMIN) // Only allow ADMIN role to access this endpoint
  findAllPagination(@Query() pagination: PaginationDto) {
    return this.usersService.findAllPagination(pagination);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.findOne(id);
  }
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Put('roles/updateroles')
  async removeRoleFromUser(@Query() updateRoles: UpdateRolesUserDto) {
    return this.usersService.removeRolesFromUser(updateRoles);
  }

   //@UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put('roles/addroles/id')
   //@Roles(Role.ADMIN) 
  async AddRoleToUser( @Query() updateRoles: UpdateRolesUserDto ) {
    return await this.usersService.AddRolesFromUser(updateRoles);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await  this.usersService.update(id, updateUserDto);
  }


}
