// models/post.model.js
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  image: { type: [String], required: true },
  title: { type: String, required: true },
  description: { type: String },
  user: { type: String, required: true },
  userAvatar: { type: String },
  location: { type: String },
  likes: { type: Number, default: 0 },
  comments: [
    {
      username: { type: String },
      comment: { type: String },
    },
  ],
}, {
  timestamps: true  // Esto añadirá automáticamente createdAt y updatedAt
});

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;