import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  const { id, x, y, color } = await req.json();
  if (!id) return NextResponse.json({ ok: false });
  await supabase.from("cursor_positions").upsert({ id, x, y, color, updated_at: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const cutoff = new Date(Date.now() - 3000).toISOString();
  const { data } = await supabase
    .from("cursor_positions")
    .select("id, x, y, color")
    .gt("updated_at", cutoff);
  return NextResponse.json({ cursors: data ?? [] });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (id) await supabase.from("cursor_positions").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
