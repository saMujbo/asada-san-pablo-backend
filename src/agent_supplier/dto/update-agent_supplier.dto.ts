    import { ApiProperty} from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean } from 'class-validator';

    export class UpdateAgentSupplierDto {
    @ApiProperty({ example: 'Juan' })
    @IsString()
    @IsNotEmpty()
    Name: string;

    @ApiProperty({ example: 'Pérez' })
    @IsString()
    @IsNotEmpty()
    Surname1: string;

    @ApiProperty({ example: 'Gómez' })
    @IsString()
    @IsOptional()
    Surname2?: string;

    @ApiProperty({ example: 'juanperez@email.com' })
    @IsEmail()
    Email: string;

    @ApiProperty({ example: '+50688887777' })
    @IsString()
    PhoneNumber: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    IsActive: boolean;
    }
