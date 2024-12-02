const { mailSender } = require("../services/nodemailer");
const UserService = require("../services/user.service");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const jwt = require("jsonwebtoken");

const sendMail = async function (req, res) {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Falta el parámetro: to" });
    }

    const subject = "Este es un mail de prueba";
    const text = "Este es el contenido predeterminado de prueba del correo.";

    await mailSender(email, subject, text);
    return res.status(200).json({ message: "Correo enviado con éxito" });
  } catch (err) {
    return res.status(500).json({ message: "Error al enviar el correo" });
  }
};

const sendPasswordResetEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      throw { message: "E-mail incorrecto" };
    }

    const resetToken = jwt.sign(
      { id: user._id.toString() },
      process.env.SECRET,
      { expiresIn: "1h" }
    );

    await UserService.actualizarResetToken(
      email,
      resetToken,
      Date.now() + 3600000
    );

    const resetLink = `https://redmedia.vercel.app/reset-password/${resetToken}`;
    const subject = "Restablecimiento de contraseña";
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Restablecimiento de Contraseña</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #007BFF;
            color: #ffffff;
            text-align: center;
            padding: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 20px;
            line-height: 1.6;
            color: #333333;
          }
          .content p {
            margin: 10px 0;
          }
          .btn {
            display: inline-block;
            background-color: #007BFF;
            color: #ffffff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin-top: 20px;
            font-size: 16px;
          }
          .btn:hover {
            background-color: #0056b3;
          }
          .footer {
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #777777;
            background-color: #f4f4f4;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Restablecimiento de Contraseña</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${user.nombre}</strong>,</p>
            <p>Haz clic en el botón de abajo para restablecer tu contraseña:</p>
            <a href="${resetLink}" class="btn">Restablecer Contraseña</a>
            <p>Este enlace expirará en una hora. Si no solicitaste este cambio, puedes ignorar este correo.</p>
          </div>
          <div class="footer">
            <p>Este correo fue enviado desde Red Media App.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await mailSender(email, subject, html);

    res.status(200).json({ message: "Se envió un correo de restablecimiento" });
  } catch (error) {
    console.error("Error al enviar correo:", error);
    res.status(500).json({ message: error.message });
  }
};
<<<<<<< HEAD
// Controlador para restablecer la contraseña del usuario
=======
>>>>>>> 1fa05bbfad0ad4cc7b923d97ec0dd1993590826a

const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(resetToken, process.env.SECRET);

    const userId = decoded.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualizar la contraseña
    const hashedPassword = bcrypt.hashSync(newPassword, 8);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "El token ha expirado" });
    } else {
      console.error(
        "Error al procesar la solicitud de cambio de contraseña:",
        error
      ); // Log de error genérico
      res.status(500).json({ message: "Error al procesar la solicitud" });
    }
  }
};

module.exports = {
  sendMail,
  sendPasswordResetEmail,
  resetPassword,
};
