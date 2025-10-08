import { Module } from '@nestjs/common';
import { DropboxService } from './dropbox.service';
import { DropboxController } from './dropbox.controller';
import { Dropbox } from 'dropbox';

@Module({
  controllers: [DropboxController],
  providers: [
    {
      provide: 'DROPBOX',
      useFactory: async () => {
        return new Dropbox({
          clientId: process.env.DROPBOX_APP_KEY!,
          clientSecret: process.env.DROPBOX_APP_SECRET!,
          refreshToken: process.env.DROPBOX_REFRESH_TOKEN!, // <-- correcto
        });
      },
    },
    DropboxService
  ],
  exports: [DropboxService]
})
export class DropboxModule {}
