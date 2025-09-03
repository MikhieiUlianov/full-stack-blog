import { Request, Response } from "express";
import Post from "../models/post.js";
import User from "../models/user.js";

interface AuthRequest extends Request {
  auth?: {
    userId?: string;
  };
}
export const getPosts = async (req: Request, res: Response) => {
  const posts = await Post.find();
  res.status(200).send(posts);
};

export const getPost = async (req: Request, res: Response) => {
  const posts = await Post.findOne({ slug: req.params.slug });
  res.status(200).send(posts);
};

export const postPost = async (req: AuthRequest, res: Response) => {
  const clerkUserId = req.auth?.userId;

  if (!clerkUserId)
    return res.status(401).json({ message: "Not authenticated." });
  const user = await User.findOne({ clerkUserId });

  if (!user) return res.status(401).json({ message: "User not found." });

  const newPost = new Post({ user: user._id, ...req.body });
  const post = await newPost.save();
  res.status(200).json(post);
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  const clerkUserId = req.auth?.userId;

  if (!clerkUserId)
    return res.status(401).json({ message: "Not authenticated." });

  const user = await User.findOne({ clerkUserId });

  if (!user) return res.status(401).json({ message: "User not found." });

  const post = await Post.findOneAndDelete({
    _id: req.params.id,
    user: user._id,
  });
  res.status(200).json("Post has been deleted");
};
