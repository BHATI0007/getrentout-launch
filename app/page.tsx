"use client";

import { useState, useEffect } from "react";

const LAUNCH_DATE = new Date("2025-07-08T00:00:00");

function Countdown() {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = LAUNCH_DATE.getTime() - Date.now();
      if (diff <= 0) { setTime({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div style={{ display: "flex", gap: "12px", justifyContent: "center", margin: "28px 0" }}>
      {[{ v: time.d, l: "Days" }, { v: time.h, l: "Hours" }, { v: time.m, l: "Min" }, { v: time.s, l: "Sec" }].map(({ v, l }) => (
        <div key={l} style={{ textAlign: "center" }}>
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: "10px", padding: "12px 16px", minWidth: "64px", fontSize: "28px", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "#fff", lineHeight: 1 }}>{pad(v)}</div>
          <div style={{ fontSize: "10px", color: "#555", marginTop: "5px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

type View = "home" | "customer" | "provider" | "done-customer" | "done-provider";

interface WaitlistResult { position: number; referralCode: string; }

export default function Page() {
  const [view, setView] = useState<View>("home");
  const [loading, setLoading] = useState(false);
  const [cForm, setCForm] = useState({ name: "", email: "", city: "" });
  const [pForm, setPForm] = useState({ name: "", email: "", city: "", category: "", about: "" });
  const [waitlistResult, setWaitlistResult] = useState<WaitlistResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [refCode, setRefCode] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setRefCode(ref);
  }, []);

  async function submitCustomer(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...cForm, referralCode: refCode }),
      });
      const data = await res.json();
      setWaitlistResult({ position: data.position, referralCode: data.referralCode });
      setView("done-customer");
    } finally { setLoading(false); }
  }

  async function submitProvider(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pForm),
      });
      setView("done-provider");
    } finally { setLoading(false); }
  }

  function copyLink() {
    const link = `https://getrentout.me?ref=${waitlistResult?.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Done: customer with Robinhood-style position ──
  if (view === "done-customer" && waitlistResult) return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div className="fade-up" style={{ maxWidth: "440px", width: "100%", textAlign: "center" }}>
        <div style={{ marginBottom: "28px" }}>
          <span style={{ fontSize: "20px", fontWeight: 800 }}>Rent<span className="gradient-text">Out</span></span>
        </div>

        {/* Position card */}
        <div style={{ background: "#0a0a0a", border: "1px solid #9B6DFF44", borderRadius: "20px", padding: "32px 24px", marginBottom: "20px" }}>
          <p style={{ color: "#666", fontSize: "13px", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>Your position</p>
          <div style={{ fontSize: "72px", fontWeight: 800, lineHeight: 1, marginBottom: "4px" }}>
            <span className="gradient-text">#{waitlistResult.position}</span>
          </div>
          <p style={{ color: "#555", fontSize: "14px", marginTop: "8px" }}>in line · {cForm.city}</p>
        </div>

        {/* Refer to move up */}
        <div style={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: "16px", padding: "20px", marginBottom: "16px", textAlign: "left" }}>
          <p style={{ fontWeight: 600, fontSize: "15px", marginBottom: "6px" }}>Skip the line ⚡</p>
          <p style={{ color: "#555", fontSize: "13px", lineHeight: 1.6, marginBottom: "16px" }}>
            Share your link. Every friend who signs up moves you ahead in line.
          </p>
          <div style={{ background: "#111", border: "1px solid #333", borderRadius: "8px", padding: "10px 14px", fontFamily: "monospace", fontSize: "12px", color: "#9B6DFF", wordBreak: "break-all", marginBottom: "10px" }}>
            getrentout.me?ref={waitlistResult.referralCode}
          </div>
          <button onClick={copyLink} className="btn-primary" style={{ fontSize: "14px", padding: "11px 20px" }}>
            {copied ? "✓ Copied!" : "Copy my referral link"}
          </button>
        </div>

        {/* Share buttons */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <a href={`https://twitter.com/intent/tweet?text=I just joined the RentOut waitlist — the app launching during FIFA World Cup 2026. Get your spot 👇&url=https://getrentout.me?ref=${waitlistResult.referralCode}`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#111", border: "1px solid #222", borderRadius: "10px", padding: "10px", fontSize: "13px", color: "#fff", textDecoration: "none", textAlign: "center" }}>
            Share on X
          </a>
          <a href={`https://wa.me/?text=I just joined RentOut waitlist — launching during FIFA World Cup. Get your spot: https://getrentout.me?ref=${waitlistResult.referralCode}`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#111", border: "1px solid #222", borderRadius: "10px", padding: "10px", fontSize: "13px", color: "#fff", textDecoration: "none", textAlign: "center" }}>
            Share on WhatsApp
          </a>
        </div>

        <p style={{ color: "#333", fontSize: "12px" }}>Check your email — we sent your position + link there too.</p>
      </div>
    </main>
  );

  // ── Done: provider ──
  if (view === "done-provider") return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
      <div className="fade-up" style={{ maxWidth: "400px" }}>
        <div style={{ marginBottom: "28px" }}>
          <span style={{ fontSize: "20px", fontWeight: 800 }}>Rent<span className="gradient-text">Out</span></span>
        </div>
        <div style={{ fontSize: "52px", marginBottom: "20px" }}>⚡</div>
        <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "10px" }}>Application received.</h2>
        <p style={{ color: "#555", fontSize: "15px", lineHeight: 1.7, marginBottom: "28px" }}>
          We review every application personally.<br />
          If selected, you&apos;ll get exclusive early access — before any customers arrive.<br />
          <span style={{ color: "#9B6DFF" }}>Expect a reply within 48 hours.</span>
        </p>
        <button onClick={() => setView("home")} className="btn-outline" style={{ width: "auto", padding: "11px 24px", fontSize: "14px" }}>← Back</button>
      </div>
    </main>
  );

  // ── Customer form ──
  if (view === "customer") return (
    <Screen onBack={() => setView("home")}>
      <h2 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "6px" }}>Join the waitlist</h2>
      <p style={{ color: "#555", fontSize: "14px", marginBottom: "24px" }}>Free. Get your numbered spot + a referral link to move up.</p>
      {refCode && (
        <div style={{ background: "#9B6DFF15", border: "1px solid #9B6DFF33", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#9B6DFF", marginBottom: "16px" }}>
          ✓ Referred by a friend — you&apos;re already ahead of most people.
        </div>
      )}
      <form onSubmit={submitCustomer} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input required placeholder="Your name" value={cForm.name} onChange={e => setCForm(p => ({ ...p, name: e.target.value }))} />
        <input required type="email" placeholder="Email address" value={cForm.email} onChange={e => setCForm(p => ({ ...p, email: e.target.value }))} />
        <input required placeholder="Your city" value={cForm.city} onChange={e => setCForm(p => ({ ...p, city: e.target.value }))} />
        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "6px" }}>
          {loading ? "Getting your spot..." : "Reserve my spot →"}
        </button>
      </form>
    </Screen>
  );

  // ── Provider form ──
  if (view === "provider") return (
    <Screen onBack={() => setView("home")}>
      <h2 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "6px" }}>Apply as a provider</h2>
      <p style={{ color: "#555", fontSize: "14px", marginBottom: "24px" }}>First 50 providers get founding status — zero competition at launch.</p>
      <form onSubmit={submitProvider} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input required placeholder="Your name" value={pForm.name} onChange={e => setPForm(p => ({ ...p, name: e.target.value }))} />
        <input required type="email" placeholder="Email address" value={pForm.email} onChange={e => setPForm(p => ({ ...p, email: e.target.value }))} />
        <input required placeholder="Your city" value={pForm.city} onChange={e => setPForm(p => ({ ...p, city: e.target.value }))} />
        <select required value={pForm.category} onChange={e => setPForm(p => ({ ...p, category: e.target.value }))}>
          <option value="">What do you offer?</option>
          <option>Gaming Partner</option>
          <option>Watch Party Companion</option>
          <option>Social Companion</option>
          <option>Event Companion</option>
          <option>Fitness Partner</option>
          <option>Language Partner</option>
          <option>Other</option>
        </select>
        <textarea placeholder="Tell us about yourself (optional)" rows={3} value={pForm.about} onChange={e => setPForm(p => ({ ...p, about: e.target.value }))} />
        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "6px" }}>
          {loading ? "Submitting..." : "Apply for early access →"}
        </button>
      </form>
    </Screen>
  );

  // ── Home ──
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, #9B6DFF18 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-10%", right: "10%", width: "400px", height: "400px", background: "radial-gradient(circle, #F28B8212 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "520px", width: "100%", textAlign: "center", position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div className="fade-up" style={{ marginBottom: "40px" }}>
          <span style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px" }}>
            Rent<span className="gradient-text">Out</span>
          </span>
        </div>

        {/* FIFA badge */}
        <div className="fade-up" style={{ marginBottom: "20px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#9B6DFF15", border: "1px solid #9B6DFF30", borderRadius: "100px", padding: "5px 14px", fontSize: "11px", color: "#9B6DFF", fontWeight: 600, letterSpacing: "0.06em" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#9B6DFF", display: "inline-block", animation: "pulse-slow 2s infinite" }} />
            FIFA WORLD CUP 2026 · LAUNCHING SOON
          </span>
        </div>

        {/* Headline */}
        <div className="fade-up-2">
          <h1 style={{ fontSize: "clamp(36px, 8vw, 58px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-1.5px", marginBottom: "16px" }}>
            Never watch<br /><span className="gradient-text">alone again.</span>
          </h1>
          <p style={{ color: "#555", fontSize: "16px", lineHeight: 1.65, maxWidth: "380px", margin: "0 auto 4px" }}>
            We&apos;re not telling you everything yet.<br />But founding members won&apos;t regret it.
          </p>
        </div>

        {/* Countdown */}
        <div className="fade-up-2"><Countdown /></div>

        {/* Two doors */}
        <div className="fade-up-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "4px" }}>
          <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "20px 16px" }}>
            <div style={{ fontSize: "26px", marginBottom: "8px" }}>🎮</div>
            <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "5px" }}>I want to experience</div>
            <div style={{ color: "#444", fontSize: "12px", marginBottom: "14px" }}>Get your spot in line</div>
            <button className="btn-outline" onClick={() => setView("customer")} style={{ fontSize: "13px", padding: "9px 14px" }}>
              Join waitlist →
            </button>
          </div>
          <div style={{ background: "#0a0a0a", border: "1px solid #9B6DFF33", borderRadius: "16px", padding: "20px 16px", position: "relative" }}>
            <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #9B6DFF, #F28B82)", borderRadius: "100px", padding: "3px 10px", fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
              EARLY ACCESS
            </div>
            <div style={{ fontSize: "26px", marginBottom: "8px" }}>⚡</div>
            <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "5px" }}>I want to earn</div>
            <div style={{ color: "#444", fontSize: "12px", marginBottom: "14px" }}>Get app before launch</div>
            <button className="btn-primary" onClick={() => setView("provider")} style={{ fontSize: "13px", padding: "9px 14px" }}>
              Apply now →
            </button>
          </div>
        </div>

        {/* Social proof */}
        <div className="fade-up-3" style={{ marginTop: "28px", color: "#333", fontSize: "13px" }}>
          Something big is happening in <span style={{ color: "#9B6DFF" }}>10 days</span>.
          Premium members experience it first.
        </div>

        <div style={{ marginTop: "40px", color: "#222", fontSize: "12px", display: "flex", gap: "20px", justifyContent: "center" }}>
          <a href="/privacy" style={{ color: "#222", textDecoration: "none" }}>Privacy</a>
          <a href="/terms" style={{ color: "#222", textDecoration: "none" }}>Terms</a>
          <span>© 2025 RentOut</span>
        </div>
      </div>
    </main>
  );
}

function Screen({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "500px", height: "500px", background: "radial-gradient(circle, #9B6DFF12 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: "400px", width: "100%", position: "relative", zIndex: 1 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "14px", marginBottom: "20px", padding: 0 }}>
          ← Back
        </button>
        <div style={{ marginBottom: "20px" }}>
          <span style={{ fontSize: "20px", fontWeight: 800 }}>Rent<span className="gradient-text">Out</span></span>
        </div>
        {children}
      </div>
    </main>
  );
}
