import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const TOTAL_SPOTS = 100000;

export async function GET() {
  try {
    const { count } = await supabase
      .from("provider_applications")
      .select("*", { count: "exact", head: true });

    const taken = count ?? 0;
    const remaining = TOTAL_SPOTS - taken;

    return NextResponse.json({ total: TOTAL_SPOTS, taken, remaining });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ total: TOTAL_SPOTS, taken: 0, remaining: TOTAL_SPOTS });
  }
}
