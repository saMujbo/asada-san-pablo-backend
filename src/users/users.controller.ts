import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateMeDto } from './dto/updateMeDto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.decorator';
import { UpdateRolesUserDto } from './dto/updateRoles-user.dto';
import { TokenGuard } from 'src/auth/guards/token.guard';
import { UpdateEmailDto } from './dto/updateEmail-user';
import { PaginationDto } from './dto/pagination.dto';
import { GetAuditContext } from 'src/audit/audit.decorator';
import { AuditRequestContext } from 'src/audit/audit.types';

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
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: { type: 'string', format: 'binary', description: 'Foto de perfil (opcional)' },
        Address: { type: 'string' },
        PhoneNumber: { type: 'string' },
        Birthdate: { type: 'string', example: '1990-01-01' },
      },
    },
  })
  async updateMe(
    @GetUser('id') id: number,
    @Body() dto: UpdateMeDto,
    @UploadedFile() photo?: Express.Multer.File,
    @GetAuditContext() auditContext?: AuditRequestContext,
  ) {
    return this.usersService.updateMe(id, dto, photo, auditContext);
  }

  @UseGuards(TokenGuard)
  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @GetAuditContext() auditContext?: AuditRequestContext,
  ) {
    return this.usersService.create(createUserDto, auditContext);
  }

  //@UseGuards(RolesGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('/role-admin')
  async getAdmins() {
    return this.usersService.findUsersByRoleAdmin();
  }

  @Get('/role-abonado')
  async getAbonados() {
    return this.usersService.findUsersByRole();
  }

  @Get('/role-fontanero')
  async getFontaneros() {
    return this.usersService.findUsersByRoleFontanero();
  }

  //@UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('search')
  //@Roles(Role.ADMIN) // Only allow ADMIN role to access this endpoint
  search(@Query() pagination: PaginationDto) {
    return this.usersService.search(pagination);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.findOne(id);
  }

  @UseGuards(TokenGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetAuditContext() auditContext?: AuditRequestContext,
  ) {
    return this.usersService.remove(id, auditContext);
  }

  @Put('roles/updateroles')
  @UseGuards(TokenGuard)
  async removeRoleFromUser(
    @Query() updateRoles: UpdateRolesUserDto,
    @GetAuditContext() auditContext?: AuditRequestContext,
  ) {
    return this.usersService.removeRolesFromUser(updateRoles, auditContext);
  }

   //@UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put('roles/addroles/id')
  @UseGuards(TokenGuard)
   //@Roles(Role.ADMIN) 
  async AddRoleToUser(
    @Query() updateRoles: UpdateRolesUserDto,
    @GetAuditContext() auditContext?: AuditRequestContext,
  ) {
    return await this.usersService.AddRolesFromUser(updateRoles, auditContext);
  }

  @UseGuards(TokenGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @GetAuditContext() auditContext?: AuditRequestContext,
  ) {
    return await this.usersService.update(id, updateUserDto, auditContext);
  }

  @UseGuards(TokenGuard)
  @Put('update/email')
  async updateMyEmail(
    @GetUser('id') id: number,
    @Body() dto: UpdateEmailDto,
    @GetAuditContext() auditContext?: AuditRequestContext,
  ) {
    return await this.usersService.updateMyEmail(id, dto, auditContext);
  }
  


  @Get('abonados/search')
  @ApiQuery({ 
  name: 'q', 
  required: false, 
  description: 'Término de búsqueda (nombre, apellido, cédula o NIS)' 
  })
  async searchAbonados(@Query('q') searchTerm?: string) {
  return this.usersService.searchAbonados(searchTerm);
  }
}
