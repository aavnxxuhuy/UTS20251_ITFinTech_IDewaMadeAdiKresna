import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { createUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, phone, password, confirmPassword } = await req.json();

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    const user = await createUser({ name, email, password, phone });
    return NextResponse.json({ success: true, user: { id: user._id, email: user.email } });
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json({ error: err.message || "Register failed" }, { status: 400 });
  }
}