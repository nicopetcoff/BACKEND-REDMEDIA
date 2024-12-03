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

router.post(
  "/crear",
  Authorization,
  upload.array("images", 10),
  PostController.crearPost
);

router.post("/create", upload.fields([{ name: 'images' }, { name: 'videos' }]), PostController.publishPost);

router.post("/:id/interactions", Authorization, PostController.handleInteractions);

router.get("/following", Authorization, PostController.getPostsFromFollowing);

router.get("/:id", PostController.getPostById);

module.exports = router;
