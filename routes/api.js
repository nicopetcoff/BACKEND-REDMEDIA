var express = require("express");
var router = express.Router();
var users = require("./api/user.route");
var posts = require("./api/posts.route"); // Ruta para los posts
var mailRoutes = require("./api/mail.route");

// Rutas de usuarios
router.use("/users", users); // La ruta de registro se manejará aquí

// Rutas de correo
router.use("/mail", mailRoutes);

// Rutas de posts
router.use("/posts", posts);

module.exports = router;