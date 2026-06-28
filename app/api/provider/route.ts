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
    const { name, email, city, category, about } = await req.json();
    if (!name || !email || !city || !category) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Save to Supabase
    await supabase.from("provider_applications").insert({
      name, email, city, category, about: about || "",
      status: "pending",
      created_at: new Date().toISOString()
    });

    // Auto-reply to provider
    await resend.emails.send({
      from: "RentOut <hello@getrentout.me>",
      to: email,
      subject: "Application received — we'll be in touch ⚡",
      html: `
        <div style="background:#000;color:#fff;font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;">
          <div style="font-size:22px;font-weight:800;margin-bottom:32px;">
            Rent<span style="background:linear-gradient(135deg,#9B6DFF,#F28B82);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Out</span>
          </div>
          <h1 style="font-size:28px;font-weight:700;margin-bottom:16px;line-height:1.2;">Application received, ${name}. ⚡</h1>
          <p style="color:#888;font-size:15px;line-height:1.7;margin-bottom:24px;">
            We're reviewing provider applications now.<br/>
            If selected, you'll receive <strong style="color:#9B6DFF;">exclusive early access</strong> to the app — before any customers arrive.
          </p>
          <div style="background:#111;border:1px solid #9B6DFF33;border-radius:12px;padding:20px;margin-bottom:24px;">
            <p style="color:#666;font-size:13px;margin-bottom:8px;">What early access means</p>
            <ul style="color:#aaa;font-size:14px;line-height:2;padding-left:18px;margin:0;">
              <li>Set up your profile before anyone else</li>
              <li>Be first in search results on launch day</li>
              <li>Get all early customer traffic</li>
              <li>Permanent Founding Provider badge</li>
            </ul>
          </div>
          <p style="color:#555;font-size:13px;line-height:1.6;">
            First 50 providers get in. We'll email you within 48 hours.<br/>
            Watch your inbox.
          </p>
          <div style="margin-top:40px;border-top:1px solid #1a1a1a;padding-top:20px;color:#333;font-size:12px;">
            © 2025 RentOut · <a href="https://getrentout.me/privacy" style="color:#444;">Privacy</a>
          </div>
        </div>
      `,
    });

    // Notify admin
    await resend.emails.send({
      from: "RentOut <hello@getrentout.me>",
      to: "vineet.bhati.ug24@nsut.ac.in",
      subject: `New provider application — ${name} (${category}) from ${city}`,
      html: `
        <div style="font-family:sans-serif;padding:20px;">
          <h2>New provider application</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>City:</strong> ${city}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>About:</strong> ${about || "—"}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
          <hr/>
          <p>Review in Supabase dashboard and send app link when approved.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
