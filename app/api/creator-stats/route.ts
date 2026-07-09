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

  let acceptedTerms: boolean | null = null; // null = column not migrated yet, hide the banner
  const first = await supabase
    .from("creators")
    .select("code, name, status, accepted_terms_at")
    .eq("code", code)
    .single();
  let creator = first.data;
  const cErr = first.error;

  // accepted_terms_at may not exist before the latest migration — retry without it.
  // (42703 = Postgres missing column; PGRST204 = PostgREST schema-cache miss.)
  if (cErr?.code === "42703" || cErr?.code === "PGRST204") {
    ({ data: creator } = await supabase
      .from("creators")
      .select("code, name, status")
      .eq("code", code)
      .single());
  } else if (creator) {
    acceptedTerms = !!(creator as { accepted_terms_at?: string | null }).accepted_terms_at;
  }

  if (!creator) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // select * so commission-lifecycle columns are included when migrated (and
  // absent-but-harmless when not) — avoids schema-cache errors entirely.
  const { data: referrals } = await supabase
    .from("creator_referrals")
    .select("*")
    .eq("creator_code", code)
    .order("created_at", { ascending: false });

  const list = (referrals ?? []).map(r => ({
    name: firstName(r.referred_name),
    city: r.city ?? "",
    converted: !!r.converted,
    date: r.created_at,
  }));

  // Confirmed + paid commission (USD). 0 until bookings start post-launch.
  let totalEarnedUsd = 0, pendingUsd = 0;
  for (const r of referrals ?? []) {
    const s = (r as { status?: string }).status;
    const c = Number((r as { commission_usd?: number }).commission_usd ?? 0);
    if (c > 0 && (s === "confirmed" || s === "paid")) totalEarnedUsd += c;
    if (c > 0 && s === "booked_pending") pendingUsd += c;
  }

  return NextResponse.json({
    name: firstName(creator.name),
    code: creator.code,
    status: creator.status,
    totalReferrals: list.length,
    convertedReferrals: list.filter(r => r.converted).length,
    acceptedTerms,
    totalEarnedUsd,
    pendingUsd,
    referrals: list,
  });
}
