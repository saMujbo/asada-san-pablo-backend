import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { UserNotification } from './user_notifications/user_notifications.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(UserNotification)
    private readonly userNotificationRepository: Repository<UserNotification>,
    private readonly userService: UsersService,
  ) {}
  
  create(createNotificationDto: CreateNotificationDto) {
    const { User_Role, ...rest } = createNotificationDto;
    return this.notificationRepository.save(rest).then(async (notification) => {
      const users = await this.userService.findByRole(User_Role);
      const userNotifications = users.map((user) => {
        const un = new UserNotification();
        un.User = user;
        un.Notification = notification;
        return un;
      });
      await this.userNotificationRepository.save(userNotifications);
      return notification;
    });
  }

  findAll() {
    return `This action returns all notification`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
