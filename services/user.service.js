var User = require("../models/User.model"); 

_this = this;

// Crear un nuevo usuario
exports.createUser = async function (userData) {
  try {
    var newUser = new User(userData);
    var savedUser = await newUser.save();
    return savedUser;
  } catch (e) {
    throw ("Error al crear el usuario");
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

exports.verificarNickExistente = async function (nick) {
  try {
    var existingNick = await User.findOne({ usernickname: nick });
    return existingNick !== null;
  } catch (e) {
    throw Error("Error al verificar el nickname");
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

exports.getUserNotificaciones= async function(userId){
  try{
    const notificicaciones = await User.findById(userId).select('notificaciones');
    return notificicaciones
  }catch(e){
    throw Error("Error al obtener las notificaciones del usuario");
  }
}

exports.actualizarResetToken = async function (email, resetToken, resetTokenExpires) {
  try {
    // Actualizar el usuario con el nuevo token y su expiración
    const updatedUser = await User.findOneAndUpdate(
      { email: email }, // Buscar el usuario por email
      {
        resetToken: resetToken, // Establecer el nuevo token
        resetTokenExpires: resetTokenExpires // Establecer la nueva fecha de expiración
      },
      { new: true } // Retornar el documento actualizado
    );

    if (!updatedUser) {
      throw new Error("Usuario no encontrado");
    }

    return updatedUser; // Retornar el usuario actualizado
  } catch (error) {
    throw new Error("Error al actualizar el token de restablecimiento: " + error.message);
  }
};

exports.getUserById = async function (userId) {
  try {
    var user = await User.findById(userId); // Usar Mongoose para buscar el usuario por ID
    return user;
  } catch (e) {
    throw new Error("Error al obtener el usuario por ID: " + e.message);
  }
};


exports.updateUserAvatar = async function (userId, imageUrl) {
  try {
    // Actualiza el campo de avatar en la base de datos
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: imageUrl }, // Asegúrate de que el campo en tu modelo se llame 'avatar'
      { new: true } // Retorna el documento actualizado
    );

    if (!updatedUser) {
      throw new Error("Usuario no encontrado");
    }

    return updatedUser; // Retorna el usuario actualizado
  } catch (error) {
    throw new Error("Error al actualizar el avatar: " + error.message);
  }
};
