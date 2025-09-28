    import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

    export class UpdateRequestAvailabilityWaterDto {
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
    }