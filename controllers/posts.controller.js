const PostsService = require("../services/posts.service");
const UserService = require("../services/user.service");
const { uploadImage, uploadVideo } = require("../services/cloudinary");
const fs = require("fs").promises;
const path = require("path");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const User = require("../models/User.model");

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await PostsService.getAllPosts();
    res.status(200).json({
      status: 200,
      data: posts,
      message: "Posts obtained successfully",
    });
  } catch (error) {
    console.error("Error getting posts:", error);
    res.status(400).json({
      status: 400,
      message: error.message || "Error getting posts",
    });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        status: 401,
        message: "User not authenticated",
      });
    }

    const posts = await PostsService.getPostsByUser(userId);

    res.status(200).json({
      status: 200,
      data: posts || [],
      message: "User's posts obtained successfully",
    });
  } catch (error) {
    console.error("Error in getUserPosts:", error);
    res.status(500).json({
      status: 500,
      message: "Error obtaining user's posts",
    });
  }
};

exports.getPostById = async (req, res) => {
  try {
    console.log("BACKK", req.params.id)
    const post = await PostsService.getPostById(req.params.id);

    if (!post) {
      return res.status(404).json({
        status: 404,
        message: "Post not found",
      });
    }
    res.status(200).json({
      status: 200,
      data: post,
      message: "Post obtained successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};

exports.publishPost = async (req, res) => {
  try {
    const imageUrls = [];
    const videoUrls = [];

    if (req.files && req.files.images) {
      for (const image of req.files.images) {
        const imageUrl = await uploadImage(image.buffer);
        imageUrls.push(imageUrl);
      }
    }

    if (req.files && req.files.videos) {
      for (const video of req.files.videos) {
        const videoUrl = await uploadVideo(video.buffer);
        videoUrls.push(videoUrl);
      }
    }

    const postData = {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      user: req.body.user,
      userAvatar: req.body.userAvatar,
      images: imageUrls,
      videos: videoUrls,
    };

    const newPost = await PostsService.createPost(postData);

    const userNickname = req.body.user;
    await UserService.calculateUserLevel(userNickname);

    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error publishing post:", error);
    res.status(500).json({ error: "There was an error creating the post" });
  }
};

exports.handleInteractions = async (req, res) => {
  try {
    const postId = req.params.id;
    const { action, comment } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Authenticated user not found" });
    }
    const username = user.usernickname;

    const post = await PostsService.getPostById(postId);
    if (!post) {
      return res.status(404).json({ status: 404, message: "Post not found" });
    }

    let updatedPost;

    if (action === "like") {
      updatedPost = await PostsService.toggleLike(postId, username);
      await PostsService.handleNotification(userId, username, postId, action);

      return res.status(200).json({
        status: 200,
        data: updatedPost,
        message: "'Like' interaction processed",
      });
    } else if (action === "comment") {
      updatedPost = await PostsService.addComment(postId, username, comment);
      await PostsService.handleNotification(userId, username, postId, action, comment);

      return res.status(200).json({
        status: 200,
        data: updatedPost,
        message: "Comment added",
      });
    } else {
      return res.status(400).json({
        status: 400,
        message: "Invalid action. Use 'like' or 'comment'.",
      });
    }

    await UserService.calculateUserLevel(username);

    return res.status(200).json({
      status: 200,
      data: updatedPost,
      message: "Interaction processed successfully",
    });
  } catch (error) {
    console.error("Error in handleInteractions:", error);
    return res.status(500).json({
      status: 500,
      message: "Error processing the interaction.",
    });
  }
};

exports.getPostsFromFollowing = async (req, res) => {
  try {
    const posts = await PostsService.getPostsFromFollowing(req.userId);

    res.status(200).json({
      status: 200,
      data: posts,
      message: "Posts obtained successfully",
    });
  } catch (error) {
    console.error("Error in controller:", error);
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};

exports.toggleFavoritePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await PostsService.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFavorite = user.favoritePosts.includes(postId);

    if (isFavorite) {
      user.favoritePosts = user.favoritePosts.filter(
        (id) => id.toString() !== postId.toString()
      );
      await user.save();
      return res.status(200).json({ message: "Post removed from favorites" });
    } else {
      user.favoritePosts.push(postId);
      await user.save();
      return res.status(200).json({ message: "Post added to favorites" });
    }
  } catch (error) {
    console.error("Error handling favorite:", error);
    res.status(500).json({ message: "Error handling post favorite" });
  }
};