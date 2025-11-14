import { Module } from '@nestjs/common';
import { MailServiceService } from './mail-service.service';
import { MailServiceController } from './mail-service.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
    ConfigModule
  ],
  controllers: [MailServiceController],
  providers: [MailServiceService],
  exports: [MailServiceService]
})
export class MailServiceModule {}
