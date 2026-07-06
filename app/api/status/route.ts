import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Best-effort per-instance rate limit to slow down email/code enumeration
const recentByIp = new Map<string, number[]>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 15;

function rateLimited(req: NextRequest): boolean {
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const now = Date.now();
  const hits = (recentByIp.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) { recentByIp.set(ip, hits); return true; }
  hits.push(now);
  recentByIp.set(ip, hits);
  if (recentByIp.size > 5000) recentByIp.clear();
  return false;
}

// Only ever expose the first name — full names stay private
const firstName = (name: string | null) => (name ?? "").trim().split(/\s+/)[0] || "there";

export async function POST(req: NextRequest) {
  if (rateLimited(req)) {
    return NextResponse.json({ error: "Too many lookups. Try again later." }, { status: 429 });
  }
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("provider_applications")
    .select("name, position, referral_count, referral_code")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    name: firstName(data.name),
    position: data.position,
    referralCount: data.referral_count ?? 0,
    referralCode: data.referral_code,
  });
}

export async function GET(req: NextRequest) {
  if (rateLimited(req)) {
    return NextResponse.json({ error: "Too many lookups. Try again later." }, { status: 429 });
  }
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const { data, error } = await supabase
    .from("provider_applications")
    .select("name, position, referral_count, referral_code")
    .eq("referral_code", code.toUpperCase())
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: firstName(data.name),
    position: data.position,
    referralCount: data.referral_count ?? 0,
    referralCode: data.referral_code,
  });
}
