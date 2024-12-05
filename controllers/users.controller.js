var UserService = require("../services/user.service");
var PostService = require("../services/posts.service");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { uploadImage } = require("../services/cloudinary");
const { mailSender } = require("../services/nodemailer");

_this = this;

exports.registerUser = async function (req, res, next) {
  try {
    const emailExists = await UserService.verificarEmailExistente(
      req.body.email
    );
    const nickExists = await UserService.verificarNickExistente(req.body.nick);

    if (emailExists) {
      throw { message: "The email is already registered" };
    }
    if (nickExists) {
      throw { message: "The nickname is already registered" };
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 8);

    const newUser = {
      nombre: req.body.name,
      apellido: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      genero: req.body.genero || "Not specified",
      usernickname: req.body.nick,
      level: 1,
      avatar:
        "https://res.cloudinary.com/docrp6wwd/image/upload/v1731610184/zduipyxpgoae9zg9rg8x.jpg",
      coverImage:
        "https://res.cloudinary.com/docrp6wwd/image/upload/v1731610184/ixvdicibshjrrrmo2rku.jpg",
      isConfirmed: false,
    };

    const createdUser = await UserService.createUser(newUser);

    const confirmToken = jwt.sign({ id: createdUser._id }, process.env.SECRET, {
      expiresIn: "24h",
    });

    const confirmLink = `https://redmedia.vercel.app/confirm-user/${confirmToken}`;

    const subject = "Confirm Your Account - RedMedia";
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirm Your Account</title>
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
            <h1>Confirm Your Account</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${createdUser.nombre}</strong>,</p>
            <p>Thank you for registering at <strong>Red Media</strong>. Please confirm your account by clicking the button below:</p>
            <a href="${confirmLink}" class="btn">Confirm Account</a>
            <p>If you did not request this account, you can ignore this email.</p>
            <p>This link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>This email was sent from Red Media App.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await mailSender(createdUser.email, subject, html);

    res.status(201).json({
      message:
        "User created successfully. Please check your email to confirm your account.",
    });
  } catch (e) {
    res.status(400).json({
      status: 400,
      message: e.message,
    });
  }
};

exports.googleLogin = async function (req, res, next) {
  try {
    const emailExists = await UserService.verificarEmailExistente(
      req.body.email
    );
    if (emailExists) {
      const userData = { email: req.body.email, userId: req.body.userId };
      const idCoincide = await UserService.verificarIdExistente(userData);
      if (!idCoincide) {
        throw { message: "Error logging in" };
      }
      var user = await UserService.getUserByEmail(req.body.email);
      var token = jwt.sign({ id: user._id }, process.env.SECRET);

      return res.status(200).json({
        token: token,
        message: "Login successful",
      });
    } else {
      var newUser = {
        userId: req.body.userId,
        nombre: req.body.name,
        apellido: req.body.lastName,
        email: req.body.email,
        usernickname: req.body.nick,
        avatar:
          "https://res.cloudinary.com/docrp6wwd/image/upload/v1731610184/zduipyxpgoae9zg9rg8x.jpg",
        coverImage:
          "https://res.cloudinary.com/docrp6wwd/image/upload/v1731610184/ixvdicibshjrrrmo2rku.jpg",
      };
      var createdUser = await UserService.createUser(newUser);
      var token = jwt.sign({ id: createdUser._id }, process.env.SECRET);
      res.status(201).json({
        token: token,
        message: "User created successfully",
      });
    }
  } catch (e) {
    throw { message: e.message };
  }
};

