const { User } = require("../../models/User");
const { uploadFileResponse } = require("../../core/cloudinary");

exports.getSingleUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    return res.status(200).json({
      data: user,
    });
  } catch (e) {
    console.log(e);
    new Error(e.stack);
  }
};

exports.deleteAccount = async (req) => {
  try {
    const id = req.user.id;
    await User.findByIdAndDelete(id);
    return true;
  } catch (e) {
    console.log(e);
    new Error(e.stack);
  }
};

exports.editAccount = async (req, res) => {
  try {
    const user = req.user;
    const { username } = req.body;

    if (!req.files) {
      await User.findOneAndUpdate(
        { _id: user.id },
        {
          username: username,
        },
        {
          returnDocument: true,
        }
      );
      const updatedUserProfile = await User.findOne({ _id: user.id });
      res.status(200).json({
        success: true,
        response: updatedUserProfile,
      });
    } else {
      const cloudinarizedPhoto = await uploadFileResponse(
        req.files.profilePhoto
      );
      await user.updateOne(
        {
          $push: {
            profilePhoto: {
              date: new Date(),
              link: cloudinarizedPhoto,
            },
          },
          $set: {
            username: username,
          },
        },
        {
          returnDocument: true,
        },

        async (err, done) => {
          const updatedUserProfile = await User.findOne({ _id: user.id });
          res.status(200).json({
            status: "Success",
            response: updatedUserProfile,
          });
        }
      );
    }
  } catch (e) {
    console.log(e);
    new Error(e.stack);
  }
};
