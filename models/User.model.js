var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");

var UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  usernickname: { type: String, required: true, unique: true }, // Campo requerido
  resetToken: { type: String, default: "" },
  resetTokenExpires: { type: Date, default: null },
});

UserSchema.plugin(mongoosePaginate);
const User = mongoose.model("User", UserSchema);

module.exports = User;