exports.loginUser = async function (req, res, next) {
  try {
    const user = await UserService.getUserByEmail(req.body.email);

    if (!user) {
      return res.status(404).json({ message: "The user does not exist" });
    }

    if (!user.isConfirmed) {
      const confirmToken = jwt.sign({ id: user._id }, process.env.SECRET, {
        expiresIn: "24h",
      });

      const confirmLink = `https://redmedia.vercel.app/confirm-user/${confirmToken}`;
      const subject = "Confirm Your Account - RedMedia";
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirm Your Account</title>
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
              <h1>Confirm Your Account</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${user.nombre}</strong>,</p>
              <p>Please confirm your account by clicking the button below:</p>
              <a href="${confirmLink}" class="btn">Confirm Account</a>
              <p>If you did not request this account, you can ignore this email.</p>
              <p>This link will expire in 24 hours.</p>
            </div>
            <div class="footer">
              <p>This email was sent from Red Media App.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await mailSender(user.email, subject, html);

      return res.status(403).json({
        message:
          "You must confirm your account before logging in. We have resent the confirmation email.",
      });
    }

    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET);

    return res.status(200).json({
      token: token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    return res.status(500).json({
      status: 500,
      message: "Error logging in",
    });
  }
};

exports.notificaciones = async function (req, res) {
  try {
    const token = req.headers["x-access-token"];
    const decoded = jwt.verify(token, process.env.SECRET);
    const notificicaciones = await UserService.getUserNotificaciones(
      decoded.id
    );
    return res.status(200).json(notificicaciones.notificaciones.reverse());
  } catch (e) {
    throw Error("Error obtaining user notifications");
  }
};

exports.getUserData = async function (req, res) {
  try {
    const token = req.headers["x-access-token"];
    if (!token) {
      return res.status(400).json({ message: "Token not provided" });
    }

    const decoded = jwt.verify(token, process.env.SECRET);
    const userId = decoded.id;

    const user = await UserService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      status: 200,
      data: {
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        usernickname: user.usernickname,
        bio: user.bio,
        avatar: user.avatar,
        coverImage: user.coverImage,
        level: user.level,
        genero: user.genero,
      },
    });
  } catch (error) {
    console.error("Error in getUserData:", error);
    return res.status(500).json({
      status: 500,
      message: "Error obtaining user data",
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await UserService.getUsers();

    return res.status(200).json({
      status: 200,
      data: users,
      message: "Users obtained successfully",
    });
  } catch (error) {
    console.error("Error in getUsers controller:", error);
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};

exports.updateUserAttributes = async function (req, res) {
  try {
    const userId = req.userId;
    let updateData = { ...req.body };

    const allowedFields = ["bio", "avatar", "coverImage", "nombre", "apellido", "genero"];

    if (req.files) {
      if (req.files.avatar) {
        const avatarUrl = await uploadImage(req.files.avatar[0].buffer);
        updateData.avatar = avatarUrl;
      }

      if (req.files.coverImage) {
        const coverUrl = await uploadImage(req.files.coverImage[0].buffer);
        updateData.coverImage = coverUrl;
      }
    }

    const filteredData = Object.keys(updateData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    if (Object.keys(filteredData).length === 0) {
      throw { message: "No valid fields provided for update" };
    }

    const updatedUser = await UserService.updateUserAttributes(
      userId,
      filteredData
    );

    return res.status(200).json({
      status: 200,
      data: {
        nombre: updatedUser.nombre,
        apellido: updatedUser.apellido,
        email: updatedUser.email,
        usernickname: updatedUser.usernickname,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        coverImage: updatedUser.coverImage,
        genero: updatedUser.genero,
      },
      message: "User updated successfully",
    });
  } catch (error) {
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};

exports.handleFollow = async (req, res) => {
  try {
    const userId = req.userId;
    const targetUserId = req.params.id;
    const { action } = req.body;

    const targetUser = await UserService.getUserById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userId === targetUserId) {
      return res
        .status(400)
        .json({ message: "You cannot follow or unfollow yourself" });
    }

    let message;
    if (action === "follow") {
      await UserService.addFollow(userId, targetUserId);
      message = "You have started following the user";
    } else if (action === "unfollow") {
      await UserService.removeFollow(userId, targetUserId);
      message = "You have unfollowed the user";
    } else {
      return res
        .status(400)
        .json({ message: "Invalid action. Use 'follow' or 'unfollow'" });
    }

    return res.status(200).json({
      status: 200,
      message,
    });
  } catch (error) {
    console.error("Error in handleFollow:", error);
    return res.status(500).json({ message: "Error processing the request" });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        status: 400,
        message: "You must provide a search term",
      });
    }

    const users = await UserService.searchUsers(query);

    return res.status(200).json({
      status: 200,
      data: users,
      message: users.length ? "Users found successfully" : "No users found",
    });
  } catch (error) {
    console.error("Error in searchUsers:", error);
    return res.status(500).json({
      status: 500,
      message: "Error performing the search",
    });
  }
};

exports.confirmUser = async function (req, res) {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const userId = decoded.id;

    const user = await UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isConfirmed) {
      return res.status(400).json({ message: "The user is already confirmed" });
    }

    await UserService.confirmUser(userId);

    res.status(200).json({ message: "User confirmed successfully" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "The token has expired" });
    } else {
      return res.status(500).json({ message: "Error confirming the user" });
    }
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await UserService.deleteUser(userId);

    const subject = "Your Account Has Been Deleted - RedMedia";
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Deleted</title>
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
            <h1>Account Deleted</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${user.nombre}</strong>,</p>
            <p>We're sorry to see you go. Your account has been deleted from <strong>RedMedia</strong>. If this was a mistake, please contact us immediately.</p>
            <p>Thank you for being part of our community.</p>
          </div>
          <div class="footer">
            <p>This email was sent from Red Media App.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await mailSender(user.email, subject, html);

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error in deleteAccount:", error);
    return res.status(500).json({ message: "Error deleting the account" });
  }
};

exports.getFavoritePosts = async (req, res) => {
  const userId = req.userId;

  try {
    const favoritePosts = await UserService.getFavoritePosts(userId);

    return res.status(200).json({
      status: 200,
      data: favoritePosts,
      message: "Favorite posts obtained successfully",
    });
  } catch (error) {
    console.error("Error obtaining favorite posts:", error);
    return res.status(500).json({
      status: 500,
      message: "Error obtaining favorite posts",
    });
  }
};