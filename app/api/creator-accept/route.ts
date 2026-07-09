import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const TERMS_VERSION = "1.0";

// Records a creator's acceptance of the program terms (version + timestamp).
// Idempotent: accepting again never overwrites the original acceptance record.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const code = String(body.code ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9]{3,20}$/.test(code)) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const { data: creator } = await supabase
    .from("creators")
    .select("code, status, accepted_terms_at")
    .eq("code", code)
    .single();

  if (!creator || creator.status !== "active") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (creator.accepted_terms_at) {
    return NextResponse.json({ success: true, alreadyAccepted: true });
  }

  const { error } = await supabase
    .from("creators")
    .update({ accepted_terms_version: TERMS_VERSION, accepted_terms_at: new Date().toISOString() })
    .eq("code", code)
    .is("accepted_terms_at", null);

  if (error) return NextResponse.json({ error: "Update failed", detail: error.message }, { status: 500 });
  return NextResponse.json({ success: true, version: TERMS_VERSION });
}
