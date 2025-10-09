    export async function WelcomeMailASADA(
    Name: string,
    loginURL: string,

    ) {
    return `<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bienvenida - Registro Exitoso</title>
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
        img {
            border: 0;
            line-height: 100%;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
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
        h1,
        h2,
        p {
            font-family: "Times New Roman", Times, serif;
            margin: 0 0 10px;
            color: #000000;
            line-height: 1.5;
        }
        h1 {
            font-size: 24px;
        }
        h2 {
            font-size: 20px;
            color: #2c3e50;
        }
        p {
            font-size: 16px;
            color: #555555;
        }
        a {
            display: block;
            width: 220px;
            margin: 20px auto;
            padding: 15px;
            text-align: center;
            background-color: #091540;
            color: #ffffff;
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
                <img
                src="cid:logoImage"
                alt="Logo"
                style="max-width: 100px; height: auto"
                />
                <h2>¡Bienvenido a RedSanPablo!</h2>
            </div>
            <div class="main">
                <p>Estimado/a <strong>${Name}</strong>,</p>
                <p>
                Nos complace darle la bienvenida a la plataforma de <b>ASADA San Pablo</b>. 
                Su registro se ha completado con éxito y ya puede acceder a todos nuestros servicios en línea.
                </p>
                <p>
                Para comenzar a usar su cuenta, haga clic en el botón a continuación:
                </p>
                <a href="${loginURL}" style="background-color:#091540; color:#ffffff !important;" >
                    Iniciar Sesión
                </a>
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
