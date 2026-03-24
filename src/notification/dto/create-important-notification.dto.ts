import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { TrimAndNullify } from "src/utils/validation.utils";

export class CreateImportantNotificationDto {
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
}
