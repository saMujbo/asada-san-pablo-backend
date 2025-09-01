
import { IsDateString,IsNotEmpty,IsOptional, IsString, Length, Matches} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

function toDateOnly(input: unknown): string {
  if (!input) return input as any;
  const val = String(input).trim();

  // Caso 1: ya viene como 'YYYY-MM-DD'
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;

  // Caso 2: viene ISO u otro formato parseable por Date
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return val; // dejar que el validador falle

  // Formatear localmente a YYYY-MM-DD en UTC
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export class UpdateUserDto{

        @ApiProperty()
        @IsOptional() @IsString() @Length(1, 255)
        ProfilePhoto?: string; 

        @Transform(({ value }) => toDateOnly(value))
        @Matches(/^\d{4}-\d{2}-\d{2}$/, {
                message: 'Birthdate debe ser YYYY-MM-DD',
        })
        @IsOptional()
        Birthdate?: string;

        @ApiProperty()
        @IsOptional()
        @IsString()
        PhoneNumber?: string;

        @ApiProperty()
        @IsString()
        Address?: string;
}
