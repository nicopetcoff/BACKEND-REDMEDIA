var express = require("express");
var router = express.Router();
var UserController = require("../../controllers/users.controller");
var Authorization = require("../../auth/authorization");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Rutas de usuarios
router.get("/", Authorization,UserController.getUsers);

// Ruta para el login
router.post("/singin", UserController.loginUser);

//autenticacion con google
router.post("/google", UserController.googleLogin);

// Nueva ruta de registro
router.post("/register", UserController.registerUser);

router.get("/confirm-user/:token", UserController.confirmUser);

// Ruta para obtener las notificaciones
router.get("/notificaciones",UserController.notificaciones)


router.get("/me", Authorization, UserController.getUserData);

// Ruta para eliminar una cuenta
router.delete("/me", Authorization, UserController.deleteAccount);

router.patch("/me", 
    Authorization, 
    upload.fields([
      { name: 'avatar', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 }
    ]), 
    UserController.updateUserAttributes
  );

// Ruta para seguir o dejar de seguir a un usuario
router.patch("/:id/follow", Authorization, UserController.handleFollow);

// Ruta para buscar usuarios
router.get("/search", Authorization, UserController.searchUsers);

// Ruta para obtener los posts favoritos de un usuario
router.get("/favorites", Authorization, UserController.getFavoritePosts);

module.exports = router;