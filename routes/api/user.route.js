var express = require("express");
var router = express.Router();
var UserController = require("../../controllers/users.controller");
var Authorization = require("../../auth/authorization");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Ruta para el login
router.post("/singin", UserController.loginUser);

// Nueva ruta de registro
router.post("/signup", UserController.registerUser);

// Login de usuario
//router.post("/login/", UserController.loginUser);

{/*router.get(
  "/obtenerImagenUsuario/:email",
  Authorization,
  UserController.getImagenUsuario
);
*/}

module.exports = router;