const express = require("express");
const router = express.Router();
const PostController = require("../../controllers/posts.controller");

// Obtener todos los posts
router.get("/", PostController.getAllPosts);

// Obtener un post por ID
router.get("/:id", PostController.getPostById);

// Crear un nuevo post
router.post("/crear", PostController.crearPost);

module.exports = router;