import { IsOptional,IsBoolean, IsInt} from 'class-validator';

export class UpdateRequestChangeNameMeterDto{
        @IsOptional()
        @IsInt()
        StateRequestId: number;

        @IsOptional()
        @IsBoolean()
        CanComment?: boolean;
}
