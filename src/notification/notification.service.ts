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
import { MailServiceService } from 'src/mail-service/mail-service.service';

const IMPORTANT_NOTIFICATION_EMAIL_LIMIT = 75;

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(UserNotification)
    private readonly userNotificationRepository: Repository<UserNotification>,
    private readonly userService: UsersService,
    private readonly mailService: MailServiceService,
    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
  ) {}

  private formatHour(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  async getNotificationsSummary(): Promise<NotificationSummaryPayload[]> {
    const notifications = await this.notificationRepository.find({
      select: {
        Id: true,
        Subject: true,
        Message: true,
        CreatedAt: true,
      },
      order: {
        CreatedAt: 'DESC',
      },
    });

    return notifications.map((notification) => ({
      Id: notification.Id,
      Subject: notification.Subject,
      Message: notification.Message,
      Hour: this.formatHour(notification.CreatedAt),
      CreatedAt: notification.CreatedAt,
    }));
  }

  private async emitAllNotificationsSummary() {
    const payload = await this.getNotificationsSummary();
    this.notificationGateway.emitAllNotifications(payload);
  }

  private pickRandomUsers<T>(users: T[], limit: number): T[] {
    const shuffled = [...users];

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, Math.min(limit, shuffled.length));
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
      const eligibleUsers = users.filter(
        (user) => user.IsActive && typeof user.Email === 'string' && user.Email.trim() !== '',
      );
      const emailRecipients = this.pickRandomUsers(
        eligibleUsers,
        IMPORTANT_NOTIFICATION_EMAIL_LIMIT,
      );

      await Promise.allSettled(
        emailRecipients.map((user) =>
          this.mailService.sendIncidentNotificationEmail({
            to: user.Email,
            subject: rest.Subject,
            message: rest.Message,
          }),
        ),
      );
      await this.emitAllNotificationsSummary();
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
      await this.emitAllNotificationsSummary();
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
      const eligibleUsers = users.filter(
        (user) => user.IsActive && typeof user.Email === 'string' && user.Email.trim() !== '',
      );
      const emailRecipients = this.pickRandomUsers(
        eligibleUsers,
        IMPORTANT_NOTIFICATION_EMAIL_LIMIT,
      );

      await Promise.allSettled(
        emailRecipients.map((user) =>
          this.mailService.sendIncidentNotificationEmail({
            to: user.Email,
            subject: createNotificationDto.Subject,
            message: createNotificationDto.Message,
          }),
        ),
      );
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
