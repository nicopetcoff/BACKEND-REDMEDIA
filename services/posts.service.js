// services/posts.service.js
const Post = require("../models/post.model");

exports.getAllPosts = async function () {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // -1 para orden descendente (más reciente primero)
      .lean(); // Para mejor performance
    return posts;
  } catch (error) {
    throw Error("Error al obtener los posts desde la base de datos");
  }
};

exports.getPostById = async function (id) {
  try {
    const post = await Post.findById(id).lean();
    return post;
  } catch (error) {
    throw Error("Error al obtener el post desde la base de datos");
  }
};

exports.crearPost = async function (post) {
  const nuevoPost = new Post(post);
  try {
    const savedPost = await nuevoPost.save();
    return savedPost.toObject(); // Convertir a objeto plano
  } catch (error) {
    throw Error("Error al crear el post en la base de datos");
  }
};