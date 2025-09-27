// app/api/products/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/products";

export async function GET() {
  await dbConnect();
  const products = await Product.find({}).lean();
  return NextResponse.json(products);
}

export async function POST(req: Request) {
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
}
