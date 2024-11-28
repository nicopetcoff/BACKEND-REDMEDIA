var UserService = require("../services/user.service");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { uploadImage } = require("../services/cloudinary");
const { mailSender } = require("../services/nodemailer");

_this = this;

exports.registerUser = async function (req, res, next) {
  try {
    const emailExists = await UserService.verificarEmailExistente(
      req.body.email
    );
    const nickExists = await UserService.verificarNickExistente(req.body.nick);

    if (emailExists) {
      throw { message: "El email ya está registrado" };
    }
    if (nickExists) {
      throw { message: "El nickname ya está registrado" };
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 8);

    const newUser = {
      nombre: req.body.name,
      apellido: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      usernickname: req.body.nick,
      avatar:
        "https://res.cloudinary.com/docrp6wwd/image/upload/v1731610184/zduipyxpgoae9zg9rg8x.jpg",
      coverImage:
        "https://res.cloudinary.com/docrp6wwd/image/upload/v1731610184/ixvdicibshjrrrmo2rku.jpg",
      isConfirmed: false, // Nuevo campo para confirmar el usuario
    };

    const createdUser = await UserService.createUser(newUser);

    // Generar el token de confirmación
    const confirmToken = jwt.sign(
      { id: createdUser._id },
      process.env.SECRET,
      { expiresIn: "24h" } // El token expira en 24 horas
    );

    // Crear el enlace de confirmación
    const confirmLink = `https://redmedia.vercel.app/confirm-user/${confirmToken}`;

    // Enviar correo de confirmación
    const subject = "Confirma tu cuenta - RedMedia";
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirma tu Cuenta</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #4CAF50;
            color: #ffffff;
            text-align: center;
            padding: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 20px;
            line-height: 1.6;
            color: #333333;
          }
          .content p {
            margin: 10px 0;
          }
          .btn {
            display: inline-block;
            background-color: #4CAF50;
            color: #ffffff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin-top: 20px;
            font-size: 16px;
          }
          .btn:hover {
            background-color: #45a049;
          }
          .footer {
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #777777;
            background-color: #f4f4f4;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Red Media</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${createdUser.nombre}</strong>,</p>
            <p>Gracias por registrarte en <strong>Red Media</strong>. Por favor, confirma tu cuenta haciendo clic en el botón de abajo:</p>
            <a href="${confirmLink}" class="btn">Confirmar Cuenta</a>
            <p>Si no solicitaste esta cuenta, puedes ignorar este correo.</p>
            <p>Este enlace expirará en 24 horas.</p>
          </div>
          <div class="footer">
            <p>Este correo fue enviado desde Red Media App.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Usa el HTML en lugar del texto plano
    await mailSender(createdUser.email, subject, html);

    res.status(201).json({
      message:
        "Usuario creado exitosamente. Revisa tu correo para confirmar tu cuenta.",
    });
  } catch (e) {
    res.status(400).json({
      status: 400,
      message: e.message,
    });
  }
};

exports.loginUser = async function (req, res, next) {
  try {
    const user = await UserService.getUserByEmail(req.body.email);

    if (!user) {
      return res.status(404).json({ message: "El usuario no existe" });
    }

    // Verificar si el usuario ha confirmado su cuenta
    if (!user.isConfirmed) {
      // Generar un nuevo token de confirmación
      const confirmToken = jwt.sign(
        { id: user._id },
        process.env.SECRET,
        { expiresIn: "24h" } // El token expira en 24 horas
      );

      // Crear un nuevo enlace de confirmación
      const confirmLink = `https://redmedia.vercel.app/confirm-user/${confirmToken}`;

      // Enviar correo de confirmación
      const subject = "Confirma tu cuenta - RedMedia";
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirma tu Cuenta</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
              background-color: #4CAF50;
              color: #ffffff;
              text-align: center;
              padding: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 20px;
              line-height: 1.6;
              color: #333333;
            }
            .content p {
              margin: 10px 0;
            }
            .btn {
              display: inline-block;
              background-color: #4CAF50;
              color: #ffffff;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 5px;
              margin-top: 20px;
              font-size: 16px;
            }
            .btn:hover {
              background-color: #45a049;
            }
            .footer {
              text-align: center;
              padding: 10px;
              font-size: 12px;
              color: #777777;
              background-color: #f4f4f4;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Red Media</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${user.nombre}</strong>,</p>
              <p>Por favor, confirma tu cuenta haciendo clic en el botón de abajo:</p>
              <a href="${confirmLink}" class="btn">Confirmar Cuenta</a>
              <p>Si no solicitaste esta cuenta, puedes ignorar este correo.</p>
              <p>Este enlace expirará en 24 horas.</p>
            </div>
            <div class="footer">
              <p>Este correo fue enviado desde Red Media App.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Reenviar el correo
      await mailSender(user.email, subject, html);

      return res.status(403).json({
        message:
          "Debes confirmar tu cuenta antes de iniciar sesión. Hemos reenviado el correo de confirmación.",
      });
    }

    // Verificar si la contraseña es válida
    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Generar un token para el usuario
    const token = jwt.sign({ id: user._id }, process.env.SECRET);

    return res.status(200).json({
      token: token,
      message: "Inicio de sesión exitoso",
    });
  } catch (error) {
    console.error("Error en loginUser:", error);
    return res.status(500).json({
      status: 500,
      message: "Error al iniciar sesión",
    });
  }
};

