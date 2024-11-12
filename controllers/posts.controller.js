const PostsService = require("../services/posts.service");
const { uploadToCloudinary } = require("../services/cloudinary");

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await PostsService.getAllPosts();
    res.status(200).json({
      status: 200,
      data: posts,
      message: "Posts obtenidos exitosamente",
    });
  } catch (error) {
    console.error('Error al obtener posts:', error);
    res.status(400).json({
      status: 400,
      message: error.message || "Error al obtener los posts",
    });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await PostsService.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ 
        status: 404, 
        message: "Post no encontrado" 
      });
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

exports.crearPost = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Se requiere al menos una imagen"
      });
    }

    const imageUrls = [];

    for (const file of req.files) {
      try {
        const result = await uploadToCloudinary(file.buffer);
        imageUrls.push(result.secure_url);
      } catch (uploadError) {
        continue;
      }
    }

    if (imageUrls.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "No se pudo subir ninguna imagen"
      });
    }

    const postData = {
      title: req.body.title,
      description: req.body.description || '',
      location: req.body.location,
      user: req.body.user,
      userAvatar: req.body.userAvatar,
      image: imageUrls,
      sold: false,
      likes: 0,
      comments: []
    };

    const nuevoPost = await PostsService.crearPost(postData);
    
    res.status(201).json({
      status: 201,
      data: nuevoPost,
      message: "Post creado exitosamente"
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message || "Error al crear el post"
    });
  }
};