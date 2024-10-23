var UserService = require("../services/user.service");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

_this = this;

// Controlador para registrar un nuevo usuario
exports.registerUser = async function (req, res, next) {

  console.log("Registrando usuario");
  console.log(req.body);
  try {
    // Verificar si el email ya está registrado
    const emailExists = await UserService.verificarEmailExistente(req.body.email);
    if (emailExists) {
      return res.status(400).json({
        status: 400,
        message: "El email ya está registrado",
      });
    }

    // Hash de la contraseña antes de guardar
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);

    // Crear un nuevo usuario
    var newUser = {
      nombre: req.body.name,
      apellido: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      usernickname: req.body.nick, // Guardar el usernickname
    };

    // Guardar el usuario en la base de datos
    var createdUser = await UserService.createUser(newUser);

    // Crear un token JWT para autenticar al usuario recién creado
    var token = jwt.sign({ id: createdUser._id }, process.env.SECRET, {
      expiresIn: 86400, // 24 horas
    });

    return res.status(201).json({
      token: token,
      message: "Usuario creado exitosamente",
    });
  } catch (e) {
    return res.status(400).json({
      status: 400,
      message: "Error al crear el usuario",
    });
  }
};

exports.loginUser = async function (req, res, next) {
  try {
    // Buscar el usuario por su email
    var user = await UserService.getUserByEmail(req.body.email);

    console.log("Llega esto", req.body);

    if (!user) {
      return res.status(400).json({
        status: 400,
        message: "El usuario no existe",
      });
    }

    // Comparar la contraseña proporcionada con la almacenada
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(400).json({
        status: 400,
        message: "Contraseña incorrecta",
      });
    }

    // Si la contraseña es correcta, crear el token JWT
    var token = jwt.sign({ id: user._id }, process.env.SECRET, {
      expiresIn: 86400, // Expira en 24 horas
    });

    return res.status(200).json({
      token: token,
      message: "Inicio de sesión exitoso",
    });
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Error al iniciar sesión",
    });
  }
};

//obtener las notificaciones
exports.notificaciones = async function (req, res, next) {
  try {
    console.log("Obteniendo notificaciones");
    const userToken=req.params;
    const user = await UserService.getUserByToken(userToken);
    if (!user) {
      return res.status(400).json({
        status: 400,
        message: "El usuario no existe",
      });
    }
    return res.status(200).json({
      status: 200,
      data: user.notificaciones,
    });
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Error al obtener las notificaciones",
    });
  }
}