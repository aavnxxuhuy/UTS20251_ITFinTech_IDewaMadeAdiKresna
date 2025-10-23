import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { validatePassword, generateAndSendMFA } from "@/lib/auth";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email & password required" }, { status: 400 });

    const user = await validatePassword(email, password);
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    // if user has phone -> generate OTP and require MFA
    if (user.phone) {
      await generateAndSendMFA(user);
      // respond mfaRequired; do NOT set token yet
      return NextResponse.json({ mfaRequired: true, email: user.email });
    }

    // no phone -> issue token immediately and set cookie
    const token = signToken({ sub: user._id, role: user.isAdmin ? "admin" : "buyer", email: user.email }, "7d");
    const res = NextResponse.json({ success: true });
    // set httpOnly cookie
    res.headers.set('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7*24*60*60}`);
    return res;
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
