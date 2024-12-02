// firebaseAdmin.js
const admin = require("firebase-admin");
require('dotenv').config();

// Verificar que FIREBASE_PRIVATE_KEY esté definida para evitar errores de configuración
if (!process.env.FIREBASE_PRIVATE_KEY) {
  console.error("Error: FIREBASE_PRIVATE_KEY no está definida en las variables de entorno.");
  process.exit(1); // Termina el proceso si falta la clave privada
}

// Inicializar Firebase solo una vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Formateo correcto para la clave privada
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    }),
  });
}

module.exports = admin;