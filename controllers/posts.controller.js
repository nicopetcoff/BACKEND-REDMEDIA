const PostsService = require("../services/posts.service");
const { uploadToCloudinary } = require("../services/cloudinary");
const User = require("../models/user.model");

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await PostsService.getAllPosts();
    res.status(200).json({
      status: 200,
      data: posts,
      message: "Posts obtenidos exitosamente",
    });
  } catch (error) {
    console.error("Error al obtener posts:", error);
    res.status(400).json({
      status: 400,
      message: error.message || "Error al obtener los posts",
    });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await PostsService.getPostById(req.params.id);
    console.log("pasa por aca")
    if (!post) {
      return res.status(404).json({
        status: 404,
        message: "Post no encontrado",
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
        message: "Se requiere al menos una imagen",
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
        message: "No se pudo subir ninguna imagen",
      });
    }

    const postData = {
      title: req.body.title,
      description: req.body.description || "",
      location: req.body.location,
      user: req.body.user,
      image: imageUrls,
      sold: false,
      likes: 0,
      comments: [],
    };

    const nuevoPost = await PostsService.crearPost(postData);

    res.status(201).json({
      status: 201,
      data: nuevoPost,
      message: "Post creado exitosamente",
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message || "Error al crear el post",
    });
  }
};

exports.handleInteractions = async (req, res) => {
  try {
    const postId = req.params.id; // ID del post desde los parámetros
    const { action, comment } = req.body; // Acción y comentario desde el cuerpo
    const userId = req.userId; // ID del usuario autenticado (desde el token)

    // Buscar el usernickname del usuario autenticado
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario autenticado no encontrado" });
    }
    const username = user.usernickname; // Obtener el usernickname

    // Validar si el post existe
    const post = await PostsService.getPostById(postId);
    if (!post) {
      return res.status(404).json({ status: 404, message: "Post no encontrado" });
    }

    if (action === "like") {
      // Incrementar o decrementar el contador de likes
      const updatedPost = await PostsService.toggleLike(postId, username);
      return res.status(200).json({
        status: 200,
        data: updatedPost,
        message: "Interacción de 'me gusta' procesada",
      });
    } else if (action === "comment") {
      // Agregar comentario al post con el username
      const updatedPost = await PostsService.addComment(postId, username, comment);
      return res.status(200).json({
        status: 200,
        data: updatedPost,
        message: "Comentario agregado",
      });
    } else {
      return res.status(400).json({
        status: 400,
        message: "Acción inválida. Usa 'like' o 'comment'.",
      });
    }
  } catch (error) {
    console.error("Error en handleInteractions:", error);
    return res.status(500).json({
      status: 500,
      message: "Error al procesar la interacción.",
    });
  }
};

exports.getPostsFromFollowing = async (req, res) => {
  try {
    console.log('1. Entrando al controlador getPostsFromFollowing');
    console.log('2. userId recibido:', req.userId);

    const posts = await PostsService.getPostsFromFollowing(req.userId);
    
    console.log('5. Posts obtenidos:', posts);

    res.status(200).json({
      status: 200,
      data: posts,
      message: "Posts obtenidos exitosamente"
    });
  } catch (error) {
    console.error('6. Error en controlador:', error);
    res.status(400).json({
      status: 400,
      message: error.message
    });
  }
};