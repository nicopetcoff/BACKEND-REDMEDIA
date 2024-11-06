// firebaseAdmin.js
const admin = require("firebase-admin");
const serviceAccount = require("./config/redmedia-aef35-firebase-adminsdk-hupym-a9e81f5b10.json");

// Inicializar Firebase solo una vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;