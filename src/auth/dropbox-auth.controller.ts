// src/auth/dropbox-auth.controller.ts
import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import * as crypto from 'crypto';

const SCOPES = [
    'files.metadata.read',
    'files.content.read',
    'files.content.write',
    'sharing.write'
];

@Controller('auth/dropbox')
export class DropboxAuthController {
  /** Muestra la URL (para inspección rápida) */
    @Get('url')
    showUrl(@Res() res: Response) {
        const url = buildAuthUrl();
        res.send(`<a href="${url}">${url}</a>`);
    }

    /** Redirige a Dropbox para aprobar la app */
    @Get()
    start(@Res() res: Response) {
        res.redirect(buildAuthUrl());
    }

    /** Callback: canjea el code por tokens (HTTP directo) */
    @Get('callback')
    async callback(@Query('code') code: string, @Res() res: Response) {
        if (!code) {
        return res.status(400).send('Falta ?code en la URL');
        }

        // Intercambio del "code" por access_token + refresh_token
        const body = new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.DROPBOX_REDIRECT_URI!,  // Debe coincidir EXACTO con el configurado en Dropbox
        client_id: process.env.DROPBOX_APP_KEY!,
        client_secret: process.env.DROPBOX_APP_SECRET!,
        });

        const r = await fetch('https://api.dropboxapi.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        });

        const tokens = await r.json() as any;
        console.log('TOKENS (raw):', tokens);

        if (!r.ok) {
        // Muestra error para depurar (p.ej. invalid_grant si el code expiró o se usó 2 veces)
        return res
            .status(500)
            .send(`<pre>Falló el canje de tokens:\n${JSON.stringify(tokens, null, 2)}</pre>`);
        }

        // Aquí lo importante: ¡el refresh_token!
        const refresh = tokens.refresh_token;

        res.send(`
        <h2>Dropbox conectado ✅</h2>
        <p>Copia este <b>refresh_token</b> y guárdalo en tu almacén seguro (.env mientras tanto):</p>
        <pre>${refresh ?? '(no vino refresh_token — revisa token_access_type=offline y vuelve a aprobar la app)'}</pre>
        <p>JSON completo devuelto por Dropbox:</p>
        <pre>${escapeHtml(JSON.stringify(tokens, null, 2))}</pre>
        `);
    }
}

/** Construye la URL con offline + force_reapprove */
function buildAuthUrl() {
    const clientId = process.env.DROPBOX_APP_KEY!;
    const redirectUri = process.env.DROPBOX_REDIRECT_URI!; // ej: http://localhost:3000/auth/dropbox/callback
    const state = crypto.randomUUID();

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        token_access_type: 'offline',   // 🔑 para obtener refresh_token
        force_reapprove: 'true',        // 🔁 fuerza pantalla y nuevo grant
        redirect_uri: redirectUri,
        state,
        scope: SCOPES.join(' '),        // scopes de archivos
    });

    return `https://www.dropbox.com/oauth2/authorize?${params.toString()}`;
}

/** Minimísimo para evitar problemas con caracteres especiales en el HTML del response */
function escapeHtml(s: string) {
    return s.replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]!));
}
