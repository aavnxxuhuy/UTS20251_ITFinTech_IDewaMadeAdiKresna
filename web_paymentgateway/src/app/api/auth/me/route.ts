// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.split(";").map(s=>s.trim()).find(s=>s.startsWith("token="));
    const token = match ? match.split("=")[1] : null;
    if (!token) return NextResponse.json({ user: null });

    const payload: any = verifyToken(token);
    if (!payload) return NextResponse.json({ user: null });

    const user = await User.findById(payload.sub).select("-password -mfaCode -mfaExpires").lean();
    return NextResponse.json({ user });
  } catch (err) {
    console.error("me error", err);
    return NextResponse.json({ user: null });
  }
}
