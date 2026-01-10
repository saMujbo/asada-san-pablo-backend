/**
 * Valida si el valor no es null ni undefined.
 */
export function isDefined<T>(value: T | null | undefined): value is T {
    return value !== undefined && value !== null;
}

/**
 * Valida si un string no es vacío ni solo espacios.
 */
export function hasNonEmptyString(value?: string | null): boolean {
    return isDefined(value) && typeof value === 'string' && value.trim().length > 0;
}

/**
 * Valida si un valor es una fecha válida.
 * Acepta tanto objetos Date como strings convertibles a Date.
 */
export function isValidDate(value?: Date | string | null): boolean {
    if (!isDefined(value)) return false;

    const date = value instanceof Date ? value : new Date(value);
    return !isNaN(date.getTime());
}

import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { Transform } from 'class-transformer';

/**
Transforma el valor haciendo trim() y convierte strings vacíos en undefined
Esto asegura que @IsOptional() + @IsNotEmpty() funcionen correctamente*/

export function TrimAndNullify() {
    return Transform(({ value }) => {
        if (typeof value !== 'string') {
            return value;
        }
        const trimmed = value.trim();
        // Convertir string vacío a undefined para que @IsOptional funcione bien
        return trimmed.length === 0 ? undefined : trimmed;
    });
}

/**
Helper para aplicar solo campos definidos (ignora undefined)*/

export function applyDefinedFields<T>(target: T, source: Partial<T>): void {
    Object.keys(source).forEach(key => {
        const value = source[key as keyof T];
        if (value !== undefined) {
            target[key as keyof T] = value;
        }
    });
}