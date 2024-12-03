// models/post.model.js
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    image: { type: [String], required: true },
    videos: {type: [String], required: true},
    title: { type: String, required: true },
    description: { type: String },
    user: { type: String, required: true },
    location: { type: String },
    likes: { type: [String], default: [] }, // Array de usuarios que dieron "me gusta"
    comments: [
      {
        username: { type: String },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true, // createdAt y updatedAt
  }
);

module.exports = mongoose.model("Post", PostSchema);