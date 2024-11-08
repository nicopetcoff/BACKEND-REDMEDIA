// routes/api/posts.routes.js

const express = require("express");
const router = express.Router();
const PostController = require("../../controllers/posts.controller");
const Authorization = require("../../auth/authorization");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite por archivo
  },
});

router.get("/", PostController.getAllPosts);
router.get("/:id", PostController.getPostById);
router.post(
  "/crear",
  Authorization,
  upload.array("images", 10),
  PostController.crearPost
);

module.exports = router;
