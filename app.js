//Express
var express = require("express");
var cookieParser = require("cookie-parser");
var bluebird = require("bluebird");
var cors = require("cors");
var indexRouter = require("./routes/index");
var apiRouter = require("./routes/api");

var app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(cors());
app.use(cookieParser());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use("/api", apiRouter);
app.use("/", indexRouter);

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
  connectTimeoutMS: 20000,
  useUnifiedTopology: true,
  useFindAndModify: false,  // Esta es la opción que faltaba
  useCreateIndex: true      // Agregada para manejar índices únicos
};

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