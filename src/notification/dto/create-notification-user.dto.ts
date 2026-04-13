import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { TrimAndNullify } from "src/utils/validation.utils";

export class CreateNotificationUserDto {
    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty()
    @IsString()
    Subject: string;

    @ApiProperty()
    @TrimAndNullify()
    @IsNotEmpty()
    @IsString()
    Message: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    UserID: number;
}
