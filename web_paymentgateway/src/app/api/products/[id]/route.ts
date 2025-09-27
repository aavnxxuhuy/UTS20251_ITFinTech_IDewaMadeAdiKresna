import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/products";

export async function GET(req: NextRequest) {
  await dbConnect();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const product = await Product.findById(id).lean();
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest) {
  await dbConnect();
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const body = await req.json();
  const updated = await Product.findByIdAndUpdate(id, body, { new: true });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}