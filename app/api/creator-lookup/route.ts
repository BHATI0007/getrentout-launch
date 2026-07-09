import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const recent = new Map<string, number[]>();
function limited(req: NextRequest): boolean {
  const ip = (req.headers.get("x-forwarded-for") ?? "?").split(",")[0].trim();
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter(t => now - t < 600000);
  if (hits.length >= 10) { recent.set(ip, hits); return true; }
  hits.push(now); recent.set(ip, hits);
  return false;
}

// One email in → either their dashboard code (registered creator) or an
// interest record (we invite them later). Never reveals which emails exist
// beyond the creator's own lookup.
export async function POST(req: NextRequest) {
  if (limited(req)) return NextResponse.json({ error: "Too many tries. Try later." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  const { data: creator } = await supabase
    .from("creators").select("code, status").eq("email", email).maybeSingle();
  if (creator && creator.status === "active") {
    return NextResponse.json({ registered: true, code: creator.code });
  }

  // Not a creator yet — record interest (fail-quiet if table not migrated).
  await supabase.from("creator_interest").upsert({ email }, { onConflict: "email" });
  return NextResponse.json({ registered: false, interested: true });
}
