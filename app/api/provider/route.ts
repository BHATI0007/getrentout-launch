import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

function genCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

// Common disposable-email domains used by signup bots
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "sharklasers.com",
  "10minutemail.com", "10minutemail.net", "temp-mail.org", "tempmail.com",
  "tempmail.net", "tempmail.dev", "throwawaymail.com", "yopmail.com",
  "yopmail.net", "getnada.com", "nada.email", "dispostable.com", "maildrop.cc",
  "mintemail.com", "mohmal.com", "trashmail.com", "trashmail.de", "fakeinbox.com",
  "mailnesia.com", "tempinbox.com", "emailondeck.com", "spamgourmet.com",
  "mytemp.email", "burnermail.io", "inboxkitten.com", "mail-temp.com",
  "moakt.com", "tmpmail.org", "tmpmail.net", "disposablemail.com",
  "temporary-mail.net", "mail7.io", "1secmail.com", "1secmail.org", "1secmail.net",
  "wwjmp.com", "esiix.com", "xojxe.com", "yoggm.com",
]);

// Best-effort per-instance rate limit (resets on cold start, but stops naive loops)
const recentByIp = new Map<string, number[]>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 3;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recentByIp.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) { recentByIp.set(ip, hits); return true; }
  hits.push(now);
  recentByIp.set(ip, hits);
  if (recentByIp.size > 5000) recentByIp.clear();
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email: rawEmail, city, category, referredBy, source: rawSource, website } = body;

    // Honeypot: real users never fill this hidden field. Pretend success so bots don't adapt.
    if (website) {
      return NextResponse.json({ success: true, position: 0, referralCode: genCode() });
    }

    if (!name || !rawEmail || !city) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const email = String(rawEmail).toLowerCase().trim();
    const cleanName = String(name).trim();
    const cleanCity = String(city).trim();
    const source = typeof rawSource === "string" && /^[a-z0-9_]{1,40}$/.test(rawSource) ? rawSource : null;

    if (!EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    const domain = email.split("@")[1];
    if (DISPOSABLE_DOMAINS.has(domain)) {
      return NextResponse.json({ error: "Please use a permanent email address" }, { status: 400 });
    }
    if (cleanName.length < 2 || cleanName.length > 80 || /https?:\/\//i.test(cleanName)) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (cleanCity.length < 2 || cleanCity.length > 80 || /https?:\/\//i.test(cleanCity)) {
      return NextResponse.json({ error: "Invalid city" }, { status: 400 });
    }

    const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
    if (rateLimited(ip)) {
      return NextResponse.json({ error: "Too many signups from this connection. Try again later." }, { status: 429 });
    }

    // Check duplicate
    const { data: existing } = await supabase
      .from("provider_applications")
      .select("id, referral_code, position")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        position: existing.position,
        referralCode: existing.referral_code,
      });
    }

    // Get position
    const { count } = await supabase
      .from("provider_applications")
      .select("*", { count: "exact", head: true });

    const position = (count ?? 0) + 1;
    const referralCode = genCode();

    // Insert
    const baseRow = {
      name: cleanName, email, city: cleanCity, category,
      position,
      referral_code: referralCode,
      referred_by: referredBy ?? null,
      referral_count: 0,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    let { error: insertErr } = await supabase.from("provider_applications").insert({ ...baseRow, source });

    // The `source` column may not exist yet if the migration hasn't been run —
    // fall back to inserting without it so signups never break because of this.
    if (insertErr?.code === "42703") {
      ({ error: insertErr } = await supabase.from("provider_applications").insert(baseRow));
    }

    if (insertErr) {
      return NextResponse.json({ error: "Insert failed", detail: insertErr.message });
    }

    // Boost referrer +5 spots (lower position = better)
    if (referredBy) {
      const { data: referrer } = await supabase
        .from("provider_applications")
        .select("id, position, referral_count")
        .eq("referral_code", String(referredBy).trim().toUpperCase())
        .single();

      if (referrer) {
        await supabase
          .from("provider_applications")
          .update({
            position: Math.max(1, referrer.position - 5),
            referral_count: (referrer.referral_count ?? 0) + 1,
          })
          .eq("id", referrer.id);
      }
    }

    return NextResponse.json({ success: true, position, referralCode });
  } catch (err) {
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 });
  }
}
