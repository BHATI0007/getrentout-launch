"use client";

import { useState, useEffect } from "react";

const TOTAL_SPOTS = 100000;
const LAUNCH_DATE = new Date("2025-07-08T00:00:00");

function useSpots() {
  const [spots, setSpots] = useState<number | null>(null);
  useEffect(() => {
    const load = () => fetch("/api/spots").then(r => r.json()).then(d => setSpots(d.remaining)).catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);
  return { spots, setSpots };
}

function useCountdown() {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = LAUNCH_DATE.getTime() - Date.now();
      if (diff <= 0) return;
      setTime({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);
  return time;
}

function Logo({ dark = false }: { dark?: boolean }) {
  const c = dark ? "#fff" : "#0a0a0a";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#FF385C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M13 3L5 13h7l-1 8 8-10h-7l1-8z" fill="white" />
        </svg>
      </div>
      <span style={{ fontSize: "18px", fontWeight: 700, color: c, letterSpacing: "-0.3px" }}>RentOut</span>
    </div>
  );
}

type View = "home" | "provider" | "customer" | "done-provider" | "done-customer";

export default function Page() {
  const [view, setView] = useState<View>("home");
  const [loading, setLoading] = useState(false);
  const [refCode, setRefCode] = useState("");
  const [providerSpot, setProviderSpot] = useState(0);
  const [waitlistResult, setWaitlistResult] = useState<{ position: number; referralCode: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pForm, setPForm] = useState({ name: "", email: "", city: "", category: "" });
  const [cForm, setCForm] = useState({ name: "", email: "", city: "" });
  const { spots, setSpots } = useSpots();
  const time = useCountdown();
  const pad = (n: number) => String(n).padStart(2, "0");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("ref");
    if (p) setRefCode(p);
  }, []);

  async function submitProvider(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      await fetch("/api/provider", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pForm) });
      const d = await fetch("/api/spots").then(r => r.json());
      setSpots(d.remaining);
      setProviderSpot(TOTAL_SPOTS - d.remaining);
      setView("done-provider");
    } finally { setLoading(false); }
  }

  async function submitCustomer(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...cForm, referralCode: refCode }) });
      const data = await res.json();
      setWaitlistResult({ position: data.position, referralCode: data.referralCode });
      setView("done-customer");
    } finally { setLoading(false); }
  }

  function copyLink() {
    navigator.clipboard.writeText(`https://getrentout.me?ref=${waitlistResult?.referralCode}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const inputStyle = {
    width: "100%", padding: "14px 16px", border: "1.5px solid #e5e5e5",
    borderRadius: "12px", background: "#fff", color: "#0a0a0a",
    fontSize: "15px", outline: "none", fontFamily: "inherit",
    WebkitAppearance: "none" as const,
  };

  const btnPrimary = {
    width: "100%", padding: "15px", background: "#FF385C",
    border: "none", borderRadius: "12px", color: "#fff",
    fontSize: "15px", fontWeight: 700, cursor: "pointer",
    letterSpacing: "-0.2px",
  };

  const btnSecondary = {
    width: "100%", padding: "14px", background: "#fff",
    border: "1.5px solid #e5e5e5", borderRadius: "12px", color: "#0a0a0a",
    fontSize: "15px", fontWeight: 600, cursor: "pointer",
  };

  // ── Done: Provider ──────────────────────────────────────────────
  if (view === "done-provider") return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "420px", width: "100%" }}>
        <div style={{ marginBottom: "40px" }}><Logo /></div>

        <div style={{ background: "#0a0a0a", borderRadius: "20px", padding: "36px 28px", marginBottom: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", color: "#666", textTransform: "uppercase", marginBottom: "12px" }}>Your founding spot</div>
          <div style={{ fontSize: "72px", fontWeight: 800, color: "#fff", lineHeight: 1, marginBottom: "8px", fontVariantNumeric: "tabular-nums" }}>
            #{providerSpot.toLocaleString()}
          </div>
          <div style={{ fontSize: "14px", color: "#555" }}>of 100,000 worldwide</div>
          <div style={{ height: "1px", background: "#1a1a1a", margin: "24px 0" }} />
          <div style={{ fontSize: "14px", color: "#888", lineHeight: 1.6 }}>
            Zero commission.<br />
            <span style={{ color: "#FF385C" }}>For life.</span>
          </div>
        </div>

        <div style={{ background: "#f9f9f9", border: "1.5px solid #f0f0f0", borderRadius: "16px", padding: "20px", marginBottom: "12px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>
            {spots !== null ? spots.toLocaleString() : "—"} spots remaining
          </div>
          <div style={{ fontSize: "13px", color: "#666", lineHeight: 1.6 }}>
            Share with other providers. Every spot that fills is gone forever after July 19.
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <a href={`https://wa.me/?text=I just claimed founding provider spot %23${providerSpot.toLocaleString()} on RentOut. Sell ANY service. Set YOUR price. Zero commission for life. Only ${spots?.toLocaleString()} spots left: https://getrentout.me`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#25D366", borderRadius: "12px", padding: "12px", fontSize: "13px", fontWeight: 600, color: "#fff", textDecoration: "none", textAlign: "center" as const }}>
            Share on WhatsApp
          </a>
          <a href={`https://twitter.com/intent/tweet?text=Just claimed founding provider spot %23${providerSpot.toLocaleString()} on RentOut — sell any service, set your own price, zero commission for life. ${spots?.toLocaleString()} spots left: https://getrentout.me`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#0a0a0a", borderRadius: "12px", padding: "12px", fontSize: "13px", fontWeight: 600, color: "#fff", textDecoration: "none", textAlign: "center" as const }}>
            Share on X
          </a>
        </div>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#aaa" }}>Check your email — we'll be in touch.</p>
      </div>
    </div>
  );

  // ── Done: Customer ──────────────────────────────────────────────
  if (view === "done-customer") return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "420px", width: "100%" }}>
        <div style={{ marginBottom: "40px" }}><Logo /></div>

        <div style={{ background: "#0a0a0a", borderRadius: "20px", padding: "36px 28px", marginBottom: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", color: "#666", textTransform: "uppercase", marginBottom: "12px" }}>You're on the list</div>
          <div style={{ fontSize: "72px", fontWeight: 800, color: "#fff", lineHeight: 1, marginBottom: "8px", fontVariantNumeric: "tabular-nums" }}>
            #{waitlistResult?.position}
          </div>
          <div style={{ fontSize: "14px", color: "#555" }}>{cForm.city}</div>
        </div>

        <div style={{ background: "#f9f9f9", border: "1.5px solid #f0f0f0", borderRadius: "16px", padding: "20px", marginBottom: "12px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>Move up the list</div>
          <div style={{ fontSize: "13px", color: "#666", marginBottom: "14px" }}>Every friend who signs up with your link moves you ahead.</div>
          <div style={{ background: "#fff", border: "1.5px solid #e5e5e5", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "#0a0a0a", fontFamily: "monospace", wordBreak: "break-all" as const, marginBottom: "10px" }}>
            getrentout.me?ref={waitlistResult?.referralCode}
          </div>
          <button onClick={copyLink} style={{ ...btnPrimary, padding: "12px" }}>
            {copied ? "✓ Copied to clipboard" : "Copy your link"}
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <a href={`https://wa.me/?text=I'm on the RentOut waitlist — the app where you hire anyone for anything. Get your spot: https://getrentout.me?ref=${waitlistResult?.referralCode}`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#25D366", borderRadius: "12px", padding: "12px", fontSize: "13px", fontWeight: 600, color: "#fff", textDecoration: "none", textAlign: "center" as const }}>
            WhatsApp
          </a>
          <a href={`https://twitter.com/intent/tweet?text=Just joined RentOut — hire anyone for anything, launching during FIFA World Cup 2026. https://getrentout.me?ref=${waitlistResult?.referralCode}`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#0a0a0a", borderRadius: "12px", padding: "12px", fontSize: "13px", fontWeight: 600, color: "#fff", textDecoration: "none", textAlign: "center" as const }}>
            X
          </a>
        </div>
      </div>
    </div>
  );

  // ── Provider form ───────────────────────────────────────────────
  if (view === "provider") return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "400px", width: "100%" }}>
        <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "14px", padding: 0, marginBottom: "32px", display: "flex", alignItems: "center", gap: "4px" }}>
          ← Back
        </button>
        <div style={{ marginBottom: "32px" }}><Logo /></div>

        <div style={{ marginBottom: "8px" }}>
          <span style={{ display: "inline-block", background: "#fff0f2", color: "#FF385C", fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "100px", border: "1px solid #ffd0d7", marginBottom: "16px" }}>
            {spots !== null ? `${spots.toLocaleString()} founding spots left` : "Limited spots remaining"}
          </span>
        </div>

        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "6px", letterSpacing: "-0.5px" }}>Become a founding provider</h1>
        <p style={{ fontSize: "15px", color: "#666", marginBottom: "28px", lineHeight: 1.6 }}>
          Sell any service. Set your own price.<br />Zero commission — forever.
        </p>

        <form onSubmit={submitProvider} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input required placeholder="Full name" value={pForm.name} onChange={e => setPForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
          <input required type="email" placeholder="Email address" value={pForm.email} onChange={e => setPForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
          <input required placeholder="Your city" value={pForm.city} onChange={e => setPForm(p => ({ ...p, city: e.target.value }))} style={inputStyle} />
          <input required placeholder="What will you offer? (e.g. Gaming, Photography, Tutoring)" value={pForm.category} onChange={e => setPForm(p => ({ ...p, category: e.target.value }))} style={inputStyle} />
          <div style={{ height: "4px" }} />
          <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}>
            {loading ? "Claiming your spot..." : "Claim founding spot"}
          </button>
          <p style={{ textAlign: "center", fontSize: "12px", color: "#aaa" }}>
            Free to join. Zero commission for life if you're in the first 100,000.
          </p>
        </form>
      </div>
    </div>
  );

  // ── Customer form ───────────────────────────────────────────────
  if (view === "customer") return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "400px", width: "100%" }}>
        <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "14px", padding: 0, marginBottom: "32px" }}>
          ← Back
        </button>
        <div style={{ marginBottom: "32px" }}><Logo /></div>

        {refCode && (
          <div style={{ background: "#f0fff4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#166534", marginBottom: "20px" }}>
            ✓ Referred by a friend — you're already ahead.
          </div>
        )}

        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "6px", letterSpacing: "-0.5px" }}>Join the waitlist</h1>
        <p style={{ fontSize: "15px", color: "#666", marginBottom: "28px" }}>
          Get early access when we launch in your city.
        </p>

        <form onSubmit={submitCustomer} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input required placeholder="Full name" value={cForm.name} onChange={e => setCForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
          <input required type="email" placeholder="Email address" value={cForm.email} onChange={e => setCForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
          <input required placeholder="Your city" value={cForm.city} onChange={e => setCForm(p => ({ ...p, city: e.target.value }))} style={inputStyle} />
          <div style={{ height: "4px" }} />
          <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}>
            {loading ? "Joining..." : "Reserve my spot"}
          </button>
        </form>
      </div>
    </div>
  );

  // ── Home ────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>

      {/* Nav */}
      <nav style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f0f0f0" }}>
        <Logo />
        <button onClick={() => setView("provider")}
          style={{ background: "#0a0a0a", border: "none", borderRadius: "100px", color: "#fff", padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
          Become a provider
        </button>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" }}>

        {/* FIFA badge */}
        <div className="fade" style={{ marginBottom: "24px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#fff0f2", color: "#FF385C", fontSize: "13px", fontWeight: 600, padding: "6px 14px", borderRadius: "100px", border: "1px solid #ffd0d7" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FF385C", display: "inline-block", animation: "pulse 2s infinite" }} />
            FIFA World Cup 2026 · Launching in {pad(time.d)}d {pad(time.h)}h {pad(time.m)}m
          </span>
        </div>

        {/* Headline */}
        <h1 className="fade-2" style={{ fontSize: "clamp(40px, 7vw, 64px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: "20px", color: "#0a0a0a" }}>
          Hire anyone.<br />For anything.
        </h1>

        <p className="fade-2" style={{ fontSize: "18px", color: "#666", lineHeight: 1.6, marginBottom: "40px", maxWidth: "480px", margin: "0 auto 40px" }}>
          The first platform where anyone can offer any service — gaming, companionship, tutoring, photography — and get paid on their own terms.
        </p>

        {/* CTAs */}
        <div className="fade-3" style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "40px" }}>
          <button onClick={() => setView("provider")}
            style={{ background: "#FF385C", border: "none", borderRadius: "12px", color: "#fff", padding: "16px 32px", fontSize: "16px", fontWeight: 700, cursor: "pointer", letterSpacing: "-0.2px" }}>
            Start earning — it's free
          </button>
          <button onClick={() => setView("customer")}
            style={{ background: "#fff", border: "1.5px solid #e5e5e5", borderRadius: "12px", color: "#0a0a0a", padding: "16px 32px", fontSize: "16px", fontWeight: 600, cursor: "pointer" }}>
            Find someone
          </button>
        </div>

        {/* Spots counter */}
        <div className="fade-3" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#f9f9f9", border: "1px solid #f0f0f0", borderRadius: "100px", padding: "8px 16px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
          <span style={{ fontSize: "13px", color: "#666" }}>
            <span style={{ fontWeight: 700, color: "#0a0a0a" }}>{spots !== null ? spots.toLocaleString() : "100,000"}</span> founding provider spots remaining
          </span>
        </div>
      </div>

      {/* How it works */}
      <div style={{ borderTop: "1px solid #f0f0f0", padding: "60px 24px" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.1em", color: "#aaa", textTransform: "uppercase", marginBottom: "40px", textAlign: "center" }}>How it works</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "32px" }}>
            {[
              { n: "01", t: "Offer anything", b: "Gaming, photography, tutoring, companionship — any skill you have." },
              { n: "02", t: "Set your terms", b: "Your price. Your hours. Your rules. Nobody tells you what to charge." },
              { n: "03", t: "Get paid", b: "Customers book you directly. Money hits your account instantly." },
            ].map(({ n, t, b }) => (
              <div key={n}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#FF385C", marginBottom: "8px" }}>{n}</div>
                <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px", color: "#0a0a0a" }}>{t}</div>
                <div style={{ fontSize: "14px", color: "#888", lineHeight: 1.6 }}>{b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ background: "#0a0a0a", padding: "60px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "480px", margin: "0 auto" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>
            Transfer window closes July 19
          </div>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#fff", marginBottom: "8px", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
            First 100,000 providers.<br />Zero commission. Forever.
          </h2>
          <p style={{ fontSize: "15px", color: "#555", marginBottom: "28px" }}>
            {spots !== null ? `${spots.toLocaleString()} spots remaining.` : ""} After July 19 — this offer is gone.
          </p>
          <button onClick={() => setView("provider")}
            style={{ background: "#fff", border: "none", borderRadius: "12px", color: "#0a0a0a", padding: "16px 40px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>
            Claim my founding spot
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "24px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <Logo />
        <div style={{ display: "flex", gap: "20px" }}>
          <a href="/privacy" style={{ fontSize: "13px", color: "#aaa", textDecoration: "none" }}>Privacy</a>
          <a href="/terms" style={{ fontSize: "13px", color: "#aaa", textDecoration: "none" }}>Terms</a>
        </div>
        <span style={{ fontSize: "13px", color: "#ccc" }}>© 2025 RentOut</span>
      </div>

    </div>
  );
}
