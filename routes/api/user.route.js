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

// Nueva ruta de registro
router.post("/register", UserController.registerUser);

// Ruta para obtener las notificaciones
router.get("/notificaciones",UserController.notificaciones)


router.get("/me", Authorization, UserController.getUserData);

router.patch("/me", 
    Authorization, 
    upload.fields([
      { name: 'avatar', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 }
    ]), 
    UserController.updateUserAttributes
  );




module.exports = router;