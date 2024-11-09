var express = require("express");
var router = express.Router();
var users = require("./api/user.route");
var posts = require("./api/posts.route"); // Ruta para los posts
var mailRoutes = require("./api/mail.route");
var ads = require("./api/ads.routes");

// Rutas de usuarios
router.use("/users", users); // La ruta de registro se manejará aquí

// Rutas de correo
router.use("/mail", mailRoutes);

// Rutas de posts
router.use("/posts", posts);

// Rutas de anuncios
router.use("/ads", ads);

module.exports = router;