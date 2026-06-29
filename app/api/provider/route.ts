import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { name, email, city, category } = await req.json();
    if (!name || !email || !city || !category) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check duplicate
    const { data: existing } = await supabase
      .from("provider_applications")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, duplicate: true });
    }

    // Get position (how many providers signed up so far)
    const { count } = await supabase
      .from("provider_applications")
      .select("*", { count: "exact", head: true });
    const position = (count ?? 0) + 1;

    // Save to Supabase — no email sent to provider yet
    await supabase.from("provider_applications").insert({
      name, email, city, category,
      position,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    // Admin notifications off — check Supabase dashboard directly

    return NextResponse.json({ success: true, position });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
