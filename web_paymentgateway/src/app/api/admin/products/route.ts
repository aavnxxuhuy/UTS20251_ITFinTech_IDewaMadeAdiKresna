// app/api/admin/products/route.ts
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

export async function GET() {
  await dbConnect();
  const products = await Product.find({}).lean();
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  try {
    requireAdmin(req);
    await dbConnect();
    const body = await req.json();
    if (!body.name || !body.price) return NextResponse.json({ error: "name & price required" }, { status: 400 });
    const p = await Product.create({
      name: body.name,
      price: Number(body.price),
      description: body.description || "",
      category: body.category || "Makanan Ringan",
      image: body.image || "",
    });
    return NextResponse.json(p);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}
