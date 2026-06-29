import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { name, email, city, category } = await req.json();
    if (!name || !email || !city || !category) {
      return NextResponse.json({ error: "Missing fields", fields: { name, email, city, category } }, { status: 400 });
    }

    // Check duplicate
    const { data: existing, error: dupErr } = await supabase
      .from("provider_applications")
      .select("id")
      .eq("email", email)
      .single();

    if (dupErr && dupErr.code !== "PGRST116") {
      return NextResponse.json({ error: "Duplicate check failed", detail: dupErr.message });
    }

    if (existing) {
      return NextResponse.json({ success: true, duplicate: true });
    }

    // Get position
    const { count, error: countErr } = await supabase
      .from("provider_applications")
      .select("*", { count: "exact", head: true });

    if (countErr) {
      return NextResponse.json({ error: "Count failed", detail: countErr.message });
    }

    const position = (count ?? 0) + 1;

    // Insert
    const { error: insertErr } = await supabase.from("provider_applications").insert({
      name, email, city, category,
      position,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    if (insertErr) {
      return NextResponse.json({ error: "Insert failed", detail: insertErr.message });
    }

    return NextResponse.json({ success: true, position });
  } catch (err) {
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 });
  }
}
