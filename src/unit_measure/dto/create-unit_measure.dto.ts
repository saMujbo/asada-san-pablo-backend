import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { TrimAndNullify } from "src/utils/validation.utils";

export class CreateUnitMeasureDto {
    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty()
    @IsString()
    Name:string;
}
