import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

function genCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, city, category, referredBy } = await req.json();
    if (!name || !email || !city) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
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
    const { error: insertErr } = await supabase.from("provider_applications").insert({
      name, email, city, category,
      position,
      referral_code: referralCode,
      referred_by: referredBy ?? null,
      referral_count: 0,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    if (insertErr) {
      return NextResponse.json({ error: "Insert failed", detail: insertErr.message });
    }

    // Boost referrer +5 spots (lower position = better)
    if (referredBy) {
      const { data: referrer } = await supabase
        .from("provider_applications")
        .select("id, position, referral_count")
        .eq("referral_code", referredBy)
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
