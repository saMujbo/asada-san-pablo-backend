import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialAsignadoDto } from './create-material-asignado.dto';

export class UpdateMaterialAsignadoDto extends PartialType(CreateMaterialAsignadoDto) {}
