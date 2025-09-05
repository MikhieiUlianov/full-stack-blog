import mongoose, { Schema, Types } from "mongoose";

const userSchema = new Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    img: {
      type: String,
    },
    savedPosts: {
      type: Array,
      default: [],
    },
    _id: {
      type: Types.ObjectId,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
