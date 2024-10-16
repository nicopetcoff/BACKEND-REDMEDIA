const mongoose = require("mongoose");

// Esquema de los posts
const PostSchema = new mongoose.Schema({
  image: { type: [String], required: true }, // Cambiamos a un array de strings
  title: { type: String, required: true },
  user: { type: String, required: true },
  userAvatar: { type: String },
  location: { type: String },
  sold: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  comments: [
    {
      username: { type: String },
      comment: { type: String },
    },
  ],
});

// Creamos el modelo Post basado en el esquema
const Post = mongoose.model("Post", PostSchema);

module.exports = Post;