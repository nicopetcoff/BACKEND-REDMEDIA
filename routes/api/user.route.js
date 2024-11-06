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

// Ruta para obtener las notificaciones
router.get("/notificaciones",UserController.notificaciones)


router.get("/me", Authorization, UserController.getUserData);

router.post("/updateProfileImage", Authorization, upload.single('avatar'), UserController.updateProfileImage);

router.post("/forgot-password", UserController.sendPasswordResetEmail);



module.exports = router;