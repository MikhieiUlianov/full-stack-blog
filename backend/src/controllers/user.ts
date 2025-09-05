import User from "../models/user.js";
import { Response } from "express";
import { AuthRequest } from "./post.js";

export const getUserSavedPosts = async (req: AuthRequest, res: Response) => {
  const clerkUserId = req.auth?.userId;

  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }

  const user = await User.findOne({ clerkUserId });

  if (!user) throw new Error("User not found.");

  res.status(200).json(user.savedPosts);
};

export const savePost = async (req: AuthRequest, res: Response) => {
  const clerkUserId = req.auth?.userId;
  const postId = req.body.postId;

  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }

  const user = await User.findOne({ clerkUserId });

  if (!user) throw new Error("User not found.");

  const isSaved = user.savedPosts.some((p) => p === postId);

  if (!isSaved) {
    await User.findByIdAndUpdate(user._id, {
      $push: { savedPosts: postId },
    });
  } else {
    await User.findByIdAndUpdate(user._id, {
      $pull: { savedPosts: postId },
    });
  }

  res.status(200).json(isSaved ? "Post unsaved" : "Post saved");
};
