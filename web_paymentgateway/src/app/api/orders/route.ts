import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/orders";
import User from "@/models/user";
import { verifyToken } from "@/lib/jwt";

async function getUserFromCookie(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const tokenPair = cookie.split(";").map(s => s.trim()).find(s => s.startsWith("token="));
  const token = tokenPair ? tokenPair.split("=")[1] : null;
  if (!token) return null;

  const payload: any = verifyToken(token);
  if (!payload) return null;

  const user = await User.findById(payload.sub).select("_id name email isAdmin");
  return user;
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromCookie(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const query = user.isAdmin ? {} : { user: user._id };

    const orders = await Order.find(query)
      .populate("user", "name email") // optional: tampilkan siapa yang pesan (penting untuk admin)
      .populate("items.productId", "name image price")
      .sort({ createdAt: -1 });

    const formatted = orders.map(order => ({
      id: order._id,
      orderId: order.orderId,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      user: user.isAdmin
        ? {
            name: order.user?.name || "Unknown",
            email: order.user?.email || "",
          }
        : undefined,
      items: order.items.map((item: any) => ({
        name: item.productId?.name || "Produk tidak ditemukan",
        image: item.productId?.image || "",
        price: item.price,
        quantity: item.quantity,
      })),
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Orders fetch error:", err);
    return NextResponse.json({ error: "Gagal mengambil data pesanan" }, { status: 500 });
  }
}
