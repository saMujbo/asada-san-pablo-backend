import { PartialType } from '@nestjs/swagger';
import { CreateDropboxDto } from './create-dropbox.dto';

export class UpdateDropboxDto extends PartialType(CreateDropboxDto) {}
