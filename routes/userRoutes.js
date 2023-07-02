const express = require("express");
const {
  editAccount,
  deleteAccount,
} = require("../controllers/user/profileController.js");
const {
  getAllUsers,
  loginUser,
  registerUser,
  deleteAllUsers,
} = require("../controllers/user/userController.js");

const { verifyToken } = require("../core/verifyToken");

const authRouter = express.Router();

authRouter.get("/users", getAllUsers);
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/updateProfile", verifyToken, editAccount);
authRouter.post("/deleteProfile", verifyToken, deleteAccount);
authRouter.delete("/nuke/:tag", deleteAllUsers);

module.exports = authRouter;
