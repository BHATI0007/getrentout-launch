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

    // Notify admin only for first 100 signups — after that check Supabase directly
    if (position > 100) return NextResponse.json({ success: true, position });

    await resend.emails.send({
      from: "RentOut <noreply@getrentout.me>",
      to: "vineet.bhati.ug24@nsut.ac.in",
      subject: `#${position} — ${name} (${category}) from ${city}`,
      html: `
        <div style="font-family:sans-serif;padding:20px;max-width:480px;">
          <h2 style="margin-bottom:16px;">New provider #${position}</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>City:</strong> ${city}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
          <hr style="margin:16px 0;"/>
          <p style="color:#666;font-size:13px;">Stored in Supabase. Email will be sent when beta is ready.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, position });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
