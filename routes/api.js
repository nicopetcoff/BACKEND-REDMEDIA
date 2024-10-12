var express = require("express");
var router = express.Router();
var users = require("./api/user.route");
var posts = require("./api/posts.route"); // Agregamos la ruta de posts
var mailRoutes = require("./api/mail.route");

// Rutas de usuarios
router.use("/users", users);

// Rutas de correo
router.use("/mail", mailRoutes);

// Rutas de posts
router.use("/posts", posts); // Nueva ruta para los posts

module.exports = router;