import { PartialType } from "@nestjs/mapped-types";
import { LoginAuthDto } from "./login-auth.dto";
import { IsArray, IsDate, IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

/**
 * Normaliza fechas a 'YYYY-MM-DD'
 * - Acepta 'YYYY-MM-DD' o cualquier string ISO ('YYYY-MM-DDTHH:mm:ss.sssZ')
 * - Si recibe Date, lo convierte igual
 */
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

export class RegisterAuth{ 
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    IDcard: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    Name: string;
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    Surname1: string;
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    Surname2: string;
    
    @ApiProperty()
    @IsOptional()
    @IsArray()
    Nis?: number[];
    
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    Email: string;
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
   // @Matches(/^[0-9]{8}$/, { message: 'PhoneNumber debe tener 8 dígitos numéricos' })
    PhoneNumber: string;
    
    @ApiProperty()
    @Transform(({ value }) => toDateOnly(value))
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'Birthdate debe ser YYYY-MM-DD',
    })
    Birthdate: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    Address: string;

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(12)
    Password: string;

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(12)
    ConfirmPassword: string;
}