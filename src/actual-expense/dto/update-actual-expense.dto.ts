import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateActualExpenseDto } from './create-actual-expense.dto';
import { Matches, IsString, IsBoolean, IsOptional } from 'class-validator';
import { toDateOnly } from 'src/utils/ToDateOnly';
import { Transform } from 'class-transformer';


export class UpdateActualExpenseDto {
    
        @ApiProperty()
        @Transform(({ value }) => toDateOnly(value))
        @Matches(/^\d{4}-\d{2}-\d{2}$/, {
            message: 'date debe ser YYYY-MM-DD',
        })
        Date: string;
    
        @ApiProperty()
        @IsString() 
        Observation: string;

        @ApiProperty()
        @IsBoolean()
        @IsOptional()
        IsActive?: boolean;
}
