// app/api/admin/products/[id]/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/products";
import { verifyToken } from "@/lib/jwt";

function requireAdmin(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.split(";").map(s=>s.trim()).find(s=>s.startsWith("token="));
  const token = match ? match.split("=")[1] : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload || (payload as any).role !== "admin") throw new Error("Unauthorized");
}

export async function PATCH(req: Request) {
  try {
    requireAdmin(req);
    await dbConnect();
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    const body = await req.json();
    const updated = await Product.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(req: Request) {
  try {
    requireAdmin(req);
    await dbConnect();
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}
