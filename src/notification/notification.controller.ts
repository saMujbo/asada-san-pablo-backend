import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { CreateImportantNotificationDto } from './dto/create-important-notification.dto';

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
