import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { UsersModule } from 'src/users/users.module';
import { UserNotification } from './user_notifications/user_notifications.entity';
import { NotificationsGateway } from './notification.gateway';
import { MailServiceModule } from 'src/mail-service/mail-service.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, UserNotification]),
    UsersModule,
    MailServiceModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationsGateway],
  exports: [NotificationService, NotificationsGateway],
})
export class NotificationModule {}
