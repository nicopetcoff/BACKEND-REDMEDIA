var User = require("../models/user.model"); // Importar el modelo de usuario

_this = this;

// Crear un nuevo usuario
exports.createUser = async function (userData) {
  try {
    var newUser = new User(userData);
    var savedUser = await newUser.save();
    return savedUser;
  } catch (e) {
    throw Error("Error al crear el usuario");
  }
};

// Verificar si el email ya existe
exports.verificarEmailExistente = async function (email) {
  try {
    var existingUser = await User.findOne({ email: email });
    return existingUser !== null;
  } catch (e) {
    throw Error("Error al verificar el email");
  }
};

exports.getUserByEmail = async function (email) {
  try {
    var user = await User.findOne({ email: email });
    return user;
  } catch (e) {
    throw Error("Error al buscar el usuario por email");
  }
};