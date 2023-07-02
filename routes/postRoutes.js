const express = require("express");
const {
  getAllPosts,
  createPost,
  deleteAllPosts,
  getSinglePost,
  deleteSinglePost,
  updatePost,
  deleteAllUserPosts,
} = require("../controllers/post/postController");
const { verifyToken } = require("../core/verifyToken");

const postRouter = express.Router();

// CREATE
postRouter.post("/createPost", verifyToken, createPost);

// READ
postRouter.get("/allPosts", getAllPosts);
postRouter.get("/:id", getSinglePost);

// UPDATE
postRouter.put("/:id", verifyToken, updatePost);

// DELETE
postRouter.delete("/nuke/:tag", deleteAllPosts);
postRouter.delete("/:id", verifyToken, deleteSinglePost);
postRouter.delete("/userPosts/:id", verifyToken, deleteAllUserPosts);

module.exports = postRouter;
