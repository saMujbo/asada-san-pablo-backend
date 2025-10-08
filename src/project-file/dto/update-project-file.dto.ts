import { PartialType } from '@nestjs/swagger';
import { CreateProjectFileDto } from './create-project-file.dto';

export class UpdateProjectFileDto extends PartialType(CreateProjectFileDto) {}
