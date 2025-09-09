    export async function WelcomeTempPasswordMail(
    Name: string,
    loginURL: string,
    tempPassword: string,
    ) {
    return `<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bienvenida - Credenciales de acceso</title>
        <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            width: 100%;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table {
            border-spacing: 0;
            border-collapse: collapse;
            width: 100%;
            margin: 0 auto;
        }
        .wrapper {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header,
        .main,
        .footer {
            padding: 20px;
            text-align: center;
        }
        h1, h2, p {
            margin: 0 0 10px;
            color: #000000;
            line-height: 1.5;
        }
        h1 {
            font-size: 24px;
            color: #091540;
        }
        h2 {
            font-size: 20px;
            color: #2c3e50;
        }
        p {
            font-size: 16px;
            color: #555555;
        }
        .password-box {
            background:#f3f4f6;
            border:1px solid #e5e7eb;
            border-radius:8px;
            padding:14px 16px;
            font-family:Consolas,Menlo,Monaco,monospace;
            font-size:16px;
            letter-spacing:0.5px;
            text-align:center;
            margin: 16px auto;
            max-width: 280px;
        }
        a {
            display: block;
            width: 220px;
            margin: 20px auto;
            padding: 15px;
            text-align: center;
            background-color: #091540;
            color: #ffffff !important;
            text-decoration: none;
            font-size: 18px;
            border-radius: 5px;
            transition: background-color 0.3s;
        }
        a:hover {
            background-color: #1789FC;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #aaaaaa;
        }
        </style>
    </head>
    <body>
        <table role="presentation" class="wrapper">
        <tr>
            <td>
            <div class="header">
                <h1>ASADA San Pablo</h1>
                <h2>¡Bienvenido a la plataforma!</h2>
            </div>
            <div class="main">
                <p>Estimado/a <strong>${Name}</strong>,</p>
                <p>
                Hemos creado tu cuenta con éxito. Para que pueda acceder al sistema,
                se generó la siguiente <b>contraseña temporal</b>:
                </p>
                <div class="password-box">
                ${tempPassword}
                </div>
                <p>
                Por seguridad, te pedimos que inicie sesión y <b>cambies esta contraseña temporal</b> lo antes posible.
                </p>
                <a href="${loginURL}">Iniciar Sesión</a>
            </div>
            <div class="footer">
                <p>
                © 2025 ASADA San Pablo, Nandayure. Todos los derechos reservados.
                </p>
            </div>
            </td>
        </tr>
        </table>
    </body>
    </html>`;
    }
