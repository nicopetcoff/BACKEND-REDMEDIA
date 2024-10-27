const express = require("express");
const {
  sendMail,
  sendPasswordResetEmail,
  resetPassword,
} = require("../../controllers/mail.controller");
const router = express.Router();

// Ruta para enviar correos
router.post("/", sendPasswordResetEmail);
router.post("/send-password-reset-email", sendPasswordResetEmail);
router.post("/reset-password", resetPassword);

module.exports = router;
