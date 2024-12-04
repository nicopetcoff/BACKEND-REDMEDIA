// services/posts.service.js
const Post = require("../models/post.model");
const User = require("../models/User.model");

exports.getAllPosts = async function () {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // -1 para orden descendente (más reciente primero)
      .lean(); // Para mejor performance
    return posts;
  } catch (error) {
    throw Error("Error al obtener los posts desde la base de datos");
  }
};

exports.getPostById = async function (id) {
  try {
    const post = await Post.findById(id).lean();
    return post;
  } catch (error) {
    throw Error("Error al obtener el post desde la base de datos");
  }
};

exports.crearPost = async function (post) {
  const nuevoPost = new Post(post);
  try {
    const savedPost = await nuevoPost.save();
    return savedPost.toObject(); // Convertir a objeto plano
  } catch (error) {
    throw Error("Error al crear el post en la base de datos");
  }
};

exports.toggleLike = async function (postId, username) {
  try {
    const post = await Post.findById(postId);
    if (!post) throw new Error("Post no encontrado");

    if (post.likes.includes(username)) {
      // Si ya le dio like, lo elimina
      post.likes = post.likes.filter((user) => user !== username);
    } else {
      // Si no le dio like, lo agrega
      post.likes.push(username);
    }

    const updatedPost = await post.save();
    return updatedPost.toObject();
  } catch (error) {
    throw new Error("Error al alternar 'me gusta': " + error.message);
  }
};

exports.addComment = async function (postId, username, comment) {
  try {
    const post = await Post.findById(postId);
    if (!post) throw new Error("Post no encontrado");

    // Agregar el comentario al array de comentarios del post
    post.comments.push({ username, comment });

    const updatedPost = await post.save();
    return updatedPost.toObject();
  } catch (error) {
    throw new Error("Error al agregar comentario: " + error.message);
  }
};

exports.handleNotification = async function (userId, postOwner,postId,action,comment=null) {
  try {
    //crea la notificacion
    console.log("ACA LLEGO EEH ")
    let text="Like on your post";
    if(action==="comment")
    text=`Comment on your post: "${comment}"`;

    const postOwnerId = await this.getUserByNickname(postOwner);
    console.log("postOwnerId: ",postOwnerId, "text: ",text)
    
    const {usernickname}= await getUserById(userId);
      const notification = {
        type: action,
        user: usernickname,
        text: text,
        time: Date.now(),
        postId:postId
      };
      await User.findByIdAndUpdate(postOwnerId, {
        $push: { notificaciones: notification },
      }, { new: true });

  } catch (error) {
    throw new Error(`Error al ${action} al usuario: ` + error.message);
  }
};

exports.getUserByNickname = async function (usernickname) {
  try {
    const user = await User.findOne({usernickname: usernickname });
    return user._id;
  }catch (error) {
    throw new Error("Error al obtener el usuario desde la base de datos");
  }
}

exports.getPostsFromFollowing = async function (userId) {
  try {
    // Obtener el usuario actual y sus following
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new Error("Usuario no encontrado");
    }

    // Obtener los documentos de usuarios seguidos
    const followedUsers = await User.find({
      '_id': { $in: currentUser.following }
    }, 'usernickname');

    // Obtener todos los usernicknames (incluido el del usuario actual)
    const usernames = [
      currentUser.usernickname,
      ...followedUsers.map(user => user.usernickname)
    ];

    // Buscar posts tanto del usuario como de los que sigue
    const posts = await Post.find({
      'user': { $in: usernames }
    })
    .sort({ createdAt: -1 })
    .lean();

    return posts;
  } catch (error) {
    console.error("Error en getPostsFromFollowing:", error);
    throw new Error("Error al obtener los posts de los usuarios seguidos");
  }
};