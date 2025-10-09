import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateStateRequestDto {

        @ApiProperty(({ example: 'PENDIENTE' }))
        @IsString()
        @IsNotEmpty()
        Name:string;

        @ApiProperty()
        @IsString()
        @IsNotEmpty()
        Description: string;

        @ApiProperty()
        @Type(() => Number)
        @IsInt()
        StateRequestId: number;

}
