import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const ADMIN_SECRET = process.env.ADMIN_SECRET;

// Full-detail export (includes phone/email) — the payload you convert into the app.
// Auth: x-admin-secret header OR ?secret= (so you can open it straight in a browser).
export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-admin-secret") ?? req.nextUrl.searchParams.get("secret");
  if (!ADMIN_SECRET || auth !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const one = req.nextUrl.searchParams.get("code");

  // Fetch creators (one, or all)
  let cq = supabase.from("creators").select("*");
  if (one) cq = cq.eq("code", one.trim().toUpperCase());
  const { data: creators, error: cErr } = await cq;
  if (cErr) return NextResponse.json({ error: "Query failed", detail: cErr.message }, { status: 500 });
  if (!creators || creators.length === 0) {
    return NextResponse.json({ error: "No creators found" }, { status: 404 });
  }

  // Fetch all their referrals in one query, then group per creator.
  const codes = creators.map(c => c.code);
  const { data: refs } = await supabase
    .from("creator_referrals")
    .select("*")
    .in("creator_code", codes)
    .order("created_at", { ascending: true });

  const byCode: Record<string, unknown[]> = {};
  for (const r of refs ?? []) {
    (byCode[r.creator_code] ??= []).push(r);
  }

  const files = creators.map(c => ({
    filename: `creator_${c.code}.json`,
    creator: c,
    referrals: byCode[c.code] ?? [],
    total_referrals: (byCode[c.code] ?? []).length,
  }));

  // Single creator → return just that file object so it saves cleanly on its own.
  if (one) {
    const headers = { "Content-Disposition": `attachment; filename="creator_${one.trim().toUpperCase()}.json"` };
    return NextResponse.json(files[0], { headers });
  }

  return NextResponse.json({ exportedAt: new Date().toISOString(), count: files.length, files });
}
