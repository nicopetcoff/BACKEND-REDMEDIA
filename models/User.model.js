var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");

var UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  usernickname: { type: String, required: true, unique: true }, // Campo requerido
  resetToken: { type: String, default: "" },
  resetTokenExpires: { type: Date, default: null },
  avatar: { type: String, default: "" }, // Nuevo campo para la imagen de perfil
  coverImage: { type: String, default: "" }, // Nuevo campo para la imagen de perfil
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
const User = mongoose.model("User", UserSchema);

module.exports = User;