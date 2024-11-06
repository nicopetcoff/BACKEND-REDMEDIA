var UserService = require("../services/user.service");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { uploadImage } = require("../services/cloudinary"); // Asegúrate de importar la función
const admin = require("../firebaseAdmin"); 
const { mailSender } = require("../services/nodemailer");

_this = this;

// Controlador para registrar un nuevo usuario
exports.registerUser = async function (req, res, next) {
  console.log("Registrando usuario en backend con los siguientes datos:", req.body);

  const { email, password, name, lastName, nick } = req.body;

  try {
    // Verificar si el email ya está registrado en tu base de datos
    const emailExists = await UserService.verificarEmailExistente(email);
    console.log("¿Email existe en la base de datos?", emailExists);
    if (emailExists) {
      return res.status(400).json({
        status: 400,
        message: "El email ya está registrado",
      });
    }

    // Crear usuario en Firebase Authentication
    const firebaseUser = await admin.auth().createUser({
      email,
      password,
    });
    console.log("Usuario creado en Firebase con UID:", firebaseUser.uid);

    // Crear un nuevo usuario en la base de datos
    const newUser = {
      nombre: name,
      apellido: lastName,
      email,
      password,
      usernickname: nick,
    };

    const createdUser = await UserService.createUser(newUser);
    console.log("Usuario creado en la base de datos:", createdUser);

    // Generar token JWT para autenticar al usuario en el backend
    const token = jwt.sign({ id: createdUser._id }, process.env.SECRET, {
      expiresIn: 86400, // Expira en 24 horas
    });

    return res.status(201).json({
      token,
      message: "Usuario creado exitosamente",
      user: {
        id: createdUser._id,
        email: createdUser.email,
        nombre: createdUser.nombre,
        apellido: createdUser.apellido,
      },
    });
  } catch (e) {
    console.error("Error al crear el usuario:", e);
    return res.status(400).json({
      status: 400,
      message: "Error al crear el usuario",
      error: e.message,
    });
  }
};

exports.loginUser = async function (req, res, next) {
  try {
    // Log para ver el contenido completo del request
    console.log("Request recibido en loginUser:", req.body);

    // Intentar obtener y verificar el token de Firebase
    const firebaseToken = req.body.firebaseToken; // Asegúrate de que el nombre coincide con el frontend
    const email = req.body.email;

    // Log para confirmar la recepción del token y del email
    console.log("Token de Firebase recibido en el backend:", firebaseToken);
    console.log("Email recibido:", email);

    // Validar que el token de Firebase no esté vacío
    if (!firebaseToken) {
      return res.status(400).json({ status: 400, message: "Token de Firebase faltante" });
    }

    // Verificar el token de Firebase usando Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    console.log("Token de Firebase decodificado:", decodedToken);

    // Buscar el usuario por su email en la base de datos
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ status: 400, message: "El usuario no existe" });
    }

    // Crear un token JWT para autenticar al usuario en el backend
    const backendToken = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: 86400 });
    console.log("Token JWT del backend generado:", backendToken);

    // Enviar respuesta al frontend
    return res.status(200).json({
      token: backendToken,
      user: {
        id: user._id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
      },
    });
  } catch (error) {
    console.error("Error al verificar el token de Firebase:", error);
    return res.status(500).json({ message: "Error durante el inicio de sesión", error: error.message });
  }
};

//obtener las notificaciones

exports.notificaciones  =async function(req,res){
  try{
    const token=req.headers["x-access-token"];
    const decoded = jwt.verify(token, process.env.SECRET);
    const notificicaciones = await UserService.getUserNotificaciones(decoded.id);
    return notificicaciones.notificaciones
  }catch(e){
    throw Error("Error al obtener las notificaciones del usuario");
  }
}

exports.getUserData = async function (req, res) {
  try {
    // Obtiene el userId del token decodificado
    const userId = req.userId;

    // Busca el usuario en la base de datos
    const user = await UserService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "Usuario no encontrado",
      });
    }

    // Devuelve los datos del usuario, excluyendo la contraseña
    return res.status(200).json({
      status: 200,
      data: {
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        usernickname: user.usernickname,
        bio: user.bio,
        avatar: user.avatar,
        coverImage: user.coverImage,
      },
    });
  } catch (error) {
    console.error("Error al obtener los datos del usuario:", error);
    return res.status(500).json({
      status: 500,
      message: "Error al obtener los datos del usuario",
    });
  }
};



exports.updateProfileImage = async function (req, res) {
  try {
    const userId = req.userId; // Obtener el ID del usuario desde el token
    console.log("User ID:", userId); // Verifica que el ID del usuario sea correcto

    // Verificar si se ha enviado una imagen
    if (!req.file) {
      console.log("No se ha proporcionado ninguna imagen."); // Log para imagen no enviada
      return res.status(400).json({ message: "No se ha proporcionado ninguna imagen." });
    }

    console.log("Imagen recibida:", req.file); // Log para verificar la imagen recibida

    // Aquí llamas a la función para subir la imagen a Cloudinary y obtener la URL
    const imageUrl = await uploadImage(req.file.buffer);
    console.log("URL de la imagen subida a Cloudinary:", imageUrl); // Log para verificar la URL de la imagen

    // Actualiza el usuario en la base de datos
    await UserService.updateUserAvatar(userId, imageUrl); // Asegúrate de implementar esta función en UserService

    return res.status(200).json({
      status: 200,
      message: "Imagen de perfil actualizada correctamente.",
      imageUrl, // Retorna la URL de la imagen
    });
  } catch (error) {
    console.error("Error al actualizar la imagen de perfil:", error); // Log de error
    return res.status(500).json({ status: 500, message: "Error al actualizar la imagen de perfil." });
  }
};


// Controlador para enviar un enlace de restablecimiento de contraseña
exports.sendPasswordResetEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // Verificar si el correo electrónico existe en la base de datos de usuarios
    const emailExists = await UserService.verificarEmailExistente(email);
    if (!emailExists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Generar el enlace de restablecimiento de contraseña usando Firebase
    const auth = admin.auth();
    const resetLink = await auth.generatePasswordResetLink(email);

    // Configuración del correo
    const subject = "Recuperación de Contraseña";
    const text = `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetLink}`;

    // Enviar el correo electrónico con el enlace de Firebase
    await mailSender(email, subject, text);

    res.json({ message: "Correo electrónico enviado con éxito", link: resetLink });
  } catch (error) {
    console.error("Error en el controlador de correo:", error);
    res.status(500).json({ error: error.message });
  }
};