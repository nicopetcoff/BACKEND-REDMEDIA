const PostsService = require("../services/posts.service");
const UserService = require("../services/user.service");
const { uploadImage, uploadVideo } = require("../services/cloudinary");
const fs = require("fs").promises; // Using fs.promises to use async/await correctly
const path = require("path"); // To manage file paths
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Configure your destination folder
const User = require("../models/User.model");

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await PostsService.getAllPosts();
    res.status(200).json({
      status: 200,
      data: posts,
      message: "Posts retrieved successfully",
    });
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res.status(400).json({
      status: 400,
      message: error.message || "Error retrieving posts",
    });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.userId; // Obtained from Authorization middleware

    if (!userId) {
      return res.status(401).json({
        status: 401,
        message: "User not authenticated",
      });
    }

    const posts = await PostsService.getPostsByUser(userId);

    // If no posts, return an empty array
    res.status(200).json({
      status: 200,
      data: posts || [], // Return an empty array if no results
      message: "User posts retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getUserPosts:", error);
    res.status(500).json({
      status: 500,
      message: "Error retrieving user posts",
    });
  }
};

exports.getPostById = async (req, res) => {
  try {
    console.log("BACKK", req.params.id);
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
      message: "Post retrieved successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};

// Consolidated method to publish a post
exports.publishPost = async (req, res) => {
  try {
    const imageUrls = [];
    const videoUrls = [];

    // Process images in req.files.images
    if (req.files && req.files.images) {
      for (const image of req.files.images) {
        const imageUrl = await uploadImage(image.buffer); // Use the buffer directly
        imageUrls.push(imageUrl);
      }
    }

    // Process videos in req.files.videos
    if (req.files && req.files.videos) {
      for (const video of req.files.videos) {
        const videoUrl = await uploadVideo(video.buffer); // Use the buffer directly
        videoUrls.push(videoUrl);
      }
    }

    // Collect post data
    const postData = {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      user: req.body.user,
      userAvatar: req.body.userAvatar,
      images: imageUrls,
      videos: videoUrls,
    };

    // Save the post using the Posts service
    const nuevoPost = await PostsService.crearPost(postData);

    // After creating the post, calculate the level of the user who posted it
    const userNickname = req.body.user; // Assuming `req.body.user` contains the author's user nickname
    await UserService.calculateUserLevel(userNickname); // Call the level calculation function

    res.status(201).json(nuevoPost);
  } catch (error) {
    console.error("Error publishing post:", error);
    res.status(500).json({ error: "Error creating the post" });
  }
};

// Interaction handling (likes and comments)
exports.handleInteractions = async (req, res) => {
  try {
    const postId = req.params.id; // Post ID from parameters
    const { action, comment } = req.body; // Action and comment from the body
    const userId = req.userId; // Authenticated user ID (from token)

    // Find the authenticated user's user nickname
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "Authenticated user not found" });
    }
    const username = user.usernickname; // Get the user nickname

    // Validate if the post exists
    const post = await PostsService.getPostById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ status: 404, message: "Post not found" });
    }

    let updatedPost;

    if (action === "like") {
      // Increment or decrement the like counter
      updatedPost = await PostsService.toggleLike(postId, username);

      return res.status(200).json({
        status: 200,
        data: updatedPost,
        message: "'Like' interaction processed",
      });
    } else if (action === "comment") {
      // Add comment to the post with the username
      updatedPost = await PostsService.addComment(postId, username, comment);
      // Send notification (if included in the logic)
      await PostsService.handleNotification(username, postId, action, comment);

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

    // After the interaction, calculate the user's level (without blocking the response)
    await UserService.calculateUserLevel(username); // Call the user level calculation

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
      message: "Posts retrieved successfully",
    });
  } catch (error) {
    console.error("Error in controller:", error);
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};

// Method to add to favorites
exports.toggleFavoritePost = async (req, res) => {
  try {
    const postId = req.params.id; // Post ID that the user wants to mark as favorite
    const userId = req.userId; // Authenticated user's ID

    // Verify if the post exists
    const post = await PostsService.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Get the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify if the post is already a favorite
    const isFavorite = user.favoritePosts.includes(postId);

    if (isFavorite) {
      // If the post is already a favorite, remove it from the favorites list
      user.favoritePosts = user.favoritePosts.filter(
        (id) => id.toString() !== postId.toString()
      );
      await user.save();
      return res.status(200).json({ message: "Post removed from favorites" });
    } else {
      // If the post is not a favorite, add it to the favorites list
      user.favoritePosts.push(postId);
      await user.save();
      return res.status(200).json({ message: "Post added to favorites" });
    }
  } catch (error) {
    console.error("Error handling favorite:", error);
    res.status(500).json({ message: "Error handling post favorite" });
  }
};