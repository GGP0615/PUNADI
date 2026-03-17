import { createClient } from "@vercel/kv";
import { NextResponse } from "next/server";

const KV_KEY = "punadi:waitlist";

const kv = createClient({
  url: process.env.PUNADI_KV_REST_API_URL!,
  token: process.env.PUNADI_KV_REST_API_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Add to Redis set (deduplicates automatically)
    await kv.sadd(KV_KEY, email.toLowerCase().trim());
    const count = await kv.scard(KV_KEY);

    return NextResponse.json({ success: true, count });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const count = await kv.scard(KV_KEY);
    return NextResponse.json({ count: count ?? 0 });
  } catch {
    // Fallback if KV isn't connected yet
    return NextResponse.json({ count: 0 });
  }
}
