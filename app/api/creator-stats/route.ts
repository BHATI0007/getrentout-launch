import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Only expose first names — referred people's full contact stays private.
const firstName = (name: string | null) => (name ?? "").trim().split(/\s+/)[0] || "Someone";

// Rate limit code lookups to slow enumeration.
const recent = new Map<string, number[]>();
function rateLimited(req: NextRequest): boolean {
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter(t => now - t < 10 * 60 * 1000);
  if (hits.length >= 30) { recent.set(ip, hits); return true; }
  hits.push(now); recent.set(ip, hits);
  if (recent.size > 5000) recent.clear();
  return false;
}

export async function GET(req: NextRequest) {
  if (rateLimited(req)) {
    return NextResponse.json({ error: "Too many lookups. Try again later." }, { status: 429 });
  }

  const raw = req.nextUrl.searchParams.get("code");
  if (!raw) return NextResponse.json({ error: "Missing code" }, { status: 400 });
  const code = raw.trim().toUpperCase();

  const { data: creator } = await supabase
    .from("creators")
    .select("code, name, status")
    .eq("code", code)
    .single();

  if (!creator) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: referrals } = await supabase
    .from("creator_referrals")
    .select("referred_name, city, converted, created_at")
    .eq("creator_code", code)
    .order("created_at", { ascending: false });

  const list = (referrals ?? []).map(r => ({
    name: firstName(r.referred_name),
    city: r.city ?? "",
    converted: !!r.converted,
    date: r.created_at,
  }));

  return NextResponse.json({
    name: firstName(creator.name),
    code: creator.code,
    status: creator.status,
    totalReferrals: list.length,
    convertedReferrals: list.filter(r => r.converted).length,
    referrals: list,
  });
}
