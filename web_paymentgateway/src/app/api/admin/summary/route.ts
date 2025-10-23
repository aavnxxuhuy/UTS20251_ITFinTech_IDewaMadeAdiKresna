// app/api/admin/summary/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/products";
import Order from "@/models/orders";
import { verifyToken } from "@/lib/jwt";

function requireAdmin(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.split(";").map(s=>s.trim()).find(s=>s.startsWith("token="));
  const token = match ? match.split("=")[1] : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload || (payload as any).role !== "admin") throw new Error("Unauthorized");
}

export async function GET(req: Request) {
  try {
    requireAdmin(req);
    await dbConnect();
    const totalProducts = await Product.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "PENDING" });
    const totalRevenueAgg = await Order.aggregate([
      { $match: { status: "PAID" } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalRevenue = (totalRevenueAgg[0]?.total) || 0;

    return NextResponse.json({ totalProducts, pendingOrders, totalRevenue });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}
