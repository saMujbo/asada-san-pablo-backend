import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateProductDto {
@ApiProperty()
@IsString()
Name:string;

@ApiProperty()
@IsString()
Type:string;

@ApiProperty()
@IsString()
Observation:string;

}
