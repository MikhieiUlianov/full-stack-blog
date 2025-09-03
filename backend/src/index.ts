import dotenv from "dotenv";

import express, { NextFunction, Request, Response } from "express";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";

import userRouter from "./routes/user.js";
import postRouter from "./routes/post.js";
import commentRouter from "./routes/comment.js";
import webHooksRouter from "./routes/webhook.js";

import connectDB from "./lib/connectDB.js";

interface CustomError extends Error {
  status?: number;
}

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);
dotenv.config();
app.use(clerkMiddleware() as unknown as express.RequestHandler);
app.use("/webhooks", webHooksRouter);
app.use(express.json());

app.use("/users", userRouter);
app.use("/comments", commentRouter);
app.use("/posts", postRouter);

app.use(
  (error: CustomError, req: Request, res: Response, next: NextFunction) => {
    res.status(error.status || 500);

    res.json({
      message: error instanceof Error ? error.message : "Something went wrong",
      status: error.status,
      stack: error.stack,
    });
  }
);
//CHECK KEYS
app.listen(3000, () => {
  /*   connectDB(); */
  console.log("connect");
});
