// testFirebase.js
const admin = require("./firebaseAdmin");

async function verifyFirebaseSetup() {
  try {
    const user = await admin.auth().getUserByEmail("test@example.com");
    console.log("Firebase configurado correctamente, usuario encontrado:", user.email);
  } catch (error) {
    console.error("Error al verificar la configuración de Firebase:", error);
  }
}

verifyFirebaseSetup();