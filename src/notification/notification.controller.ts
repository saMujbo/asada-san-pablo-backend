import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CreateImportantNotificationDto } from './dto/create-important-notification.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('/by-role')
  createByRole(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.createNotificationByRole(createNotificationDto);
  }

  @Post()
  create(@Body() createNotificationDto: CreateImportantNotificationDto) {
    return this.notificationService.createImportantNotification(createNotificationDto);
  }

  @Get()
  findAll() {
    return this.notificationService.findAll();
  }

  @Get('me')
  async findMine(@GetUser('id') userId: number) {
    return await this.notificationService.findAllByUser(userId);
  }

  @Patch('read-all')
  async markAllAsRead(@GetUser('id') userId: number) {
    return await this.notificationService.markAllAsRead(userId);
  }

  @Patch(':userNotificationId/read')
  async markAsRead(
    @Param('userNotificationId') userNotificationId: string,
    @GetUser('id') userId: number,
  ) {
    return await this.notificationService.markAsRead(+userNotificationId, userId);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.notificationService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
  //   return this.notificationService.update(+id, updateNotificationDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.notificationService.remove(+id);
  // }
}
