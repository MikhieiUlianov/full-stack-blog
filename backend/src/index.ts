import dotenv from "dotenv";
dotenv.config();

import express from "express";

import userRouter from "./routes/user.js";
import postRouter from "./routes/post.js";
import commentRouter from "./routes/comment.js";
import connectDB from "./lib/connectDB.js";

const app = express();

app.use("/users", userRouter);
app.use("/comments", commentRouter);
app.use("/posts", postRouter);

app.listen(3000, () => {
  /*   connectDB(); */
  console.log("connect");
});
