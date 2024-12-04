// routes/api/posts.routes.js

const express = require("express");
const router = express.Router();
const PostController = require("../../controllers/posts.controller");
const Authorization = require("../../auth/authorization");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage
});

router.get("/", PostController.getAllPosts);

router.get("/me", Authorization, PostController.getUserPosts);

router.post("/create", upload.fields([{ name: 'images' }, { name: 'videos' }]), PostController.publishPost);

// routes/api/posts.routes.js
router.post("/:id/favorite", Authorization, PostController.toggleFavoritePost);

router.post("/:id/interactions", Authorization, PostController.handleInteractions);

router.get("/following", Authorization, PostController.getPostsFromFollowing);

router.get("/:id", PostController.getPostById);

module.exports = router;
