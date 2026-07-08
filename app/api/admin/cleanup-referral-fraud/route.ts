import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Protect with a secret token — set ADMIN_SECRET in Vercel env vars
const ADMIN_SECRET = process.env.ADMIN_SECRET;

// One-time cleanup for referral fraud: deletes all signups referred by a
// given code and resets that account's referral count. Always run with
// dryRun: true first — it reports what would be deleted without touching
// anything (email domains only, no full addresses).
export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-admin-secret");
  if (!ADMIN_SECRET || auth !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { referrerCode, dryRun = true } = await req.json();
  if (!referrerCode || typeof referrerCode !== "string") {
    return NextResponse.json({ error: "referrerCode is required" }, { status: 400 });
  }
  const code = referrerCode.trim().toUpperCase();

  const { data: rows, error: fetchErr } = await supabase
    .from("provider_applications")
    .select("id, email, created_at")
    .eq("referred_by", code);

  if (fetchErr) {
    return NextResponse.json({ error: "Fetch failed", detail: fetchErr.message }, { status: 500 });
  }

  const domains: Record<string, number> = {};
  let earliest: string | null = null, latest: string | null = null;
  for (const r of rows ?? []) {
    const d = (r.email ?? "").split("@")[1] ?? "unknown";
    domains[d] = (domains[d] ?? 0) + 1;
    if (!earliest || r.created_at < earliest) earliest = r.created_at;
    if (!latest || r.created_at > latest) latest = r.created_at;
  }
  // If this code is also a CREATOR code, count their referral rows so fraud cleanup
  // covers the commission side too (otherwise fake sign-ups keep inflating a creator).
  const { count: creatorRefCount } = await supabase
    .from("creator_referrals")
    .select("*", { count: "exact", head: true })
    .eq("creator_code", code);

  const summary = {
    referrerCode: code,
    matchedRows: rows?.length ?? 0,
    creatorReferralRows: creatorRefCount ?? 0,
    emailDomains: Object.fromEntries(Object.entries(domains).sort((a, b) => b[1] - a[1]).slice(0, 15)),
    createdBetween: [earliest, latest],
  };

  if (dryRun) {
    return NextResponse.json({ dryRun: true, ...summary });
  }

  const { error: delErr } = await supabase
    .from("provider_applications")
    .delete()
    .eq("referred_by", code);
  if (delErr) {
    return NextResponse.json({ error: "Delete failed", detail: delErr.message }, { status: 500 });
  }

  // Purge the matching creator-commission rows too, so the creator's count/earnings
  // reset alongside the waitlist cleanup.
  const { error: crefErr } = await supabase
    .from("creator_referrals")
    .delete()
    .eq("creator_code", code);

  const { error: updErr } = await supabase
    .from("provider_applications")
    .update({ referral_count: 0 })
    .eq("referral_code", code);

  return NextResponse.json({
    dryRun: false,
    ...summary,
    deleted: rows?.length ?? 0,
    creatorReferralsDeleted: crefErr ? `error: ${crefErr.message}` : (creatorRefCount ?? 0),
    referrerCountReset: !updErr,
  });
}
