
    // src/common/utils/password.util.ts
    export function generateRandomPassword(
    length = 8,
    opts = { upper: true, lower: true, digits: true, symbols: true }
    ): string {
    const U = "ABCDEFGHJKLMNPQRSTUVWXYZ";      // sin O/I para evitar confusión
    const L = "abcdefghijkmnopqrstuvwxyz";     // sin l
    const D = "23456789";                      // sin 0/1
    const S = "!@#$%^&*()-_=+[]{};:,.?";
    let pool = "";
    if (opts.upper) pool += U;
    if (opts.lower) pool += L;
    if (opts.digits) pool += D;
    if (opts.symbols) pool += S;

    if (!pool) throw new Error("Password pool is empty");

    // garantizar al menos un char de cada tipo habilitado
    const required: string[] = [];
    if (opts.upper) required.push(U[Math.floor(Math.random() * U.length)]);
    if (opts.lower) required.push(L[Math.floor(Math.random() * L.length)]);
    if (opts.digits) required.push(D[Math.floor(Math.random() * D.length)]);
    if (opts.symbols) required.push(S[Math.floor(Math.random() * S.length)]);

    const remaining = Array.from({ length: Math.max(length - required.length, 0) })
        .map(() => pool[Math.floor(Math.random() * pool.length)]);

    // mezclar
    const chars = [...required, ...remaining];
    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join("");
    }
