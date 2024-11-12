// app.js
const express = require("express");
const cookieParser = require("cookie-parser");
const bluebird = require("bluebird");
const cors = require("cors");
const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api");

// Suprimir warnings de deprecación
process.removeAllListeners('warning');

const app = express();

// Configuraciones básicas
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());

// Configuración de CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, Origin, X-Requested-With, Content-Type, Accept, x-access-token"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use("/api", apiRouter);
app.use("/", indexRouter);

// Config para desarrollo
if (process.env.NODE_ENV === "Development") {
  require("./config").config();
}

// Conexión a la Base de Datos
var mongoose = require("mongoose");
mongoose.Promise = bluebird;
let url = `${process.env.DATABASE1}${process.env.DATABASE2}=${process.env.DATABASE3}=${process.env.DATABASE4}`;

// Opciones de conexión actualizadas
let opts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
};

// Configuración adicional de Mongoose
mongoose.set('strictQuery', true);

// Conexión a MongoDB
mongoose
  .connect(url, opts)
  .then(() => {
    console.log(`Succesfully Connected to the Mongodb Database..`);
  })
  .catch((e) => {
    console.log(`Error Connecting to the Mongodb Database...`);
    console.log(e);
  });

var port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log("Servidor de ABM Users iniciado en el puerto ", port);
});

module.exports = app;