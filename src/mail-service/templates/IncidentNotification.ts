export async function IncidentNotificationMail(params: {
  subject: string;
  message: string;
}) {
  const { subject, message } = params;
  const accentColor = '#111E56';

  return `<!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
  </head>
  <body style="margin:0; padding:24px; background:#f7f7f7; font-family:Arial, Helvetica, sans-serif; color:#111;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:640px; width:100%; margin:0 auto; background:#ffffff; border:3px solid ${accentColor}; border-radius:12px; overflow:hidden;">
      <tr>
        <td style="padding:24px 24px 8px; background:${accentColor}; color:#ffffff; border-bottom:3px solid ${accentColor};">
          <h1 style="margin:0; font-size:24px;">Notificacion de incidente</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <h2 style="margin:0 0 16px; font-size:20px; color:${accentColor};">${subject}</h2>
          <p style="margin:0; font-size:15px; line-height:1.6; white-space:pre-line;">${message}</p>
          <p style="margin:24px 0 0; font-size:12px; color:#666;">
            Este correo fue generado automaticamente por el sistema de notificaciones de ASADA San Pablo.
          </p>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}
