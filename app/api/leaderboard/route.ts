import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("provider_applications")
    .select("name, city, referral_count, referral_code, position")
    .order("referral_count", { ascending: false })
    .order("position", { ascending: true })
    .gt("referral_count", 0)
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    leaders: (data ?? []).map((r, i) => ({
      rank: i + 1,
      firstName: r.name.split(" ")[0],
      city: r.city,
      referralCount: r.referral_count ?? 0,
      referralCode: r.referral_code,
    })),
  });
}
