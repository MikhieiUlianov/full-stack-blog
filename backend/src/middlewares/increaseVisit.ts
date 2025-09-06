import Post from "../models/post.js";
import { AuthRequest } from "../controllers/post.js";
import { Response, NextFunction } from "express";

const increaseVisit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const slug = req.params.slig;

  await Post.findOneAndUpdate({ slug }, { $inc: { visit: 1 } });

  next();
};

export default increaseVisit;
