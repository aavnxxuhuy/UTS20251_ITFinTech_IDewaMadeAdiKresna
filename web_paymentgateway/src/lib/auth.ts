// lib/auth.ts
import bcrypt from "bcryptjs";
import dbConnect from "./dbConnect";
import User from "@/models/user";
import { sendWhatsAppOTP } from "@/lib/waService";

export async function createUser({ name, email, password, phone }: { name: string, email: string, password: string, phone?: string }) {
  await dbConnect();
  const exist = await User.findOne({ email });
  if (exist) throw new Error("Email already registered");
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed, phone, isAdmin: false });
  await user.save();
  return user;
}

export async function validatePassword(email: string, password: string) {
  await dbConnect();
  const user = await User.findOne({ email });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;
  return user;
}

export async function generateAndSendMFA(user: any) {
  if (!user.phone) return null;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.mfaCode = otp;
  user.mfaExpires = new Date(Date.now() + 5 * 60 * 1000);
  await user.save();
  await sendWhatsAppOTP(user.phone, otp);
  return otp;
}
