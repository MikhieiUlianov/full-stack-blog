import { Request, Response } from "express";
import Post from "../models/post.js";
import User from "../models/user.js";
import Imagekit from "imagekit";

export interface AuthRequest extends Request {
  auth?: {
    userId?: string;
    sessionClaims: {
      metadata: {
        role: "admin" | "user";
      };
    };
  };
}

interface PostQuery {
  category?: string;
  user?: string;
  title?: { $regex: string; $options: string };
  createdAt?: { $gte: Date };
  isFeatured?: boolean;
}
export const getPosts = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 2;

  let query: PostQuery = {};

  const cat = req.query.cat as string | undefined;
  const author = req.query.author as string | undefined;
  const searchQuery = req.query.searchQuery as string | undefined;
  const sortQuery = req.query.sortQuery as string | undefined;
  const featured = req.query.featured as string | undefined;

  if (cat) query.category = cat;
  if (searchQuery) query.title = { $regex: searchQuery, $options: "i" };
  if (author) {
    const user = await User.findOne({ username: author }).select("_id");

    if (!user) return res.status(404).json("No post found!");

    query.user = user._id?.toString();
  }

  type SortObj = Record<string, 1 | -1>;

  let sortObj: SortObj = { createdAt: -1 };

  if (sortQuery) {
    switch (sortQuery) {
      case "newest": //dec
        sortObj = { createdAt: -1 };
        break;
      case "oldest": //inc
        sortObj = { createdAt: 1 };
        break;
      case "popular":
        sortObj = { visit: -1 };
        break;
      case "trending":
        sortObj = { visit: -1 };
        query.createdAt = {
          $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
        };
        break;

      default:
        break;
    }
  }
  if (featured) query.isFeatured = true;

  const posts = await Post.find(query)
    .populate("user", "username")
    .sort(sortObj)
    .limit(limit)
    .skip((page - 1) * limit);
  const totalPosts = await Post.countDocuments();

  const hasMore = page * limit < totalPosts;

  res.status(200).json({ posts, hasMore });
};

export const getPost = async (req: Request, res: Response) => {
  const posts = await Post.findOne({ slug: req.params.slug }).populate(
    "user",
    "username img"
  );
  res.status(200).send(posts);
};

export const createPost = async (req: AuthRequest, res: Response) => {
  const clerkUserId = req.auth?.userId;

  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }

  const user = await User.findOne({ clerkUserId });

  if (!user) {
    return res.status(404).json("User not found!");
  }

  let slug = req.body.title.replace(/ /g, "-").toLowerCase();

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

  const role = req.auth?.sessionClaims.metadata.role || "user";

  if (role === "admin") {
    await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json("Post has been deleted");
  }

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

export const featurePost = async (req: AuthRequest, res: Response) => {
  const clerkUserId = req.auth?.userId;
  const postId = req.body.postId;

  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }

  const role = req.auth?.sessionClaims?.metadata?.role || "user";

  if (role !== "admin") {
    return res.status(403).json("You cannot feature posts!");
  }

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json("Post not found!");
  }

  const isFeatured = post.isFeatured;

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      isFeatured: !isFeatured,
    },
    { new: true }
  );

  res.status(200).json(updatedPost);
};

if (
  !process.env.IK_URL_ENDPOINT ||
  !process.env.IK_PUBLIC_KEY ||
  !process.env.IK_PRIVATE_KEY
) {
  throw new Error("ImageKit environment variables are missing.");
}

const imagekit = new Imagekit({
  urlEndpoint: process.env.IK_URL_ENDPOINT,
  publicKey: process.env.IK_PUBLIC_KEY,
  privateKey: process.env.IK_PRIVATE_KEY,
});

export const uploadAuth = (req: AuthRequest, res: Response) => {
  const authParams = imagekit.getAuthenticationParameters();
  res.send({
    ...authParams,
    publicKey: process.env.IK_PUBLIC_KEY,
  });
};
