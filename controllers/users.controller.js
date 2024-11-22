var UserService = require("../services/user.service");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { uploadImage } = require("../services/cloudinary");

_this = this;

exports.registerUser = async function (req, res, next) {
  try {
    const emailExists = await UserService.verificarEmailExistente(req.body.email);
    const nickExists = await UserService.verificarNickExistente(req.body.nick);
    if (emailExists) {
      throw ({message: "El email ya está registrado"})
    }
    if (nickExists) {
      throw ({message: "El nickname ya está registrado"})
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 8);

    var newUser = {
      nombre: req.body.name,
      apellido: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      usernickname: req.body.nick,
      avatar: "https://res.cloudinary.com/docrp6wwd/image/upload/v1731610184/zduipyxpgoae9zg9rg8x.jpg",
      coverImage:"https://res.cloudinary.com/docrp6wwd/image/upload/v1731610184/ixvdicibshjrrrmo2rku.jpg"
    };

    var createdUser = await UserService.createUser(newUser);
    var token = jwt.sign({ id: createdUser._id }, process.env.SECRET); // Sin expiración

     res.status(201).json({
      token: token,
      message: "Usuario creado exitosamente",
    });
  } catch (e) {
     res.status(400).json({
      status: 400,
      message: e.message,
    });
  }
};
exports.googleLogin = async function (req, res, next) {
  try{
    const emailExists = await UserService.verificarEmailExistente(req.body.email);
    //si el email ya existe, verifica si el id coincide para iniciar sesion
    if (emailExists) {
      const userData={email:req.body.email, userId:req.body.userId}
      const idCoincide = await UserService.verificarIdExistente(userData);
      if(!idCoincide){
        throw({message: "Error al iniciar sesion"})
      }
      var user = await UserService.getUserByEmail(req.body.email);
      var token = jwt.sign({ id: user._id }, process.env.SECRET); // Sin expiración

    return res.status(200).json({
      token: token,
      message: "Inicio de sesión exitoso",
    });
    }else{ //sino lo registrara
      var newUser = {
      userId: req.body.userId,
      nombre: req.body.name,
      apellido: req.body.lastName,
      email: req.body.email,
      usernickname: req.body.nick,
      avatar: "https://res.cloudinary.com/docrp6wwd/image/upload/v1731610184/zduipyxpgoae9zg9rg8x.jpg",
      coverImage:"https://res.cloudinary.com/docrp6wwd/image/upload/v1731610184/ixvdicibshjrrrmo2rku.jpg"
      
      };
      var createdUser = await UserService.createUser(newUser);
      var token = jwt.sign({ id: createdUser._id }, process.env.SECRET); // Sin expiración
      res.status(201).json({
        token: token,
        message: "Usuario creado exitosamente",
      });

    }
  
  }catch(e){
    console.log("ERRRORRRR ", e)
    throw({message:e.message})
  }
  

}

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

exports.updateUserAttributes = async function (req, res) {
  try {
    const userId = req.userId;
    let updateData = {...req.body};
    
    // Lista de campos permitidos para actualizar
    const allowedFields = ['bio', 'avatar', 'coverImage', 'nombre', 'apellido'];
    
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
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    if (Object.keys(filteredData).length === 0) {
      throw({ message: "No se proporcionaron campos válidos para actualizar" });
    }

    const updatedUser = await UserService.updateUserAttributes(userId, filteredData);

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
      message: "Usuario actualizado correctamente"
    });

  } catch (error) {
    return res.status(400).json({
      status: 400,
      message: error.message
    });
  }
};