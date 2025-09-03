import { Request, Response } from "express";
import { Webhook } from "svix";

import User from "../models/user.js";

interface ClerkUserData {
  id: string;
  username?: string;
  profile_img_url?: string;
  email_addresses?: { email_address: string }[];
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface SvixEvent<T = any> {
  type: string;
  data: T;
  id: string;
  version?: string;
  created_at?: number;
}

export const clerkWebHook = async (req: Request, res: Response) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) throw new Error("Webhook secret needed!");

  const payload = req.body;
  const headers = req.headers as Record<string, string>;
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: SvixEvent<ClerkUserData>;

  try {
    evt = wh.verify(payload, headers) as SvixEvent<ClerkUserData>;
  } catch {
    return res.status(400).json({ message: "Webhook verification failed." });
  }

  const userData = {
    username: evt.data.username || evt.data.email_addresses?.[0]?.email_address,
    email: evt.data.email_addresses?.[0]?.email_address,
    img: evt.data.profile_img_url,
  };

  if (evt.type === "user.created") {
    const newUser = new User({
      clerkUserId: evt.data.id,
      ...userData,
    });
    await newUser.save();
  }

  /*   if (evt.type === "user.updated") {
    await User.updateOne({ clerkUserId: evt.data.id }, { ...userData });
  }
 */
  if (evt.type === "user.deleted") {
    await User.deleteOne({ clerkUserId: evt.data.id });
  }

  res.status(200).json({ message: "Webhook received" });
};
