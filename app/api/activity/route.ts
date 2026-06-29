import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET() {
  const { data } = await supabase
    .from("provider_applications")
    .select("name, city, created_at")
    .order("created_at", { ascending: false })
    .limit(12);

  return NextResponse.json({
    activity: (data ?? []).map(r => ({
      firstName: r.name.split(" ")[0],
      city: r.city,
      ago: Math.round((Date.now() - new Date(r.created_at).getTime()) / 60000),
    })),
  });
}
