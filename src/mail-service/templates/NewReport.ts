// src/mail-service/templates/NewReport.ts
export async function NewReportMail(params: {
  Id: number;
  Location: string;
  Description?: string;
  UserFullName?: string;
  UserEmail?: string;
  CreatedAt: string; // legible
}) {
  const { Id, Location, Description, UserFullName, UserEmail, CreatedAt } = params;

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Reporte #${Id}</title>
  </head>
  <body style="margin:0; padding:16px; background:#ffffff; font-family: Arial, Helvetica, sans-serif; color:#111; line-height:1.45;">
    
    <!-- Título (simple) -->
    <h1 style="margin:0 0 8px 0; font-size:20px; font-weight:800; color:#7A0611;">
       Reporte de Emergencia #${Id}
    </h1>

    <!-- Detalles (tabla sin bordes externos) -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:14px; margin:0 0 16px 0;">
      <tbody>
        <tr>
          <td style="padding:8px 0; width:120px; vertical-align:top; color:#333; font-weight:700;">Ubicación:</td>
          <td style="padding:8px 0; color:#111;">${Location}</td>
        </tr>

        ${Description ? `
        <tr>
          <td style="padding:8px 0; width:120px; vertical-align:top; color:#333; font-weight:700;">Descripción:</td>
          <td style="padding:8px 0; color:#111;">${Description}</td>
        </tr>` : ''}

        ${(UserFullName || UserEmail) ? `
        <tr>
          <td style="padding:8px 0; width:120px; vertical-align:top; color:#333; font-weight:700;">Reportado por:</td>
          <td style="padding:8px 0; color:#111;">
            ${UserFullName ? `<div>${UserFullName}</div>` : ''}
            ${UserEmail ? `<div style="color:#555; font-size:13px;">${UserEmail}</div>` : ''}
          </td>
        </tr>` : ''}

        <tr>
          <td style="padding:8px 0; width:120px; vertical-align:top; color:#333; font-weight:700;">Fecha:</td>
          <td style="padding:8px 0; color:#111;">${CreatedAt}</td>
        </tr>
      </tbody>
    </table>

    <!-- Acción (aviso claro) -->
    <div style="background:#FFF1F2; border-left:4px solid #F6132D; padding:12px; font-size:13px; color:#7A0611; margin:0 0 16px 0;">
      <strong style="display:block; margin-bottom:4px;">Acción requerida</strong>
      Asigne un responsable y proceda con la revisión y mitigación.
    </div>

    <!-- Pie (muy simple) -->
    <p style="margin:12px 0 0 0; color:#777; font-size:12px;">
      Este mensaje fue generado automáticamente por el sistema de reportes. No responda a este correo.
    </p>

  </body>
  </html>`;
}
