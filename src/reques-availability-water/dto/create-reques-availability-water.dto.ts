    import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

    export class CreateRequestAvailabilityWaterDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    Justification?: string;

    @ApiProperty()
    @IsArray()
    @IsString({ each: true })
    IdCardFiles: string[]; // original + copy

    @ApiProperty()
    @IsArray()
    @IsString({ each: true })
    PlanoPrintFiles: string[]; // original + copy

    @ApiProperty()
    @IsOptional()
    @IsString()
    LiteralCertificateFile?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    RequestLetterFile?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    ConstructionPermitFile?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    UserId: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    StateRequestId: number;
    }
