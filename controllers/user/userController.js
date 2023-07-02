const { User } = require("../../models/User");
const { updateToken } = require("../../core/updateToken");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

exports.getAllUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find();
  } catch (err) {
    console.log(err);
  }
  if (!users) {
    res.status(404).json({ success: false, message: "No users found!" });
  }
  return res.status(200).json({
    success: true,
    response: users,
  });
};

exports.registerUser = async (req, res, next) => {
  const { username, email, password } = req.body;

  let cloudinarizedPhoto = [];

  if (req.files) {
    cloudinarizedPhoto = await uploadFileResponse(req.files.profilePhoto);
  }

  try {
    if (!username || !email || !password) {
      res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    } else {
      const existingUser = await User.findOne({
        email: email,
      });
      if (existingUser) {
        res.status(401).json({
          success: false,
          message: `User with ${email} already exists!`,
        });
      } else {
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
          username: username,
          email: email,
          password: hashedPassword,
          profilePictureUrl: cloudinarizedPhoto,
        });
        await newUser.save();
        const token = jwt.sign(
          {
            id: newUser.id,
          },
          process.env.TOKEN,
          {
            expiresIn: "50d",
          }
        );

        await updateToken(newUser.id, token);

        const userData = {
          user: newUser,
          token: token,
        };

        res.status(200).json({
          success: true,
          response: userData,
        });
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Internal server error, please try again later!",
    });
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!password || !email) {
      res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    } else {
      const existingUser = await User.findOne({ email: email });
      if (!existingUser) {
        res.status(401).json({
          success: false,
          message: "User does not exist",
        });
      } else {
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
          res.status(401).json({
            success: false,
            message: "Incorrect password",
          });
        } else {
          const token = jwt.sign(
            { email: existingUser.email, id: existingUser.id },
            process.env.TOKEN,
            {
              expiresIn: "60d",
            }
          );
          await updateToken(existingUser.id, token);
          res.status(200).json({
            success: true,
            message: "Login Successful",
            token: token,
            response: existingUser,
          });
        }
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Internal server error, please try again later!",
    });
  }
};

exports.deleteAllUsers = async (req, res) => {
  const { tag } = req.params;
  if (!tag || tag !== process.env.TOKEN) {
    res.status(401).json({
      success: false,
      message: "Ye shall not nuke us!",
    });
  } else {
    await User.deleteMany();
    res.status(200).json({
      success: true,
      message: "A fresh start, a new beginning!",
    });
  }
};
