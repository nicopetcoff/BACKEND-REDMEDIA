// services/posts.service.js
const Post = require("../models/post.model");
const User = require("../models/User.model");

exports.getAllPosts = async function () {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // -1 for descending order (most recent first)
      .lean(); // For better performance
    return posts;
  } catch (error) {
    throw Error("Error obtaining posts from the database");
  }
};

exports.getPostsByUser = async function (userId) {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const posts = await Post.find({ user: user.usernickname })
      .sort({ createdAt: -1 }) // Descending order by date
      .lean();

    return posts;
  } catch (error) {
    console.error("Error in getPostsByUser:", error);
    throw new Error("Error obtaining the user's posts");
  }
};

exports.getPostById = async function (id) {
  try {
    const post = await Post.findById(id).lean();
    return post;
  } catch (error) {
    throw Error("Error obtaining the post from the database");
  }
};

exports.crearPost = async function (post) {
  // Create a Post instance with the received data
  const nuevoPost = new Post({
    title: post.title,
    description: post.description,
    location: post.location,
    user: post.user,
    userAvatar: post.userAvatar,
    image: post.images || [], // If no images, store an empty array
    videos: post.videos || [], // If no videos, store an empty array
  });

  try {
    // Save the new post in MongoDB
    const savedPost = await nuevoPost.save();

    // Return the saved post
    return savedPost;
  } catch (error) {
    console.error("Error saving the post to the database:", error);
    throw new Error("Error creating the post in the database");
  }
};

exports.toggleLike = async function (postId, username) {
  try {
    const post = await Post.findById(postId);
    if (!post) throw new Error("Post not found");

    if (post.likes.includes(username)) {
      // If already liked, remove the like
      post.likes = post.likes.filter((user) => user !== username);
    } else {
      // If not liked, add the like
      post.likes.push(username);
    }

    const updatedPost = await post.save();
    return updatedPost.toObject();
  } catch (error) {
    throw new Error("Error toggling 'like': " + error.message);
  }
};

exports.addComment = async function (postId, username, comment) {
  try {
    const post = await Post.findById(postId);
    if (!post) throw new Error("Post not found");

    // Add the comment to the post's comments array
    post.comments.push({ username, comment });

    const updatedPost = await post.save();
    return updatedPost.toObject();
  } catch (error) {
    throw new Error("Error adding comment: " + error.message);
  }
};

exports.handleNotification = async function (userId, postOwner, postId, action, comment = null) {
  try {
    let text = "Like on your post";
    if (action === "comment") {
      text = `Comment on your post: "${comment}"`;
    }

    // Get the postOwnerId
    const postOwnerId = await this.getUserByNickname(postOwner);  // The use of `this` here is incorrect

    console.log("postOwnerId: ", postOwnerId, "text: ", text);

    // Change to this method directly
    const user = await User.findById(userId);  // We use `User` to get the user's ID
    const { usernickname } = user;

    const notification = {
      type: action,
      user: usernickname,
      text: text,
      time: Date.now(),
      postId: postId,
    };

    // Update the postOwner with the notification
    await User.findByIdAndUpdate(postOwnerId, {
      $push: { notificaciones: notification },
    }, { new: true });

  } catch (error) {
    throw new Error(`Error handling ${action} for the user: ` + error.message);
  }
};

exports.getUserByNickname = async function (usernickname) {
  try {
    const user = await User.findOne({ usernickname: usernickname });
    return user._id;
  } catch (error) {
    throw new Error("Error obtaining the user from the database");
  }
}

exports.getPostsFromFollowing = async function (userId) {
  try {
    // Get the current user and their following
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    // Get the followed users' documents
    const followedUsers = await User.find(
      {
        _id: { $in: currentUser.following },
      },
      "usernickname"
    );

    // Get all usernicknames (including the current user's)
    const usernames = [
      currentUser.usernickname,
      ...followedUsers.map((user) => user.usernickname),
    ];

    // Find posts from both the user and the followed users
    const posts = await Post.find({
      user: { $in: usernames },
    })
      .sort({ createdAt: -1 })
      .lean();

    return posts;
  } catch (error) {
    console.error("Error in getPostsFromFollowing:", error);
    throw new Error("Error obtaining posts from followed users");
  }
};

exports.getUserPostsAndCommentsCount = async function (usernickname) {
  try {
    // Find the user's posts
    const posts = await Post.find({ user: usernickname });

    // If there are no posts, return a count of 0
    if (!posts || posts.length === 0) {
      return { postCount: 0, commentCount: 0 };
    }

    let postCount = posts.length;
    let commentCount = 0;

    // Count the comments
    posts.forEach(post => {
      commentCount += post.comments.length;
    });

    return { postCount, commentCount };
  } catch (error) {
    console.error("Error obtaining user's posts and comments:", error);
    throw new Error("Error obtaining user's posts and comments");
  }
};

exports.getUserById = async function (userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error("Error obtaining user by ID: " + error.message);
  }
};