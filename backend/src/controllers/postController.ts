import { Request, Response } from "express";
import Post from "../models/post.js";
import User from "../models/user.js";
import Imagekit from "imagekit";

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

  let slug = req.body.title.replaca(/ /g, "-").toLowerCase();
  let existingPost = await Post.findOne({ slug });
  let counter = 2;

  while (existingPost) {
    slug = `${slug}-${counter}`;

    existingPost = await Post.findOne({ slug });

    counter++;
  }

  const newPost = new Post({ user: user._id, slug, ...req.body });
  const post = await newPost.save();
  res.status(200).json(post);
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  const clerkUserId = req.auth?.userId;

  if (!clerkUserId)
    return res.status(401).json({ message: "Not authenticated." });

  const user = await User.findOne({ clerkUserId });

  if (!user) return res.status(401).json({ message: "User not found." });

  const deletePost = await Post.findOneAndDelete({
    _id: req.params.id,
    user: user._id,
  });

  if (!deletePost)
    return res.status(403).json({ message: "You can delete only your post!" });

  res.status(200).json("Post has been deleted");
};
if (
  !process.env.IK_URL_ENDPOINT ||
  !process.env.IK_PUBLIC_KEY ||
  !process.env.IK_PRIVATE_KEY
) {
  console.error("ImageKit environment variables are missing:");
  console.log("IK_URL_ENDPOINT:", process.env.IK_URL_ENDPOINT);
  console.log("IK_PUBLIC_KEY:", process.env.IK_PUBLIC_KEY);
  console.log("IK_PRIVATE_KEY:", process.env.IK_PRIVATE_KEY);
  throw new Error("ImageKit environment variables are missing.");
}

const imagekit = new Imagekit({
  urlEndpoint: process.env.IK_URL_ENDPOINT,
  publicKey: process.env.IK_PUBLIC_KEY,
  privateKey: process.env.IK_PRIVATE_KEY,
});

export const uploadAuth = (req: AuthRequest, res: Response) => {
  const authParams = imagekit.getAuthenticationParameters();
  console.log("Auth params:", authParams);
  res.send({
    ...authParams,
    publicKey: process.env.IK_PUBLIC_KEY,
  });
};
