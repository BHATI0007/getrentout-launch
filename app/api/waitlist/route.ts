import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { name, email, city, referralCode } = await req.json();
    if (!name || !email || !city) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Check duplicate
    const { data: existing } = await supabase
      .from("waitlist").select("id, position, referral_code").eq("email", email).single();
    if (existing) {
      return NextResponse.json({ position: existing.position, referralCode: existing.referral_code, alreadyExists: true });
    }

    // Generate unique referral code
    const myReferralCode = randomBytes(4).toString("hex");

    // Get current count for position
    const { count } = await supabase.from("waitlist").select("*", { count: "exact", head: true });
    const position = (count ?? 0) + 1;

    // Credit referrer if code provided
    if (referralCode) {
      const { data: referrer } = await supabase
        .from("waitlist").select("id, referral_count").eq("referral_code", referralCode).single();
      if (referrer) {
        await supabase.from("waitlist").update({
          referral_count: (referrer.referral_count ?? 0) + 1,
        }).eq("id", referrer.id);
      }
    }

    // Save signup
    await supabase.from("waitlist").insert({
      name, email, city,
      position,
      referral_code: myReferralCode,
      referred_by: referralCode || null,
      referral_count: 0,
      type: "customer",
      created_at: new Date().toISOString(),
    });

    const referralLink = `https://getrentout.me?ref=${myReferralCode}`;

    // Auto-reply to user
    await resend.emails.send({
      from: "RentOut <noreply@getrentout.me>",
      to: email,
      subject: `You're #${position} on the list 🎉`,
      html: `
        <div style="background:#000;color:#fff;font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;">
          <div style="font-size:22px;font-weight:800;margin-bottom:32px;">
            Rent<span style="background:linear-gradient(135deg,#9B6DFF,#F28B82);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Out</span>
          </div>
          <h1 style="font-size:28px;font-weight:700;margin-bottom:8px;">Hey ${name}, you're in. 🎉</h1>
          <p style="color:#666;font-size:15px;margin-bottom:28px;">Here's your spot on the RentOut waitlist.</p>

          <div style="background:#111;border:1px solid #9B6DFF33;border-radius:16px;padding:24px;margin-bottom:24px;text-align:center;">
            <p style="color:#666;font-size:13px;margin-bottom:4px;letter-spacing:0.05em;text-transform:uppercase;">Your position</p>
            <p style="font-size:56px;font-weight:800;color:#9B6DFF;line-height:1;margin:8px 0;">#${position}</p>
            <p style="color:#555;font-size:13px;">${city} waitlist</p>
          </div>

          <div style="background:#0a0a0a;border:1px solid #222;border-radius:12px;padding:20px;margin-bottom:24px;">
            <p style="color:#aaa;font-size:14px;font-weight:600;margin-bottom:12px;">⚡ Skip the line</p>
            <p style="color:#666;font-size:13px;line-height:1.6;margin-bottom:16px;">
              Refer friends and move up. Every person who signs up with your link moves you ahead.
            </p>
            <div style="background:#111;border:1px solid #333;border-radius:8px;padding:12px;font-family:monospace;font-size:13px;color:#9B6DFF;word-break:break-all;">
              ${referralLink}
            </div>
          </div>

          <p style="color:#444;font-size:13px;line-height:1.6;">
            Something big is happening soon. Premium members experience it first.<br/>Watch your inbox.
          </p>
          <div style="margin-top:40px;border-top:1px solid #1a1a1a;padding-top:20px;color:#333;font-size:12px;">
            © 2025 RentOut · <a href="https://getrentout.me/privacy" style="color:#444;">Privacy</a>
          </div>
        </div>
      `,
    });

    // Notify admin
    await resend.emails.send({
      from: "RentOut <noreply@getrentout.me>",
      to: "vineet.bhati.ug24@nsut.ac.in",
      subject: `#${position} — ${name} joined from ${city}`,
      html: `<div style="font-family:sans-serif;padding:20px;">
        <h2>New waitlist signup #${position}</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>City:</strong> ${city}</p>
        <p><strong>Referred by:</strong> ${referralCode || "organic"}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
      </div>`,
    });

    return NextResponse.json({ success: true, position, referralCode: myReferralCode });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
