import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-admin-secret");
  if (!ADMIN_SECRET || auth !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dryRun = false } = await req.json().catch(() => ({}));

  const { data: providers, error } = await supabase
    .from("provider_applications")
    .select("name, email")
    .order("created_at", { ascending: true });

  if (error || !providers) {
    return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 });
  }

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      total: providers.length,
      emails: providers.map(p => ({ name: p.name, email: p.email })),
    });
  }

  const results: { email: string; success: boolean; error?: string }[] = [];

  for (let i = 0; i < providers.length; i += 10) {
    const batch = providers.slice(i, i + 10);
    await Promise.all(
      batch.map(async (p) => {
        try {
          await resend.emails.send({
            from: "Vineet at RentOut <noreply@getrentout.me>",
            to: p.email,
            subject: "Hi from the founder of RentOut",
            html: `
              <div style="background:#000;color:#fff;font-family:-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;">
                <div style="font-size:22px;font-weight:800;margin-bottom:32px;letter-spacing:-0.5px;">
                  Rent<span style="color:#9B6DFF;">Out</span>
                </div>

                <h1 style="font-size:28px;font-weight:800;line-height:1.15;margin-bottom:16px;letter-spacing:-0.5px;">
                  Hi ${p.name.split(" ")[0]},
                </h1>
                <p style="color:#ccc;font-size:15px;line-height:1.8;margin-bottom:16px;">
                  I'm Vineet, founder of RentOut. Thanks for signing up early — I wanted to introduce myself personally.
                </p>
                <p style="color:#888;font-size:14px;line-height:1.8;margin-bottom:32px;">
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
    if (i + 10 < providers.length) await new Promise(r => setTimeout(r, 300));
  }

  const sent = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return NextResponse.json({ total: providers.length, sent, failed, results });
}
