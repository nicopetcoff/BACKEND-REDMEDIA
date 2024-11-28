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
      {
        expiresIn: "1h",
      }
    );

    await UserService.actualizarResetToken(
      email,
      resetToken,
      Date.now() + 3600000
    );

    const resetLink = `https://redmedia.vercel.app/reset-password/${resetToken}`;
    const subject = "Restablecimiento de contraseña";
    const text = `
      <div style="font-family: Arial, sans-serif; text-align: center;">
        <h2 style="color: #333;">Restablecimiento de contraseña</h2>
        <p>Hola ${user.nombre},</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetLink}" style="display: inline-block; margin: 10px 0; padding: 10px 20px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
        <p>Este enlace expirará en una hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        <p>Saludos,<br>Equipo RedMedia</p>
      </div>
    `;

    await mailSender(email, subject, text);

    res.status(200).json({ message: "Se envió un correo de restablecimiento" });
  } catch (error) {
    console.error("Error al enviar correo:", error);
    res.status(500).json({ message: error.message });
  }
};

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
      console.error("Error al procesar la solicitud de cambio de contraseña:", error); // Log de error genérico
      res.status(500).json({ message: "Error al procesar la solicitud" });
    }
  }
};

module.exports = {
  sendMail,
  sendPasswordResetEmail,
  resetPassword,
};
