    import { ApiProperty } from "@nestjs/swagger";
    import { IsOptional, IsString, IsArray, IsBoolean, IsInt, IsPositive, IsNotEmpty } from "class-validator";
import { TrimAndNullify } from "src/utils/validation.utils";

    export class CreateRequestChangeNameMeterDto {
    
    @ApiProperty()
    @IsOptional()
    @IsString()
    @TrimAndNullify()
    Justification?: string;

    // FK requeridas
    @ApiProperty()
    @IsInt()
    @IsOptional()
    UserId: number;

}
