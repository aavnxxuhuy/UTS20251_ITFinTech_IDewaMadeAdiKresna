// app/api/users/route.js
import clientPromise from "@/lib/mongodb.js";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const users = await db.collection("users").find({}).toArray();

    return Response.json(users);
  } catch (e) {
    console.error(e);
    return new Response("Internal Server Error", { status: 500 });
  }
}