// El resto del código permanece igual...
exports.notificaciones = async function (req, res) {
  try {
    const token = req.headers["x-access-token"];
    const decoded = jwt.verify(token, process.env.SECRET);
    const notificicaciones = await UserService.getUserNotificaciones(
      decoded.id
    );
    return notificicaciones.notificaciones;
  } catch (e) {
    throw Error("Error al obtener las notificaciones del usuario");
  }
};

exports.getUserData = async function (req, res) {
  try {
    const userId = req.userId;
    const user = await UserService.getUserById(userId);

    if (!user) {
      throw { message: "Usuario no encontrado" };
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

exports.getUsers = async (req, res) => {
  try {
    const users = await UserService.getUsers();

    return res.status(200).json({
      status: 200,
      data: users,
      message: "Usuarios obtenidos exitosamente",
    });
  } catch (error) {
    console.error("Error en getUsers controller:", error);
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};

exports.updateUserAttributes = async function (req, res) {
  try {
    const userId = req.userId;
    let updateData = { ...req.body };

    // Lista de campos permitidos para actualizar
    const allowedFields = ["bio", "avatar", "coverImage", "nombre", "apellido"];

    // Si hay archivos, procesarlos primero
    if (req.files) {
      // Procesar avatar si existe
      if (req.files.avatar) {
        const avatarUrl = await uploadImage(req.files.avatar[0].buffer);
        updateData.avatar = avatarUrl;
      }

      // Procesar coverImage si existe
      if (req.files.coverImage) {
        const coverUrl = await uploadImage(req.files.coverImage[0].buffer);
        updateData.coverImage = coverUrl;
      }
    }

    // Filtrar solo los campos permitidos
    const filteredData = Object.keys(updateData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    if (Object.keys(filteredData).length === 0) {
      throw { message: "No se proporcionaron campos válidos para actualizar" };
    }

    const updatedUser = await UserService.updateUserAttributes(
      userId,
      filteredData
    );

    return res.status(200).json({
      status: 200,
      data: {
        nombre: updatedUser.nombre,
        apellido: updatedUser.apellido,
        email: updatedUser.email,
        usernickname: updatedUser.usernickname,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        coverImage: updatedUser.coverImage,
      },
      message: "Usuario actualizado correctamente",
    });
  } catch (error) {
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};

exports.handleFollow = async (req, res) => {
  try {
    const userId = req.userId; // ID del usuario autenticado (desde el token)
    const targetUserId = req.params.id; // ID del usuario objetivo
    const { action } = req.body; // "follow" o "unfollow"

    // Verificar que el usuario objetivo existe
    const targetUser = await UserService.getUserById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar que el usuario no se está siguiendo a sí mismo
    if (userId === targetUserId) {
      return res
        .status(400)
        .json({ message: "No puedes seguirte o dejar de seguirte a ti mismo" });
    }

    let message;
    if (action === "follow") {
      // Llamar al servicio para seguir al usuario
      await UserService.addFollow(userId, targetUserId);
      message = "Has comenzado a seguir al usuario";
    } else if (action === "unfollow") {
      // Llamar al servicio para dejar de seguir al usuario
      await UserService.removeFollow(userId, targetUserId);
      message = "Has dejado de seguir al usuario";
    } else {
      return res
        .status(400)
        .json({ message: "Acción inválida. Usa 'follow' o 'unfollow'" });
    }

    return res.status(200).json({
      status: 200,
      message,
    });
  } catch (error) {
    console.error("Error en handleFollow:", error);
    return res.status(500).json({ message: "Error al procesar la solicitud" });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query; // Recoge el parámetro `query` de la URL

    if (!query) {
      return res.status(400).json({
        status: 400,
        message: "Debe proporcionar un término de búsqueda",
      });
    }

    // Delegar la búsqueda al servicio
    const users = await UserService.searchUsers(query);

    if (users.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No se encontraron usuarios",
      });
    }

    return res.status(200).json({
      status: 200,
      data: users,
      message: "Usuarios encontrados exitosamente",
    });
  } catch (error) {
    console.error("Error en searchUsers:", error);
    return res.status(500).json({
      status: 500,
      message: "Error al realizar la búsqueda",
    });
  }
};
exports.confirmUser = async function (req, res) {
  const { token } = req.params;

  try {
    
    const decoded = jwt.verify(token, process.env.SECRET); // Decodificar el token
    const userId = decoded.id;

    const user = await UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.isConfirmed) {
      return res.status(400).json({ message: "El usuario ya está confirmado" });
    }

    await UserService.confirmUser(userId); // Llamar al service para confirmar el usuario

    res.status(200).json({ message: "Usuario confirmado exitosamente" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "El token ha expirado" });
    } else {
      return res.status(500).json({ message: "Error al confirmar el usuario" });
    }
  }
};
