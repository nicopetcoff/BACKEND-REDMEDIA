var UserService = require("../services/user.service");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { uploadImage } = require("../services/cloudinary");

_this = this;

exports.registerUser = async function (req, res, next) {
  try {
    const emailExists = await UserService.verificarEmailExistente(req.body.email);
    if (emailExists) {
      throw({message: "El email ya está registrado"})
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 8);

    var newUser = {
      nombre: req.body.name,
      apellido: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      usernickname: req.body.nick,
    };

    var createdUser = await UserService.createUser(newUser);
    var token = jwt.sign({ id: createdUser._id }, process.env.SECRET); // Sin expiración

    return res.status(201).json({
      token: token,
      message: "Usuario creado exitosamente",
    });
  } catch (e) {
    return res.status(400).json({
      status: 400,
      message: e.message,
    });
  }
};

exports.loginUser = async function (req, res, next) {
  try {
    var user = await UserService.getUserByEmail(req.body.email);

    if (!user) {
      throw({message: "El usuario no existe"})
    }

    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
     throw({message:"Contraseña incorrecta"});
    }

    var token = jwt.sign({ id: user._id }, process.env.SECRET); // Sin expiración

    return res.status(200).json({
      token: token,
      message: "Inicio de sesión exitoso",
    });
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: e.message,
    });
  }
};

// El resto del código permanece igual...
exports.notificaciones = async function(req, res) {
  try {
    const token = req.headers["x-access-token"];
    const decoded = jwt.verify(token, process.env.SECRET);
    const notificicaciones = await UserService.getUserNotificaciones(decoded.id);
    return notificicaciones.notificaciones;
  } catch(e) {
    throw Error("Error al obtener las notificaciones del usuario");
  }
};

exports.getUserData = async function (req, res) {
  try {
    const userId = req.userId;
    const user = await UserService.getUserById(userId);

    if (!user) {
      throw({ message: "Usuario no encontrado"})
    }

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
    return res.status(500).json({
      status: 500,
      message: e.message,
    });
  }
};

exports.updateProfileImage = async function (req, res) {
  try {
    const userId = req.userId;

    if (!req.file) {
      throw({message: "No se ha proporcionado ninguna imagen."})
    }

    const imageUrl = await uploadImage(req.file.buffer);
    await UserService.updateUserAvatar(userId, imageUrl);

    return res.status(200).json({
      status: 200,
      message: "Imagen de perfil actualizada correctamente.",
      imageUrl,
    });
  } catch (error) {
    return res.status(500).json({ 
      status: 500, 
      message:e.message
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    

    const users = await UserService.getUsers();
    

    return res.status(200).json({
      status: 200,
      data: users,
      message: 'Usuarios obtenidos exitosamente',
    });
  } catch (error) {
    console.error('Error en getUsers controller:', error);
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};