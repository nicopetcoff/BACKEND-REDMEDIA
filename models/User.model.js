var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");

var UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  usernickname: { type: String, required: true, unique: true },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  resetToken: { type: String, default: "" },
  resetTokenExpires: { type: Date, default: null },
  avatar: { type: String, default: "" },
  coverImage: { type: String, default: "" },
  notificaciones: [
    {
      type: { type: String },
      user: { type: String },
      text: { type: String },
      time: { type: Date, default: Date.now },
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    },
  ],
});

UserSchema.plugin(mongoosePaginate);

// Verificar si el modelo ya existe antes de definirlo
const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = User;
