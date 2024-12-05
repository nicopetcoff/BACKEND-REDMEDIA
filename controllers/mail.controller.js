const { mailSender } = require("../services/nodemailer");
const UserService = require("../services/user.service");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const jwt = require("jsonwebtoken");

const sendMail = async function (req, res) {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Missing parameter: to" });
    }

    const subject = "This is a test email";
    const text = "This is the default test content of the email.";

    await mailSender(email, subject, text);
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error sending the email" });
  }
};

const sendPasswordResetEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      throw { message: "Incorrect email" };
    }

    const resetToken = jwt.sign(
      { id: user._id.toString() },
      process.env.SECRET,
      { expiresIn: "1h" }
    );

    await UserService.actualizarResetToken(
      email,
      resetToken,
      Date.now() + 3600000
    );

    const resetLink = `https://redmedia.vercel.app/reset-password/${resetToken}`;
    const subject = "Password Reset";
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #007BFF;
            color: #ffffff;
            text-align: center;
            padding: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 20px;
            line-height: 1.6;
            color: #333333;
          }
          .content p {
            margin: 10px 0;
          }
          .btn {
            display: inline-block;
            background-color: #007BFF;
            color: #ffffff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin-top: 20px;
            font-size: 16px;
          }
          .btn:hover {
            background-color: #0056b3;
          }
          .footer {
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #777777;
            background-color: #f4f4f4;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${user.nombre}</strong>,</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetLink}" class="btn">Reset Password</a>
            <p>This link will expire in one hour. If you didn't request this change, you can ignore this email.</p>
          </div>
          <div class="footer">
            <p>This email was sent from Red Media App.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await mailSender(email, subject, html);

    res.status(200).json({ message: "A reset email was sent" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: error.message });
  }
};

// Controller to reset the user's password

const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    // Verify and decode the token
    const decoded = jwt.verify(resetToken, process.env.SECRET);

    const userId = decoded.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the password
    const hashedPassword = bcrypt.hashSync(newPassword, 8);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    } else {
      console.error(
        "Error processing password change request:",
        error
      );
      res.status(500).json({ message: "Error processing the request" });
    }
  }
};

module.exports = {
  sendMail,
  sendPasswordResetEmail,
  resetPassword,
};