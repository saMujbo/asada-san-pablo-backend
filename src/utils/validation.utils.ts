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
