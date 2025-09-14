import { PartialType } from '@nestjs/swagger';
import { CreateProjectStateDto } from './create-project-state.dto';

export class UpdateProjectStateDto extends PartialType(CreateProjectStateDto) {}
