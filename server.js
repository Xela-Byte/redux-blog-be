const cors = require("cors");
require("dotenv").config();
const express = require("express");
const fileUpload = require("express-fileupload");
const { connectToDB } = require("./config/database");
const authRouter = require("./routes/userRoutes");
const postRouter = require("./routes/postRoutes");

const app = express();

const whitelist = [];

app.use(
  cors({
    origin: whitelist,
    method: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));
app.use("/auth", authRouter);
app.use("/posts", postRouter);

const PORT = process.env.PORT || 5000;
const setUpServer = () => {
  connectToDB("redux-blog-be", () => {
    app.listen(PORT, () => {
      console.log(`Connected to port ${PORT} successfully`);
    });
  });
};

setUpServer();
