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
    const { email, password } = req.body;
    
    // Buscar el usuario por su email
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "Email o contraseña incorrectos",
      });
    }

    // Comparar la contraseña proporcionada
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({
        status: 401,
        message: "Email o contraseña incorrectos",
      });
    }

    // Crear token JWT si las credenciales son correctas
    const token = jwt.sign({ id: user._id }, process.env.SECRET, {
      expiresIn: 86400, // 24 horas
    });

    return res.status(200).json({
      token: token,
      message: "Inicio de sesión exitoso",
    });
  } catch (e) {
    console.error("Error en login:", e);
    return res.status(500).json({
      status: 500,
      message: "Error interno del servidor",
    });
  }
};

//obtener las notificaciones
exports.notificaciones = async function (req, res, next) {
  const userEmail=req.body.email;
  try {
    var user = await UserService.getUserByEmail(userEmail);
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