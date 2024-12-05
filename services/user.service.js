var User = require("../models/User.model");

const PostsService = require("./posts.service"); // Import PostsService

_this = this;

// Create a new user
exports.createUser = async function (userData) {
  try {
    var newUser = new User(userData);
    var savedUser = await newUser.save();
    return savedUser;
  } catch (e) {
    throw "Error creating user";
  }
};

// Check if the email already exists
exports.verificarEmailExistente = async function (email) {
  try {
    var existingUser = await User.findOne({ email: email });
    return existingUser !== null;
  } catch (e) {
    throw Error("Error verifying email");
  }
};

// Verify user ID
exports.verificarIdExistente = async function (userData) {
  try {
    var existingUser = await User.findOne({ email: userData.email });
    return existingUser.userId === userData.userId;
  } catch (e) {
    throw Error("Error logging in");
  }
};

exports.verificarNickExistente = async function (nick) {
  try {
    var existingNick = await User.findOne({ usernickname: nick });
    return existingNick !== null;
  } catch (e) {
    throw Error("Error verifying nickname");
  }
};

exports.getUserByEmail = async function (email) {
  try {
    var user = await User.findOne({ email: email });
    return user;
  } catch (e) {
    throw Error("Error searching for user by email");
  }
};

exports.getUserNotificaciones = async function (userId) {
  try {
    const notificicaciones = await User.findById(userId).select(
      "notificaciones"
    );
    return notificicaciones;
  } catch (e) {
    throw Error("Error obtaining user notifications");
  }
};

exports.actualizarResetToken = async function (
  email,
  resetToken,
  resetTokenExpires
) {
  try {
    // Update the user with the new token and its expiration
    const updatedUser = await User.findOneAndUpdate(
      { email: email }, // Find the user by email
      {
        resetToken: resetToken, // Set the new token
        resetTokenExpires: resetTokenExpires, // Set the new expiration date
      },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser; // Return the updated user
  } catch (error) {
    throw new Error(
      "Error updating the reset token: " + error.message
    );
  }
};

exports.getUserById = async function (userId) {
  try {
    var user = await User.findById(userId); // Use Mongoose to find the user by ID
    return user;
  } catch (e) {
    throw new Error("Error obtaining user by ID: " + e.message);
  }
};

exports.getUsers = async () => {
  try {
    const users = await User.find(
      {},
      { password: 0, resetToken: 0, resetTokenExpires: 0 }
    ).lean(); // Remove level calculation here

    return users;
  } catch (error) {
    console.error("Error obtaining users:", error);
    throw new Error("Error obtaining users");
  }
};

exports.updateUserAttributes = async function (userId, updateData) {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  } catch (error) {
    throw new Error("Error updating user: " + error.message);
  }
};

exports.addFollow = async (userId, targetUserId) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { following: targetUserId } }, // Avoid duplicates
      { new: true }
    );

    await User.findByIdAndUpdate(
      targetUserId,
      { $addToSet: { followers: userId } },
      { new: true }
    );
    // Create the notification
    const { usernickname } = await this.getUserById(userId);
    const notification = {
      type: "Followed",
      user: usernickname,
      text: "started following you",
      time: Date.now(),
    };

    // Add the notification
    await User.findByIdAndUpdate(targetUserId, {
      $push: { notificaciones: notification },
    }, { new: true });

    return user;
  } catch (error) {
    throw new Error("Error following the user: " + error.message);
  }
};

exports.removeFollow = async (userId, targetUserId) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { following: targetUserId } }, // Remove the ID from the list
      { new: true }
    );

    await User.findByIdAndUpdate(
      targetUserId,
      { $pull: { followers: userId } },
      { new: true }
    );

    return user;
  } catch (error) {
    throw new Error("Error unfollowing the user: " + error.message);
  }
};

exports.searchUsers = async (query) => {
  try {
    const users = await User.find(
      {
        $or: [
          { nombre: { $regex: query, $options: "i" } },
          { apellido: { $regex: query, $options: "i" } },
          { usernickname: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
      },
      {
        password: 0, // Exclude password from results
        resetToken: 0,
        resetTokenExpires: 0,
      }
    ).lean();

    return users;
  } catch (error) {
    console.error("Error in searchUsers (service):", error);
    throw new Error("Error performing user search");
  }
};

exports.confirmUser = async function (userId) {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isConfirmed: true },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  } catch (error) {
    throw new Error("Error confirming the user: " + error.message);
  }
};
exports.deleteUser = async (userId) => {
  try {
    await User.findByIdAndDelete(userId); // Use Mongoose to delete the user by ID
  } catch (error) {
    throw new Error("Error deleting the user: " + error.message);
  }
};

// Method to get a user's favorite posts
exports.getFavoritePosts = async function (userId) {
  try {
    // Find the user by ID and populate the favoritePosts field with full post details
    const user = await User.findById(userId).populate("favoritePosts");

    if (!user) {
      throw new Error("User not found");
    }

    // Return the favorite posts
    return user.favoritePosts;
  } catch (error) {
    console.error("Error obtaining favorite posts:", error);
    throw new Error("Error obtaining favorite posts");
  }
};

// Within the UserService

exports.calculateUserLevel = async function (usernickname) {
  try {
    // Get the number of posts and comments by the user
    const { postCount, commentCount } =
      await PostsService.getUserPostsAndCommentsCount(usernickname);

    // Initialize the level
    let level = 1;

    // Calculate the level based on the criteria
    if (postCount >= 4 && commentCount >= 4) {
      level = 4; // Level 4: 4 posts and 4 comments
    } else if (postCount >= 4) {
      level = 3; // Level 3: 4 posts
    } else if (postCount >= 2) {
      level = 2; // Level 2: 2 posts
    }

    // Find the user, excluding the `password` field in the query
    const user = await User.findOne({ usernickname: usernickname }).select('-password');
    if (!user) {
      throw new Error("User not found");
    }

    // If the level is already adequate, do nothing
    if (user.level === level) {
      return level;
    }

    // Save only the calculated level without affecting other fields
    user.level = level;
    await user.save();

    return level; // Return the calculated level
  } catch (error) {
    console.error("Error calculating user level:", error);
    throw new Error("Error calculating user level");
  }
};