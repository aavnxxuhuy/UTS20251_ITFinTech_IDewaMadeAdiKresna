// app/api/admin/summary/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/products";
import Order from "@/models/orders";
import { verifyToken } from "@/lib/jwt";

function requireAdmin(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie
    .split(";")
    .map(s => s.trim())
    .find(s => s.startsWith("token="));
  const token = match ? match.split("=")[1] : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload || (payload as any).role !== "admin") throw new Error("Unauthorized");
}

export async function GET(req: Request) {
  try {
    requireAdmin(req);
    await dbConnect();

    const url = new URL(req.url);
    const start = url.searchParams.get("start"); // format: yyyy-mm-dd
    const end = url.searchParams.get("end");

    const totalProducts = await Product.countDocuments();

    let orderFilter: any = {};
    if (start || end) {
      orderFilter.createdAt = {};
      if (start) orderFilter.createdAt.$gte = new Date(start);
      if (end) orderFilter.createdAt.$lte = new Date(end);
    }

    // Populate user (name + email) dan items.productId (name + price)
    const orders = await Order.find(orderFilter)
      .populate("user", "name email")
      .populate("items.productId", "name price")
      .lean();

    // Hitung jumlah order per status
    const orderStatusCounts: Record<string, number> = {};
    orders.forEach(o => {
      orderStatusCounts[o.status] = (orderStatusCounts[o.status] || 0) + 1;
    });

    // Total revenue dari order PAID
    const totalRevenue = orders
      .filter(o => o.status === "PAID")
      .reduce((sum, o) => sum + o.total, 0);

    return NextResponse.json({ totalProducts, orderStatusCounts, totalRevenue, orders });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}
