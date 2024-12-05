const PostsService = require("../services/posts.service");
const UserService = require("../services/user.service");
const { uploadImage, uploadVideo } = require("../services/cloudinary");
const fs = require("fs").promises;
const path = require("path");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const User = require("../models/User.model");
const Post = require("../models/Post.model");

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

    const newPost = await PostsService.crearPost(postData);

    const userNickname = req.body.user;
    await UserService.calculateUserLevel(userNickname);

    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error publishing post:", error);
    res.status(500).json({ error: "There was an error creating the post" });
  }
};

exports.toggleLike = async function (postId, username) {
  try {
    const post = await Post.findById(postId);
    if (!post) throw new Error("Post no encontrado");

    if (post.likes.includes(username)) {
      // Si ya le dio like, lo elimina
      post.likes = post.likes.filter((user) => user !== username);
    } else {
      // Si no le dio like, lo agrega
      post.likes.push(username);
      await this.handleNotification( username, postId, "Trending");
    }

    const updatedPost = await post.save();
    return updatedPost.toObject();
  } catch (error) {
    throw new Error("Error al alternar 'me gusta': " + error.message);
  }
};

exports.addComment = async function (postId, username, comment) {
  try {
    const post = await Post.findById(postId);
    if (!post) throw new Error("Post no encontrado");

    // Agregar el comentario al array de comentarios del post
    post.comments.push({ username, comment });
    await this.handleNotification( username, postId, "Comment",comment);

    const updatedPost = await post.save();
    return updatedPost.toObject();
  } catch (error) {
    throw new Error("Error al agregar comentario: " + error.message);
  }
};

exports.handleNotification = async function ( username,postId,action,comment=null) {
  try {
    //crea la notificacion
    let text="Like on your post";
    if(action==="comment")
      text=`Comment on your post: "${comment}"`;


      const notification = {
        type: action,
        user: username,
        text: text,
        time: Date.now(),
        post:postId
      };
      const postOwnerNick=await this.getPostOwner(postId); 
      const postOwnerId=await this.getUserByNickname(postOwnerNick);
      
      const doned=await User.findByIdAndUpdate(postOwnerId, {
        $push: { notificaciones: notification },
      }, { new: true });
      
  } catch (error) {
    throw new Error(`Error al ${action} al usuario: ` + error.message);
  }
};

exports.getUserByNickname = async function (usernickname) {
  try {
    const user = await User.findOne({usernickname: usernickname });
    return user._id;
  }catch (error) {
    throw new Error("Error al obtener el usuario desde la base de datos");
  }
}
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