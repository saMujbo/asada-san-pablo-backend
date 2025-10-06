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
        const opts: any = { accessToken: process.env.DROPBOX_ACCESS_TOKEN };
        return new Dropbox(opts);
      },
    },
    DropboxService
  ],
  exports: [DropboxService]
})
export class DropboxModule {}
