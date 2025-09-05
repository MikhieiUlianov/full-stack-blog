import express from "express";
import { getUserSavedPosts, savePost } from "../controllers/user.js";

const router = express.Router();

router.get("/saved", getUserSavedPosts);
router.patch("/save", savePost);

export default router;
