const Post = require("../models/post.model"); // Importamos el modelo de MongoDB

// Servicio para obtener todos los posts
exports.getAllPosts = async function () {
  try {
    // Obtenemos todos los posts desde MongoDB
    const posts = await Post.find();
    return posts;
  } catch (error) {
    throw Error("Error al obtener los posts desde la base de datos");
  }
};

// Servicio para obtener un post por ID
exports.getPostById = async function (id) {
  try {
    // Buscamos el post por ID en MongoDB
    const post = await Post.findById(id);
    return post;
  } catch (error) {
    throw Error("Error al obtener el post desde la base de datos");
  }
};

// Servicio para crear un nuevo post
exports.crearPost = async function (post) {
  const nuevoPost = new Post(post);

  try {
    // Guardamos el nuevo post en MongoDB
    const savedPost = await nuevoPost.save();
    return savedPost;
  } catch (error) {
    throw Error("Error al crear el post en la base de datos");
  }
};