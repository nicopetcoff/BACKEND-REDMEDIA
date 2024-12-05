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
    throw Error("Error retrieving posts from the database");
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
    throw new Error("Error retrieving user posts");
  }
};

exports.getPostById = async function (id) {
  try {
    const post = await Post.findById(id).lean();
    return post;
  } catch (error) {
    throw Error("Error retrieving post from the database");
  }
};

exports.crearPost = async function (post) {
  const nuevoPost = new Post({
    title: post.title,
    description: post.description,
    location: post.location,
    user: post.user,
    userAvatar: post.userAvatar,
    image: post.images || [], // If no images, save an empty array
    videos: post.videos || [], // If no videos, save an empty array
  });

  try {
    const savedPost = await nuevoPost.save();
    return savedPost;
  } catch (error) {
    console.error("Error saving post to the database:", error);
    throw new Error("Error creating post in the database");
  }
};

exports.toggleLike = async function (postId, username) {
  try {
    const post = await Post.findById(postId);
    if (!post) throw new Error("Post not found");

    if (post.likes.includes(username)) {
      post.likes = post.likes.filter((user) => user !== username);
    } else {
      post.likes.push(username);
      await this.handleNotification(username, postId, "Trending");
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

    post.comments.push({ username, comment });

    const updatedPost = await post.save();
    return updatedPost.toObject();
  } catch (error) {
    throw new Error("Error adding comment: " + error.message);
  }
};

exports.handleNotification = async function (username, postId, action, comment = null) {
  try {
    let text = "Like on your post";
    if (action === "comment") {
      text = `Comment on your post: "${comment}"`;
    }

    const notification = {
      type: action,
      user: username,
      text: text,
      time: Date.now(),
      post: postId,
    };

    const postOwnerNick = await this.getPostOwner(postId);
    const postOwnerId = await this.getUserByNickname(postOwnerNick);

    await User.findByIdAndUpdate(
      postOwnerId,
      {
        $push: { notificaciones: notification },
      },
      { new: true }
    );
  } catch (error) {
    throw new Error(`Error handling ${action}: ` + error.message);
  }
};

exports.getUserByNickname = async function (usernickname) {
  try {
    const user = await User.findOne({ usernickname: usernickname });
    return user._id;
  } catch (error) {
    throw new Error("Error retrieving user from the database");
  }
};

exports.getPostOwner = async function (postId) {
  try {
    const post = await Post.findById(postId);
    if (!post) throw new Error("Post not found");
    return post.user;
  } catch (error) {
    throw new Error("Error retrieving post owner: " + error.message);
  }
};

exports.getPostsFromFollowing = async function (userId) {
  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    const followedUsers = await User.find(
      {
        _id: { $in: currentUser.following },
      },
      "usernickname"
    );

    const usernames = [
      currentUser.usernickname,
      ...followedUsers.map((user) => user.usernickname),
    ];

    const posts = await Post.find({
      user: { $in: usernames },
    })
      .sort({ createdAt: -1 })
      .lean();

    return posts;
  } catch (error) {
    console.error("Error in getPostsFromFollowing:", error);
    throw new Error("Error retrieving posts from followed users");
  }
};

exports.getUserPostsAndCommentsCount = async function (usernickname) {
  try {
    const posts = await Post.find({ user: usernickname });

    if (!posts || posts.length === 0) {
      return { postCount: 0, commentCount: 0 };
    }

    let postCount = posts.length;
    let commentCount = 0;

    posts.forEach((post) => {
      commentCount += post.comments.length;
    });

    return { postCount, commentCount };
  } catch (error) {
    console.error("Error retrieving user posts and comments:", error);
    throw new Error("Error retrieving user posts and comments");
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
    throw new Error("Error retrieving user by ID: " + error.message);
  }
};