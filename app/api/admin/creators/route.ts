import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function unauthorized(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-secret");
  return !ADMIN_SECRET || auth !== ADMIN_SECRET;
}

// POST: invite/add a creator (invite-only program — you approve each one).
export async function POST(req: NextRequest) {
  if (unauthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, code: rawCode, phone, email, upi_id, pan, instagram, notes } = body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  // Vanity code: letters/digits only, uppercased. e.g. RIYA, ARJUN01
  const code = String(rawCode ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9]{3,20}$/.test(code)) {
    return NextResponse.json({ error: "code must be 3–20 letters/digits" }, { status: 400 });
  }

  const { data: existing } = await supabase.from("creators").select("code").eq("code", code).single();
  if (existing) return NextResponse.json({ error: "That code is already taken" }, { status: 409 });

  // Guard against collision with a waitlist member's auto-generated referral code —
  // otherwise a signup under this code would both boost that member AND credit the creator.
  const { data: waitlistClash } = await supabase
    .from("provider_applications")
    .select("id")
    .eq("referral_code", code)
    .single();
  if (waitlistClash) {
    return NextResponse.json({ error: "That code collides with an existing waitlist referral code — pick another" }, { status: 409 });
  }

  const baseCreator = {
    code,
    name: name.trim(),
    phone: phone ?? null,
    email: email ? String(email).toLowerCase().trim() : null,
    upi_id: upi_id ?? null,
    instagram: instagram ?? null,
    notes: notes ?? null,
    status: "active",
  };
  let { error } = await supabase.from("creators").insert({ ...baseCreator, pan: pan ? String(pan).trim().toUpperCase() : null });

  // `pan` column may not exist yet if the latest migration hasn't been run — fall back.
  if (error?.code === "42703") {
    ({ error } = await supabase.from("creators").insert(baseCreator));
  }

  if (error) return NextResponse.json({ error: "Insert failed", detail: error.message }, { status: 500 });

  return NextResponse.json({
    success: true,
    code,
    referralLink: `https://getrentout.me?ref=${code}`,
    dashboard: `https://getrentout.me/creator/${code}`,
  });
}

// GET: list all creators with their referral counts (via the creator_summary view).
export async function GET(req: NextRequest) {
  if (unauthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("creator_summary")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Query failed", detail: error.message }, { status: 500 });
  return NextResponse.json({ creators: data ?? [] });
}
