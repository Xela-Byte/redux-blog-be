const { Post } = require("../../models/Post");
const { User } = require("../../models/User");

// CREATE
exports.createPost = async (req, res, next) => {
  const { title, content, postedBy, reactions } = req.body;
  const user = req.user;
  const existingUser = await User.findOne({ _id: postedBy });

  try {
    if (!title || !content || !postedBy || !reactions) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (!existingUser) {
      res.status(400).json({
        success: false,
        message: "You have to sign up before making a post!",
      });
    } else {
      const newPost = new Post({
        content,
        title,
        postedBy,
        reactions,
      });

      await newPost.save();
      await user.updateOne(
        {
          $push: {
            posts: {
              postID: newPost.id,
            },
          },
        },
        {
          returnDocument: true,
        }
      );

      return res.status(200).json({
        success: true,
        response: newPost,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// READ
exports.getAllPosts = async (req, res, next) => {
  let posts;

  try {
    posts = await Post.find().populate("postedBy").sort("-1").exec();
  } catch (err) {
    console.log(err);
  }
  if (!posts) {
    res.status(404).json({ success: false, message: "No posts found!" });
  }

  return res.status(200).json({
    success: true,
    response: posts,
  });
};

exports.getSinglePost = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!id) {
      res.status(401).json({
        success: false,
        message: "Provide Post ID",
      });
    } else {
      const post = await Post.findById(id);

      if (!post) {
        res.status(404).json({
          success: false,
          message: "Post not found!",
        });
      } else {
        return res.status(200).json({
          success: true,
          response: post,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// UPDATE

exports.updatePost = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  const { title, content, reactions } = req.body;
  try {
    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    } else {
      const { postedBy } = post;

      if (user.id === postedBy._id.toString()) {
        await Post.findOneAndUpdate(
          { _id: id },
          {
            title,
            content,
            reactions,
          },
          {
            returnDocument: true,
          },

          async (err, done) => {
            const updatedPost = await Post.findOne({ _id: id });
            return res.status(200).json({
              success: true,
              response: updatedPost,
            });
          }
        ).clone();
      } else {
        res.status(409).json({
          success: false,
          message: "Not authorized!",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Interval Server Error",
    });
  }
};

// DELETE
exports.deleteSinglePost = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  try {
    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    } else {
      const { postedBy } = post;

      if (user.id === postedBy._id.toString()) {
        await Post.findByIdAndDelete(id);

        const postOwner = await User.findById(user.id);
        postOwner.posts = postOwner.posts.filter((post) => {
          return post.postID !== id;
        });
        await postOwner.save();
        return res.status(200).json({
          success: true,
          message: "Post deleted successfully!",
        });
      } else {
        res.status(409).json({
          success: false,
          message: "Not authorized!",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Interval Server Error",
    });
  }
};

exports.deleteAllUserPosts = async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found!",
    });
  }
  if (!id) {
    return res.status(409).json({
      success: false,
      message: "Not authorized!",
    });
  } else {
    try {
      await User.updateOne({ _id: id }, { $set: { posts: [] } });
      await Post.updateMany({}, { $pull: { postedBy: id } });

      return res.status(200).json({
        success: true,
        message: `All posts for ${user.username} has been deleted!`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Interval Server Error",
      });
    }
  }
};

exports.deleteAllPosts = async (req, res) => {
  const { tag } = req.params;
  if (!tag || tag !== process.env.TOKEN) {
    res.status(401).json({
      success: false,
      message: "Ye shall not nuke us!",
    });
  } else {
    await Post.deleteMany();
    res.status(200).json({
      success: true,
      message: "A fresh start, a new beginning!",
    });
  }
};
