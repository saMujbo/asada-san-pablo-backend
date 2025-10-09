import { ApiProperty, PartialType} from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateAgentSupplierDto } from './create-agent_supplier.dto';

export class UpdateAgentSupplierDto extends PartialType(CreateAgentSupplierDto){
    @ApiProperty({ example: true })
    @IsBoolean()
    @IsOptional()
    IsActive?: boolean;
}
