import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { UserNotification } from './user_notifications/user_notifications.entity';
import { CreateImportantNotificationDto } from './dto/create-important-notification.dto';
import { CreateNotificationUserDto } from './dto/create-notification-user.dto';
import { NotificationGateway, NotificationSummaryPayload } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(UserNotification)
    private readonly userNotificationRepository: Repository<UserNotification>,
    private readonly userService: UsersService,
    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
  ) {}

  private formatHour(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  async getNotificationsSummary(userId?: number): Promise<NotificationSummaryPayload[]> {
    const qb = this.notificationRepository
      .createQueryBuilder('notification')
      .select(['notification.Id', 'notification.Subject', 'notification.Message', 'notification.CreatedAt'])
      .orderBy('notification.CreatedAt', 'DESC');

    if (userId !== undefined) {
      qb.innerJoin(
        'notification.UserNotifications',
        'un',
        'un.User_id = :userId',
        { userId },
      );
    }

    const notifications = await qb.getMany();

    return notifications.map((notification) => ({
      Id: notification.Id,
      Subject: notification.Subject,
      Message: notification.Message,
      Hour: this.formatHour(notification.CreatedAt),
      CreatedAt: notification.CreatedAt,
    }));
  }

  private async emitNotificationsToUser(userId: number) {
    const payload = await this.getNotificationsSummary(userId);
    this.notificationGateway.emitNotificationsToUser(userId, payload);
  }

  private async emitAllNotificationsSummary() {
    const payload = await this.getNotificationsSummary();
    this.notificationGateway.emitAllNotifications(payload);
  }
  
  async createNotificationByRole(createNotificationDto: CreateNotificationDto) {
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
      await Promise.all(users.map((user) => this.emitNotificationsToUser(user.Id)));
      return notification;
    });
  }

  async createNotificationByUserID(createNotificationDto: CreateNotificationUserDto) {
    const { UserID, ...rest } = createNotificationDto;
    return this.notificationRepository.save(rest).then(async (notification) => {
      const user = await this.userService.findOne(UserID);
      const userNotifications = {
        User: user,
        Notification: notification
      };

      await this.userNotificationRepository.save(userNotifications);
      await this.emitNotificationsToUser(UserID);
      return notification;
    });
  }

  async createImportantNotification(createNotificationDto: CreateImportantNotificationDto) {
    return this.notificationRepository.save(createNotificationDto).then(async (notification) => {
      const users = await this.userService.findAllWithoutRelations();
      const userNotifications = users.map((user) => {
        const un = new UserNotification();
        un.User = user;
        un.Notification = notification;
        return un;
      });
      await this.userNotificationRepository.save(userNotifications);
      await this.emitAllNotificationsSummary();
      return notification;
    });
  }

  async findAll() {
    return this.notificationRepository.find({ relations: ['UserNotifications'] });
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} notification`;
  // }

  // update(id: number, updateNotificationDto: UpdateNotificationDto) {
  //   return `This action updates a #${id} notification`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} notification`;
  // }
}
