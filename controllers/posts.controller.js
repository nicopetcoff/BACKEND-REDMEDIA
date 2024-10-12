const PostsService = require("../services/posts.service");

// Obtener todos los posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await PostsService.getAllPosts();
    res.status(200).json({
      status: 200,
      data: posts,
      message: "Posts obtenidos exitosamente",
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};

// Obtener un post por ID
exports.getPostById = async (req, res) => {
  try {
    const post = await PostsService.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ status: 404, message: "Post no encontrado" });
    }
    res.status(200).json({
      status: 200,
      data: post,
      message: "Post obtenido exitosamente",
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};

// Crear un nuevo post
exports.crearPost = async (req, res) => {
  try {
    const post = {
      image: req.body.image,
      title: req.body.title,
      user: req.body.user,
      userAvatar: req.body.userAvatar,
      location: req.body.location,
      sold: req.body.sold || false,
      likes: req.body.likes || 0,
      comments: req.body.comments || [],
    };

    const nuevoPost = await PostsService.crearPost(post);
    res.status(201).json({
      status: 201,
      data: nuevoPost,
      message: "Post creado exitosamente",
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};