const PostsService = require("../services/posts.service");
const { uploadImage, uploadVideo } = require("../services/cloudinary");
const fs = require("fs").promises; // Usamos fs.promises para usar async/await correctamente
const path = require("path"); // Para gestionar rutas de archivos
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Configura tu carpeta de destino
const User = require("../models/User.model");

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

exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.userId; // Obtenido del middleware Authorization

    if (!userId) {
      return res.status(401).json({
        status: 401,
        message: "Usuario no autenticado",
      });
    }

    const posts = await PostsService.getPostsByUser(userId);

    // Si no hay posts, devuelve un array vacío
    res.status(200).json({
      status: 200,
      data: posts || [], // Devuelve un array vacío si no hay resultados
      message: "Posts del usuario obtenidos exitosamente",
    });
  } catch (error) {
    console.error("Error en getUserPosts:", error);
    res.status(500).json({
      status: 500,
      message: "Error al obtener los posts del usuario",
    });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await PostsService.getPostById(req.params.id);

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

exports.publishPost = async (req, res) => {
  try {
    const imageUrls = [];
    const videoUrls = [];

    // Procesar las imágenes en req.files.images
    if (req.files && req.files.images) {
      for (const image of req.files.images) {
        const imageUrl = await uploadImage(image.buffer); // Usar el buffer directamente
        imageUrls.push(imageUrl);
      }
    } else {
    }

    // Procesar los videos en req.files.videos
    if (req.files && req.files.videos) {
      for (const video of req.files.videos) {
        const videoUrl = await uploadVideo(video.buffer); // Usar el buffer directamente
        videoUrls.push(videoUrl);
      }
    } else {
    }

    // Recoger los datos del post
    const postData = {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      user: req.body.user,
      userAvatar: req.body.userAvatar,
      images: imageUrls,
      videos: videoUrls,
    };

    // Guardar el post utilizando el servicio de Posts
    const nuevoPost = await PostsService.crearPost(postData);

    res.status(201).json(nuevoPost);
  } catch (error) {
    console.error("Error al publicar el post:", error);
    res.status(500).json({ error: "Hubo un error al crear el post" });
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
      return res
        .status(404)
        .json({ message: "Usuario autenticado no encontrado" });
    }
    const username = user.usernickname; // Obtener el usernickname

    // Validar si el post existe
    const post = await PostsService.getPostById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ status: 404, message: "Post no encontrado" });
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
      const updatedPost = await PostsService.addComment(
        postId,
        username,
        comment
      );
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
    const posts = await PostsService.getPostsFromFollowing(req.userId);

    res.status(200).json({
      status: 200,
      data: posts,
      message: "Posts obtenidos exitosamente",
    });
  } catch (error) {
    console.error("6. Error en controlador:", error);
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

    // Procesar las imágenes en req.files.images
    if (req.files && req.files.images) {
      for (const image of req.files.images) {
        const imageUrl = await uploadImage(image.buffer); // Usar el buffer directamente
        imageUrls.push(imageUrl);
      }
    } else {
    }

    // Procesar los videos en req.files.videos
    if (req.files && req.files.videos) {
      for (const video of req.files.videos) {
        const videoUrl = await uploadVideo(video.buffer); // Usar el buffer directamente
        videoUrls.push(videoUrl);
      }
    } else {
    }

    // Recoger los datos del post
    const postData = {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      user: req.body.user,
      userAvatar: req.body.userAvatar,
      images: imageUrls,
      videos: videoUrls,
    };

    // Guardar el post utilizando el servicio de Posts
    const nuevoPost = await PostsService.crearPost(postData);

    res.status(201).json(nuevoPost);
  } catch (error) {
    console.error("Error al publicar el post:", error);
    res.status(500).json({ error: "Hubo un error al crear el post" });
  }
};

// controllers/posts.controller.js

exports.toggleFavoritePost = async (req, res) => {
  try {
    const postId = req.params.id; // El ID del post que el usuario quiere marcar como favorito
    const userId = req.userId; // El ID del usuario que está autenticado

    // Verificar si el post existe
    const post = await PostsService.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post no encontrado" });
    }

    // Obtener al usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si el post ya es favorito
    const isFavorite = user.favoritePosts.includes(postId);

    if (isFavorite) {
      // Si el post ya es favorito, lo eliminamos de la lista de favoritos
      user.favoritePosts = user.favoritePosts.filter((id) => id.toString() !== postId.toString());
      await user.save();
      return res.status(200).json({ message: "Post eliminado de favoritos" });
    } else {
      // Si el post no es favorito, lo agregamos a la lista de favoritos
      user.favoritePosts.push(postId);
      await user.save();
      return res.status(200).json({ message: "Post agregado a favoritos" });
    }
  } catch (error) {
    console.error("Error al manejar el favorito:", error);
    res.status(500).json({ message: "Error al manejar el favorito del post" });
  }
};