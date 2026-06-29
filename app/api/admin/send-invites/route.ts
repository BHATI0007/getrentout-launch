import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Protect with a secret token — set ADMIN_SECRET in Vercel env vars
const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function POST(req: NextRequest) {
  // Auth check
  const auth = req.headers.get("x-admin-secret");
  if (!ADMIN_SECRET || auth !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { testingLink, dryRun = false } = await req.json();

  if (!testingLink) {
    return NextResponse.json({ error: "testingLink is required" }, { status: 400 });
  }

  // Fetch all provider applications
  const { data: providers, error } = await supabase
    .from("provider_applications")
    .select("name, email, city, category, status")
    .order("created_at", { ascending: true });

  if (error || !providers) {
    return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 });
  }

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      total: providers.length,
      emails: providers.map(p => ({ name: p.name, email: p.email, city: p.city })),
    });
  }

  // Send in batches of 10 (Resend rate limit safety)
  const results: { email: string; success: boolean; error?: string }[] = [];

  for (let i = 0; i < providers.length; i += 10) {
    const batch = providers.slice(i, i + 10);
    await Promise.all(
      batch.map(async (p) => {
        try {
          await resend.emails.send({
            from: "Vineet at RentOut <noreply@getrentout.me>",
            to: p.email,
            subject: "You're in — RentOut beta is ready for you 🚀",
            html: `
              <div style="background:#000;color:#fff;font-family:-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;">
                <div style="font-size:22px;font-weight:800;margin-bottom:32px;letter-spacing:-0.5px;">
                  Rent<span style="color:#9B6DFF;">Out</span>
                </div>

                <h1 style="font-size:32px;font-weight:800;line-height:1.15;margin-bottom:12px;letter-spacing:-0.5px;">
                  Hey ${p.name}, it's ready.
                </h1>
                <p style="color:#888;font-size:15px;line-height:1.7;margin-bottom:32px;">
                  You signed up early on RentOut. We've been building — and now it's time to put it in your hands first.
                </p>

                <div style="background:#0d0d0d;border:1px solid rgba(155,109,255,0.25);border-radius:16px;padding:28px;margin-bottom:28px;">
                  <p style="color:#9B6DFF;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">
                    Your early access
                  </p>
                  <p style="font-size:16px;color:#ccc;line-height:1.7;margin-bottom:20px;">
                    Tap below to download the app on your Android device. You're getting in before anyone else.
                  </p>
                  <a href="${testingLink}"
                    style="display:block;background:linear-gradient(110deg,#9B6DFF,#b57dff);color:#fff;text-decoration:none;
                           text-align:center;padding:15px 24px;border-radius:12px;font-weight:700;font-size:15px;letter-spacing:-0.2px;">
                    Download RentOut →
                  </a>
                </div>

                <div style="background:#0a0a0a;border:1px solid #1e1e1e;border-radius:12px;padding:20px;margin-bottom:28px;">
                  <p style="color:#aaa;font-size:13px;font-weight:600;margin-bottom:12px;">As an early member you get:</p>
                  <ul style="color:#666;font-size:13px;line-height:2;padding-left:18px;margin:0;">
                    <li>Access before the public launch</li>
                    <li>Early member badge on your profile</li>
                    <li>First in line when we go live</li>
                    <li>Direct line to the team (reply to this email)</li>
                  </ul>
                </div>

                <p style="color:#555;font-size:14px;line-height:1.7;margin-bottom:8px;">
                  Signed up from ${p.city}
                </p>
                <p style="color:#555;font-size:13px;line-height:1.6;">
                  Reply to this email anytime. I read everything.
                </p>
                <p style="color:#555;font-size:13px;margin-top:8px;">— Vineet, founder</p>

                <div style="margin-top:40px;border-top:1px solid #1a1a1a;padding-top:20px;color:#333;font-size:12px;">
                  © 2026 RentOut ·
                  <a href="https://getrentout.me/privacy" style="color:#444;">Privacy</a> ·
                  <a href="https://getrentout.me" style="color:#444;">getrentout.me</a>
                </div>
              </div>
            `,
          });
          results.push({ email: p.email, success: true });
        } catch (err: unknown) {
          results.push({ email: p.email, success: false, error: String(err) });
        }
      })
    );
    // Small delay between batches
    if (i + 10 < providers.length) await new Promise(r => setTimeout(r, 300));
  }

  const sent = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return NextResponse.json({ total: providers.length, sent, failed, results });
}
