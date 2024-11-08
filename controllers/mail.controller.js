const { mailSender } = require("../services/nodemailer");
const UserService = require("../services/user.service");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");

const sendMail = async function (req, res) {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Falta el parámetro: to' });
    }

    const subject = 'Este es un mail de prueba';
    const text = 'Este es el contenido predeterminado de prueba del correo.';

    await mailSender(email, subject, text);
    return res.status(200).json({ message: 'Correo enviado con éxito' });    
  } catch (err) {
    return res.status(500).json({ message: 'Error al enviar el correo' });
  }
};

const sendPasswordResetEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ 
        status: 404,
        message: "Usuario no encontrado" 
      });
    }

    const defaultPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = bcrypt.hashSync(defaultPassword, 8);

    await User.findByIdAndUpdate(
      user._id,
      { password: hashedPassword },
      { new: true }
    );

    const subject = "Nueva Contraseña - RedMedia";
    const text = `
      Hola ${user.nombre},

      Se ha generado una nueva contraseña para tu cuenta:

      Tu nueva contraseña es: ${defaultPassword}

      Por favor, inicia sesión y cambia tu contraseña lo antes posible.

      Saludos,
      Equipo RedMedia
    `;

    await mailSender(email, subject, text);

    return res.status(200).json({
      status: 200,
      message: "Se ha enviado una nueva contraseña a tu email"
    });

  } catch (error) {
    console.error('Error en reset password:', error);
    return res.status(500).json({
      status: 500,
      message: "Error al procesar la solicitud"
    });
  }
};

const resetPassword = async (req, res) => {
  const email = req.body.email;
  const resetToken = req.body.resetToken;
  const newPassword = req.body.newPassword;

  try {
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 8);
    await UserService.actualizarContraseña(user._id, hashedPassword);

    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error en el controlador de reinicio de contraseña:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendMail,
  sendPasswordResetEmail,
  resetPassword
};