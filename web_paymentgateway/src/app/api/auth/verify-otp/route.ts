import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, otp } = await req.json();
    if (!email || !otp) return NextResponse.json({ error: "email & otp required" }, { status: 400 });

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (!user.mfaCode || !user.mfaExpires || user.mfaExpires < new Date() || user.mfaCode !== otp) {
      return NextResponse.json({ error: "OTP invalid or expired" }, { status: 401 });
    }

    // clear otp
    user.mfaCode = undefined;
    user.mfaExpires = undefined;
    await user.save();

    // create token
    const token = signToken({ sub: user._id, role: user.isAdmin ? "admin" : "buyer", email: user.email }, "7d");
    const res = NextResponse.json({ success: true });
    res.headers.set('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7*24*60*60}`);
    return res;
  } catch (err: any) {
    console.error("verify-otp error:", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
