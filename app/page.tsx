"use client";

import { useState, useEffect } from "react";

const TOTAL_SPOTS = 100000;
const LAUNCH_DATE = new Date("2025-07-08T00:00:00");

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg,#FF8FAB,#FF6B6B)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M13 3L5 13h7l-1 8 8-10h-7l1-8z" fill="white" />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1 }}>
          Rent<span style={{ color: "#FF8FAB" }}>Out</span>
        </div>
        <div style={{ fontSize: "7px", letterSpacing: "3px", color: "#FF8FAB", opacity: 0.6 }}>RENT ANYTHING · ANYTIME</div>
      </div>
    </div>
  );
}

function Countdown() {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = LAUNCH_DATE.getTime() - Date.now();
      if (diff <= 0) return;
      setTime({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
      {[{ v: time.d, l: "Days" }, { v: time.h, l: "Hours" }, { v: time.m, l: "Min" }, { v: time.s, l: "Sec" }].map(({ v, l }) => (
        <div key={l} style={{ textAlign: "center" }}>
          <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "8px", padding: "8px 12px", minWidth: "52px", fontSize: "22px", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "#fff", lineHeight: 1 }}>{pad(v)}</div>
          <div style={{ fontSize: "9px", color: "#444", marginTop: "4px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

type View = "home" | "provider" | "customer" | "done-provider" | "done-customer";

export default function Page() {
  const [view, setView] = useState<View>("home");
  const [loading, setLoading] = useState(false);
  const [spots, setSpots] = useState(TOTAL_SPOTS);
  const [pForm, setPForm] = useState({ name: "", email: "", city: "", category: "", about: "" });
  const [cForm, setCForm] = useState({ name: "", email: "", city: "" });
  const [providerSpot, setProviderSpot] = useState(0);
  const [waitlistResult, setWaitlistResult] = useState<{ position: number; referralCode: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [refCode, setRefCode] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setRefCode(ref);

    // Fetch real spot count from Supabase
    fetch("/api/spots")
      .then(r => r.json())
      .then(d => setSpots(d.remaining))
      .catch(() => {});

    // Refresh every 30 seconds
    const id = setInterval(() => {
      fetch("/api/spots")
        .then(r => r.json())
        .then(d => setSpots(d.remaining))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, []);

  async function submitProvider(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      await fetch("/api/provider", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pForm) });
      const freshSpots = await fetch("/api/spots").then(r => r.json());
      setSpots(freshSpots.remaining);
      setProviderSpot(TOTAL_SPOTS - freshSpots.remaining);
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

  // Done — provider
  if (view === "done-provider") return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "#000" }}>
      <div style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}><Logo /></div>

        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "32px 24px", marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Your founding spot</div>
          <div style={{ fontSize: "64px", fontWeight: 800, lineHeight: 1, color: "#FF8FAB" }}>#{providerSpot.toLocaleString()}</div>
          <div style={{ fontSize: "13px", color: "#444", marginTop: "8px" }}>of 100,000 worldwide</div>
        </div>

        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", color: "#888", lineHeight: 1.7 }}>
            <span style={{ color: "#FF8FAB", fontWeight: 600 }}>{spots.toLocaleString()} spots remaining.</span><br />
            Share with other providers before they're gone.
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <a href={`https://wa.me/?text=I just claimed founding provider spot on RentOut — sell ANY service, set YOUR price. Only ${spots.toLocaleString()} spots left out of 100,000 worldwide. Zero commission for founding providers: https://getrentout.me`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "10px", fontSize: "12px", color: "#fff", textDecoration: "none", textAlign: "center" as const }}>
            Share on WhatsApp
          </a>
          <a href={`https://twitter.com/intent/tweet?text=Just claimed founding provider spot %23${providerSpot.toLocaleString()} on RentOut — sell any service, set your own price. Only ${spots.toLocaleString()} spots left globally. https://getrentout.me`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "10px", fontSize: "12px", color: "#fff", textDecoration: "none", textAlign: "center" as const }}>
            Share on X
          </a>
        </div>

        <p style={{ color: "#333", fontSize: "12px" }}>We'll email you when the app is ready.</p>
      </div>
    </main>
  );

  // Done — customer
  if (view === "done-customer") return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "#000" }}>
      <div style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}><Logo /></div>

        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "32px 24px", marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Your position</div>
          <div style={{ fontSize: "64px", fontWeight: 800, lineHeight: 1, color: "#FF8FAB" }}>#{waitlistResult?.position}</div>
          <div style={{ fontSize: "13px", color: "#444", marginTop: "8px" }}>{cForm.city}</div>
        </div>

        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", color: "#888", lineHeight: 1.7, marginBottom: "12px" }}>
            Refer friends → move up the list.
          </div>
          <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "8px", padding: "8px 12px", fontFamily: "monospace", fontSize: "11px", color: "#FF8FAB", marginBottom: "10px", wordBreak: "break-all" as const }}>
            getrentout.me?ref={waitlistResult?.referralCode}
          </div>
          <button onClick={copyLink} style={{ width: "100%", background: "linear-gradient(135deg,#FF8FAB,#FF6B6B)", border: "none", borderRadius: "8px", color: "#fff", padding: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
            {copied ? "✓ Copied!" : "Copy my link"}
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <a href={`https://wa.me/?text=I joined RentOut waitlist — the app where you can hire anyone for anything. Get your spot: https://getrentout.me?ref=${waitlistResult?.referralCode}`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "10px", fontSize: "12px", color: "#fff", textDecoration: "none", textAlign: "center" as const }}>
            WhatsApp
          </a>
          <a href={`https://twitter.com/intent/tweet?text=Just joined RentOut — hire anyone for anything. Launching during FIFA World Cup. https://getrentout.me?ref=${waitlistResult?.referralCode}`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "10px", fontSize: "12px", color: "#fff", textDecoration: "none", textAlign: "center" as const }}>
            X (Twitter)
          </a>
        </div>
      </div>
    </main>
  );

  // Provider form
  if (view === "provider") return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "#000" }}>
      <div style={{ maxWidth: "400px", width: "100%" }}>
        <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "13px", padding: 0, marginBottom: "24px" }}>← Back</button>
        <div style={{ marginBottom: "24px" }}><Logo /></div>

        <div style={{ background: "#FF8FAB12", border: "1px solid #FF8FAB22", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "#FF8FAB", marginBottom: "20px" }}>
          {spots.toLocaleString()} founding spots left out of 100,000 worldwide
        </div>

        <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "4px" }}>Claim your founding spot</h2>
        <p style={{ color: "#444", fontSize: "13px", marginBottom: "20px" }}>Sell any service. Set your own price. Your rules.</p>

        <form onSubmit={submitProvider} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input required placeholder="Your name" value={pForm.name} onChange={e => setPForm(p => ({ ...p, name: e.target.value }))}
            style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px", color: "#fff", padding: "12px 14px", fontSize: "14px", width: "100%", outline: "none", fontFamily: "inherit" }} />
          <input required type="email" placeholder="Email address" value={pForm.email} onChange={e => setPForm(p => ({ ...p, email: e.target.value }))}
            style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px", color: "#fff", padding: "12px 14px", fontSize: "14px", width: "100%", outline: "none", fontFamily: "inherit" }} />
          <input required placeholder="Your city" value={pForm.city} onChange={e => setPForm(p => ({ ...p, city: e.target.value }))}
            style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px", color: "#fff", padding: "12px 14px", fontSize: "14px", width: "100%", outline: "none", fontFamily: "inherit" }} />
          <input required placeholder="What service do you offer?" value={pForm.category} onChange={e => setPForm(p => ({ ...p, category: e.target.value }))}
            style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px", color: "#fff", padding: "12px 14px", fontSize: "14px", width: "100%", outline: "none", fontFamily: "inherit" }} />
          <button type="submit" disabled={loading}
            style={{ background: "linear-gradient(135deg,#FF8FAB,#FF6B6B)", border: "none", borderRadius: "10px", color: "#fff", padding: "13px", fontSize: "14px", fontWeight: 700, cursor: "pointer", opacity: loading ? 0.5 : 1 }}>
            {loading ? "Claiming..." : "Claim founding spot →"}
          </button>
        </form>
      </div>
    </main>
  );

  // Customer form
  if (view === "customer") return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "#000" }}>
      <div style={{ maxWidth: "400px", width: "100%" }}>
        <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "13px", padding: 0, marginBottom: "24px" }}>← Back</button>
        <div style={{ marginBottom: "24px" }}><Logo /></div>
        <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "4px" }}>Join the waitlist</h2>
        <p style={{ color: "#444", fontSize: "13px", marginBottom: "20px" }}>Get early access when we launch in your city.</p>
        {refCode && <div style={{ background: "#FF8FAB12", border: "1px solid #FF8FAB22", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#FF8FAB", marginBottom: "16px" }}>✓ Referred — you're ahead of the line.</div>}
        <form onSubmit={submitCustomer} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input required placeholder="Your name" value={cForm.name} onChange={e => setCForm(p => ({ ...p, name: e.target.value }))}
            style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px", color: "#fff", padding: "12px 14px", fontSize: "14px", width: "100%", outline: "none", fontFamily: "inherit" }} />
          <input required type="email" placeholder="Email address" value={cForm.email} onChange={e => setCForm(p => ({ ...p, email: e.target.value }))}
            style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px", color: "#fff", padding: "12px 14px", fontSize: "14px", width: "100%", outline: "none", fontFamily: "inherit" }} />
          <input required placeholder="Your city" value={cForm.city} onChange={e => setCForm(p => ({ ...p, city: e.target.value }))}
            style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px", color: "#fff", padding: "12px 14px", fontSize: "14px", width: "100%", outline: "none", fontFamily: "inherit" }} />
          <button type="submit" disabled={loading}
            style={{ background: "linear-gradient(135deg,#FF8FAB,#FF6B6B)", border: "none", borderRadius: "10px", color: "#fff", padding: "13px", fontSize: "14px", fontWeight: 700, cursor: "pointer", opacity: loading ? 0.5 : 1 }}>
            {loading ? "Saving..." : "Reserve my spot →"}
          </button>
        </form>
      </div>
    </main>
  );

  // Home
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px", background: "#000" }}>
      <div style={{ maxWidth: "480px", width: "100%" }}>

        {/* Logo */}
        <div style={{ marginBottom: "40px" }}><Logo /></div>

        {/* Badge */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#FF8FAB12", border: "1px solid #FF8FAB22", borderRadius: "100px", padding: "4px 12px", fontSize: "11px", color: "#FF8FAB", fontWeight: 600, letterSpacing: "0.05em" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#FF8FAB", display: "inline-block" }} />
            FIFA WORLD CUP 2026 · LAUNCHING IN
          </span>
        </div>

        {/* Countdown */}
        <div style={{ marginBottom: "28px" }}><Countdown /></div>

        {/* Headline */}
        <h1 style={{ fontSize: "clamp(32px,7vw,52px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: "12px" }}>
          Sell anything.<br />
          <span style={{ color: "#FF8FAB" }}>Earn on your terms.</span>
        </h1>

        <p style={{ color: "#444", fontSize: "15px", lineHeight: 1.7, marginBottom: "28px" }}>
          The first platform where you sell any service, set any price, and make your own rules.
        </p>

        {/* Spots counter */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", color: "#666" }}>Founding provider spots</span>
            <span style={{ fontSize: "13px", color: "#FF8FAB", fontWeight: 700 }}>{spots.toLocaleString()} left</span>
          </div>
          <div style={{ height: "4px", background: "#1a1a1a", borderRadius: "100px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(spots / TOTAL_SPOTS) * 100}%`, background: "linear-gradient(90deg,#FF8FAB,#FF6B6B)", borderRadius: "100px" }} />
          </div>
          <div style={{ fontSize: "11px", color: "#333", marginTop: "6px" }}>100,000 total · Zero commission for life · Closes July 19</div>
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "32px" }}>
          <button onClick={() => setView("provider")}
            style={{ background: "linear-gradient(135deg,#FF8FAB,#FF6B6B)", border: "none", borderRadius: "12px", color: "#fff", padding: "15px", fontSize: "15px", fontWeight: 700, cursor: "pointer", textAlign: "center" as const }}>
            Claim my founding spot →
          </button>
          <button onClick={() => setView("customer")}
            style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "12px", color: "#888", padding: "13px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>
            I want to hire someone
          </button>
        </div>

        {/* Footer */}
        <div style={{ color: "#222", fontSize: "11px", display: "flex", gap: "16px" }}>
          <a href="/privacy" style={{ color: "#222", textDecoration: "none" }}>Privacy</a>
          <a href="/terms" style={{ color: "#222", textDecoration: "none" }}>Terms</a>
          <span>© 2025 RentOut</span>
        </div>
      </div>
    </main>
  );
}
