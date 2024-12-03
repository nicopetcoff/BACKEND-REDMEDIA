var User = require("../models/User.model");

const PostsService = require("./posts.service"); // Importar PostsService

_this = this;

// Crear un nuevo usuario
exports.createUser = async function (userData) {
  try {
    var newUser = new User(userData);
    var savedUser = await newUser.save();
    return savedUser;
  } catch (e) {
    throw "Error al crear el usuario";
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

//verificar id de usuario
exports.verificarIdExistente = async function (userData) {
  try {
    var existingUser = await User.findOne({ email: userData.email });
    return existingUser.userId === userData.userId;
  } catch (e) {
    throw Error("Error al loguearse");
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

exports.getUserNotificaciones = async function (userId) {
  try {
    const notificicaciones = await User.findById(userId).select(
      "notificaciones"
    );
    return notificicaciones;
  } catch (e) {
    throw Error("Error al obtener las notificaciones del usuario");
  }
};

exports.actualizarResetToken = async function (
  email,
  resetToken,
  resetTokenExpires
) {
  try {
    // Actualizar el usuario con el nuevo token y su expiración
    const updatedUser = await User.findOneAndUpdate(
      { email: email }, // Buscar el usuario por email
      {
        resetToken: resetToken, // Establecer el nuevo token
        resetTokenExpires: resetTokenExpires, // Establecer la nueva fecha de expiración
      },
      { new: true } // Retornar el documento actualizado
    );

    if (!updatedUser) {
      throw new Error("Usuario no encontrado");
    }

    return updatedUser; // Retornar el usuario actualizado
  } catch (error) {
    throw new Error(
      "Error al actualizar el token de restablecimiento: " + error.message
    );
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

exports.getUsers = async () => {
  try {
    const users = await User.find(
      {},
      {
        password: 0,
        resetToken: 0,
        resetTokenExpires: 0,
      }
    ).lean();

    return users;
  } catch (error) {
    console.error("Error en getUsers service:", error);
    throw new Error("Error al obtener los usuarios");
  }
};

exports.updateUserAttributes = async function (userId, updateData) {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new Error("Usuario no encontrado");
    }

    return updatedUser;
  } catch (error) {
    throw new Error("Error al actualizar el usuario: " + error.message);
  }
};

exports.addFollow = async (userId, targetUserId) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { following: targetUserId } }, // Evita duplicados
      { new: true }
    );

    await User.findByIdAndUpdate(
      targetUserId,
      { $addToSet: { followers: userId } },
      { new: true }
    );

    return user;
  } catch (error) {
    throw new Error("Error al seguir al usuario: " + error.message);
  }
};

exports.removeFollow = async (userId, targetUserId) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { following: targetUserId } }, // Remueve el ID de la lista
      { new: true }
    );

    await User.findByIdAndUpdate(
      targetUserId,
      { $pull: { followers: userId } },
      { new: true }
    );

    return user;
  } catch (error) {
    throw new Error("Error al dejar de seguir al usuario: " + error.message);
  }
};

exports.searchUsers = async (query) => {
  try {
    const users = await User.find(
      {
        $or: [
          { nombre: { $regex: query, $options: "i" } },
          { apellido: { $regex: query, $options: "i" } },
          { usernickname: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
      },
      {
        password: 0, // Excluye la contraseña de los resultados
        resetToken: 0,
        resetTokenExpires: 0,
      }
    ).lean();

    return users;
  } catch (error) {
    console.error("Error en searchUsers (service):", error);
    throw new Error("Error al realizar la búsqueda de usuarios");
  }
};

exports.confirmUser = async function (userId) {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isConfirmed: true },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("Usuario no encontrado");
    }

    return updatedUser;
  } catch (error) {
    throw new Error("Error al confirmar el usuario: " + error.message);
  }
};
exports.deleteUser = async (userId) => {
  try {
    await User.findByIdAndDelete(userId); // Usar Mongoose para eliminar el usuario por ID
  } catch (error) {
    throw new Error("Error al eliminar el usuario: " + error.message);
  }
};

// Método para obtener los posts favoritos de un usuario
exports.getFavoritePosts = async function (userId) {
  try {
    // Buscar al usuario por su ID y poblar el campo favoritePosts con los detalles completos de los posts
    const user = await User.findById(userId).populate("favoritePosts");

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Devolver los posts favoritos
    return user.favoritePosts;
  } catch (error) {
    console.error("Error al obtener los posts favoritos:", error);
    throw new Error("Error al obtener los posts favoritos");
  }
};

// Dentro del servicio de usuarios (UserService)

exports.calculateUserLevel = async function (usernickname) {
  try {
    // Obtener la cantidad de posts y comentarios del usuario
    const { postCount, commentCount } =
      await PostsService.getUserPostsAndCommentsCount(usernickname);

    // Inicializar el nivel
    let level = 1;

    // Calcular el nivel según los criterios
    if (postCount >= 4 && commentCount >= 4) {
      level = 4; // Nivel 4: 4 posts y 4 comentarios
    } else if (postCount >= 4) {
      level = 3; // Nivel 3: 4 posts
    } else if (postCount >= 2) {
      level = 2; // Nivel 2: 2 posts
    }

    // Actualizar el nivel del usuario en la base de datos
    const user = await User.findOne({ usernickname: usernickname });
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Guardar el nivel calculado
    user.level = level;
    await user.save();

    return level; // Retornar el nivel calculado
  } catch (error) {
    console.error("Error calculando el nivel del usuario:", error);
    throw new Error("Error al calcular el nivel del usuario");
  }
};

exports.getUserByNickname = async function (usernickname) {
  try {
    // Busca el usuario por nickname, sin importar mayúsculas/minúsculas
    const user = await User.findOne({
      usernickname: { $regex: new RegExp("^" + usernickname + "$", "i") },
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    return user;
  } catch (error) {
    console.error("Error en getUserByNickname:", error);
    throw new Error("Error al obtener el usuario");
  }
};
