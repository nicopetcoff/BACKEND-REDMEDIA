const { mailSender } = require("../services/nodemailer");
const crypto = require("crypto");
const UserService = require("../services/user.service");

const sendMail = async function (req, res, next) {
  const { email } = req.body;

  try {
    // Valida que el destinatario esté presente
    if (!email) {
      return res.status(400).json({ message: 'Falta el parámetro: to' });
    }

    // Mensaje de asunto y texto predeterminado
    const subject = 'Este es un mail de prueba';
    const text = 'Este es el contenido predeterminado de prueba del correo.';

    // Llamada al servicio de mailSender
    await mailSender(email, subject, text);

    // Respuesta de éxito
    return res.status(200).json({ message: 'Correo enviado con éxito' });    
  } catch (err) {
    console.error('Error al enviar el correo:', err);
    return res.status(500).json({ message: 'Error al enviar el correo' });
  }
};

// Controlador para enviar un correo electrónico de restablecimiento de contraseña
const sendPasswordResetEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // Verificar si el correo electrónico existe en la base de datos de usuarios
    const emailExists = await UserService.verificarEmailExistente(email);
    if (!emailExists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Generar token y establecer su fecha de expiración
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpires = Date.now() + 15 * 60 * 1000; // 15 minutos

    // Almacenar token en la base de datos o memoria (en este caso, actualizando el usuario)
    await UserService.actualizarResetToken(email, resetToken, resetTokenExpires);

    // Cambia "localhost" por la dirección IP de tu máquina o un dominio accesible
    const frontendUrl = "192.168.1.100:3000"; // Reemplaza con la dirección IP de tu máquina

    // Integrar el contenido existente del servicio de correo
    const subject = "Recuperación de Contraseña";
    const text = `Haz clic en el siguiente enlace para restablecer tu contraseña: ${frontendUrl}/reset-password/${resetToken}`;

    // Enviar el correo electrónico
    await mailSender(email, subject, text);

    res.json({ message: "Correo electrónico enviado con éxito" });
  } catch (error) {
    console.error("Error en el controlador de correo:", error);
    res.status(500).json({ error: error.message });
  }
};

// Controlador para restablecer la contraseña del usuario

const resetPassword = async (req, res) => {
  const email = req.body.email;
  const resetToken = req.body.resetToken;
  const newPassword = req.body.newPassword;
  console.log(email);

  try {
    // Buscar el usuario por correo electrónico
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Validar si el token de reinicio coincide con el usuario
    if (user.resetToken !== resetToken) {
      return res
        .status(400)
        .json({ error: "Token de reinicio inválido o expirado" });
    }

    // Actualizar la contraseña del usuario
    await UserService.actualizarContraseña(user._id, newPassword);

    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error en el controlador de reinicio de contraseña:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendMail,
  sendPasswordResetEmail,
  resetPassword,
};
