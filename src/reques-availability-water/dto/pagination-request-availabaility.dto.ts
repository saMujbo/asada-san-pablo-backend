import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt, Min, Max, IsOptional, IsString } from "class-validator";



export class RequestAvailabilityWaterPagination{
        @ApiPropertyOptional({ default: 1, minimum: 1 })
        @Transform(({ value }) => Number(value))
        @IsInt()
        @Min(1)
        page: number = 1;
        
        @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
        @Transform(({ value }) => Number(value))
        @IsInt()
        @Min(1)
        @Max(100)
        limit: number = 10;
        
        @ApiPropertyOptional({description: 'Filtro por nombre de encargado'})
        @IsOptional()
        @IsInt()
        UserId?: number;

        @ApiPropertyOptional({description: 'Filtro por estado de proyecto'})
        @IsOptional()
        @IsInt()
        StateRequestId?: number;

        @ApiPropertyOptional({description: 'Filtro por estado (true o false)'})
        @IsOptional()
        @IsString()
        State?: string;
}