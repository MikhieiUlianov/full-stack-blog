import express from "express";

import {
  getPosts,
  getPost,
  postPost,
  deletePost,
} from "../controllers/postController.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/:slug", getPost);
router.post("/", postPost);
router.delete("/:id", deletePost);

export default router;
