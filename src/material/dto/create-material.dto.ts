import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";


export class CreateMaterialDto {
        @ApiProperty()
        @IsString()
        Name:string;
}
