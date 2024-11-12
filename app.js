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

// Rutas
app.use("/api", apiRouter);
app.use("/", indexRouter);

// Config para desarrollo
if (process.env.NODE_ENV === "Development") {
  require("./config").config();
}

// Conexión MongoDB
const mongoose = require("mongoose");
mongoose.Promise = bluebird;

// Construir URL de MongoDB usando la nueva sintaxis de URL
const mongoURL = new URL(process.env.DATABASE1 + process.env.DATABASE_NAME);
mongoURL.searchParams.append('retryWrites', 'true');
mongoURL.searchParams.append('w', 'majority');

// Opciones de MongoDB
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  ssl: true
};

// Configuración adicional de Mongoose
mongoose.set('strictQuery', true);

// Conexión a MongoDB
mongoose
  .connect(mongoURL.toString(), mongooseOptions)
  .then(() => {
    console.log("MongoDB conectado exitosamente");
  })
  .catch((err) => {
    console.error("Error de conexión a MongoDB:", err.message);
    process.exit(1);
  });

// Manejo de errores de MongoDB
mongoose.connection.on('error', err => {
  console.error('Error de MongoDB:', err);
});

// Puerto del servidor
const port = process.env.PORT || 4000;

// Iniciar servidor
const server = app.listen(port, () => {
  console.log(`Servidor iniciado en puerto ${port}`);
});

// Manejo de errores del servidor
server.on('error', (err) => {
  console.error('Error del servidor:', err);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('Error no manejado:', err);
});

module.exports = app;