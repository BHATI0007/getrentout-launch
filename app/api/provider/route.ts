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

// Total early-access cap. Beyond this, referrals no longer apply.
const TOTAL_SPOTS = 100000;

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
    const { name, email: rawEmail, city, category, referredBy, source: rawSource, website, phone: rawPhone } = body;

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
    // Keep only digits and a leading +, cap length. Stored for the app to match on later.
    const phone = typeof rawPhone === "string" ? rawPhone.replace(/[^\d+]/g, "").slice(0, 16) : "";

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
    // Phone / WhatsApp is required — it's the key the app matches referrals on later.
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      return NextResponse.json({ error: "Please enter a valid phone or WhatsApp number" }, { status: 400 });
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
      // If they're already a creator, hand back their dashboard code too.
      const { data: c } = await supabase.from("creators").select("code").eq("email", email).maybeSingle();
      return NextResponse.json({
        success: true,
        duplicate: true,
        position: existing.position,
        referralCode: existing.referral_code,
        creatorCode: c?.code ?? null,
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
    let { error: insertErr } = await supabase.from("provider_applications").insert({ ...baseRow, source, phone: phone || null });

    // The `source`/`phone` columns may not exist yet if the migration hasn't been run —
    // fall back to inserting core fields so signups never break because of this.
    // Postgres reports a missing column as 42703; Supabase's REST layer (PostgREST)
    // reports it as PGRST204 (schema-cache miss) — handle both.
    const missingColumn = (c?: string) => c === "42703" || c === "PGRST204";
    if (missingColumn(insertErr?.code)) {
      // Try keeping phone (only `source` missing), then bare core fields.
      ({ error: insertErr } = await supabase.from("provider_applications").insert({ ...baseRow, phone: phone || null }));
      if (missingColumn(insertErr?.code)) {
        ({ error: insertErr } = await supabase.from("provider_applications").insert(baseRow));
      }
    }

    if (insertErr) {
      return NextResponse.json({ error: "Insert failed", detail: insertErr.message });
    }

    // Referrals only apply within the 100k early-access cap. Once the waitlist is full,
    // new signups no longer earn referral credit (waitlist boost or creator commission).
    const referralsOpen = referredBy && position <= TOTAL_SPOTS;

    // Boost referrer +5 spots (lower position = better)
    if (referralsOpen) {
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

    // If the referral code belongs to an approved CREATOR (invite-only program),
    // also log this person under that creator. This is separate from the waitlist
    // queue-jump above — it feeds the 5%-commission tracking that the app credits later.
    if (referralsOpen) {
      const creatorCode = String(referredBy).trim().toUpperCase();
      const { data: creator } = await supabase
        .from("creators")
        .select("code, status")
        .eq("code", creatorCode)
        .single();

      if (creator && creator.status === "active") {
        // Dedup by phone: one person (one phone) can only be credited to one creator,
        // ever. Prevents the same person signing up under multiple creators (or a
        // creator self-referring with new emails) from being counted more than once.
        const { data: dupePhone } = await supabase
          .from("creator_referrals")
          .select("id")
          .eq("referred_phone", phone)
          .limit(1);

        if (!dupePhone || dupePhone.length === 0) {
          await supabase.from("creator_referrals").insert({
            creator_code: creator.code,
            referred_name: cleanName,
            referred_phone: phone, // required + validated above, always present
            referred_email: email,
            city: cleanCity,
          });
        }
      }
    }

    // Creator-invite signups become creators AUTOMATICALLY — no manual approval.
    // They get a personal code + dashboard the moment they join.
    let creatorCode: string | null = null;
    if (source === "creator_outreach") {
      const base = cleanName.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6) || "CREATOR";
      for (let i = 0; i < 3 && !creatorCode; i++) {
        const cand = i === 0 ? `${base}${Math.floor(10 + Math.random() * 90)}` : genCode();
        // Must not collide with an existing creator code OR a waitlist referral code.
        const [{ data: c1 }, { data: c2 }] = await Promise.all([
          supabase.from("creators").select("code").eq("code", cand).maybeSingle(),
          supabase.from("provider_applications").select("id").eq("referral_code", cand).maybeSingle(),
        ]);
        if (!c1 && !c2) {
          const { error: cInsErr } = await supabase.from("creators").insert({
            code: cand, name: cleanName, phone: phone || null, email,
            status: "active", notes: "auto-created via creator_outreach signup",
          });
          if (!cInsErr) creatorCode = cand;
        }
      }
    }

    return NextResponse.json({ success: true, position, referralCode, creatorCode });
  } catch (err) {
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 });
  }
}
