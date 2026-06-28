"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const TOTAL_SPOTS = 100000;

function useSpots() {
  const [spots, setSpots] = useState<number>(TOTAL_SPOTS);
  useEffect(() => {
    const load = () => fetch("/api/spots").then(r => r.json()).then(d => setSpots(d.remaining)).catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);
  return { spots, setSpots };
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (value === prev.current) return;
    const diff = prev.current - value;
    const steps = 30;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplay(Math.round(prev.current - (diff * i) / steps));
      if (i >= steps) { clearInterval(id); prev.current = value; }
    }, 16);
    return () => clearInterval(id);
  }, [value]);
  return <>{display.toLocaleString()}</>;
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

  const input: React.CSSProperties = {
    width: "100%", padding: "14px 16px",
    background: "#111116", border: "1px solid #222228",
    borderRadius: "12px", color: "#fff", fontSize: "15px",
    outline: "none", fontFamily: "inherit",
    transition: "border-color 0.15s",
  };

  const btnPurple: React.CSSProperties = {
    width: "100%", padding: "15px",
    background: "linear-gradient(135deg, #9333ea, #ec4899)",
    border: "none", borderRadius: "12px",
    color: "#fff", fontSize: "15px", fontWeight: 700,
    cursor: "pointer", letterSpacing: "-0.2px",
    transition: "opacity 0.15s",
  };

  const btnGhost: React.CSSProperties = {
    width: "100%", padding: "14px",
    background: "transparent", border: "1px solid #222228",
    borderRadius: "12px", color: "#888", fontSize: "15px",
    fontWeight: 500, cursor: "pointer",
  };

  const Logo = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <Image src="/logo.png" alt="RentOut" width={36} height={36} style={{ borderRadius: "9px" }} />
      <span style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.3px", color: "#fff" }}>RentOut</span>
    </div>
  );

  const BackBtn = () => (
    <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "14px", padding: 0, marginBottom: "32px", display: "flex", alignItems: "center", gap: "6px" }}>
      ← Back
    </button>
  );

  // ── Done: Provider ───────────────────────────────────────────
  if (view === "done-provider") return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "400px", width: "100%", textAlign: "center" }} className="fade">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "40px" }}><Logo /></div>

        <div style={{ background: "#111116", border: "1px solid #1e1e26", borderRadius: "20px", padding: "40px 28px", marginBottom: "16px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", margin: "0 auto 20px", overflow: "hidden" }}>
            <Image src="/logo.png" alt="RentOut" width={56} height={56} />
          </div>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", color: "#555", textTransform: "uppercase", marginBottom: "10px" }}>Founding Provider</div>
          <div style={{ fontSize: "64px", fontWeight: 900, lineHeight: 1, marginBottom: "6px", letterSpacing: "-2px" }}>
            <span className="gradient-text">#{providerSpot.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: "14px", color: "#444", marginBottom: "24px" }}>of 100,000 worldwide</div>
          <div style={{ background: "#0d0d10", borderRadius: "10px", padding: "14px 16px", fontSize: "13px", color: "#555", lineHeight: 1.7 }}>
            Zero commission on every booking.<br />
            <span style={{ color: "#c084fc" }}>This spot is yours forever.</span>
          </div>
        </div>

        <div style={{ background: "#111116", border: "1px solid #1e1e26", borderRadius: "14px", padding: "18px", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <span className="live-dot" />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#888" }}>
              <AnimatedNumber value={spots} /> spots remaining
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.6 }}>
            Share with other providers before spots are gone.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <a href={`https://wa.me/?text=I just claimed founding provider spot %23${providerSpot.toLocaleString()} on RentOut. Sell ANY service. Set YOUR price. Zero commission for life. Only ${spots.toLocaleString()} of 100,000 spots left: https://getrentout.me`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#1a2e1a", border: "1px solid #2d4a2d", borderRadius: "12px", padding: "13px", fontSize: "13px", fontWeight: 600, color: "#4ade80", textDecoration: "none", textAlign: "center" }}>
            WhatsApp
          </a>
          <a href={`https://twitter.com/intent/tweet?text=Just claimed founding provider spot %23${providerSpot.toLocaleString()} on %40RentOutApp — sell any service%2C set your price%2C zero commission. ${spots.toLocaleString()} spots left: https://getrentout.me`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#111116", border: "1px solid #222228", borderRadius: "12px", padding: "13px", fontSize: "13px", fontWeight: 600, color: "#fff", textDecoration: "none", textAlign: "center" }}>
            Post on X
          </a>
        </div>
      </div>
    </main>
  );

  // ── Done: Customer ───────────────────────────────────────────
  if (view === "done-customer") return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "400px", width: "100%", textAlign: "center" }} className="fade">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "40px" }}><Logo /></div>

        <div style={{ background: "#111116", border: "1px solid #1e1e26", borderRadius: "20px", padding: "40px 28px", marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", color: "#555", textTransform: "uppercase", marginBottom: "10px" }}>Your position</div>
          <div style={{ fontSize: "72px", fontWeight: 900, lineHeight: 1, marginBottom: "6px", letterSpacing: "-2px" }}>
            <span className="gradient-text">#{waitlistResult?.position}</span>
          </div>
          <div style={{ fontSize: "14px", color: "#444" }}>{cForm.city}</div>
        </div>

        <div style={{ background: "#111116", border: "1px solid #1e1e26", borderRadius: "14px", padding: "18px", marginBottom: "12px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>Move up the list</div>
          <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.6, marginBottom: "14px" }}>Every friend who joins with your link moves you ahead.</p>
          <div style={{ background: "#0d0d10", border: "1px solid #1e1e26", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#888", fontFamily: "monospace", wordBreak: "break-all", marginBottom: "10px" }}>
            getrentout.me?ref={waitlistResult?.referralCode}
          </div>
          <button onClick={copyLink} style={{ ...btnPurple, padding: "12px" }}>
            {copied ? "✓ Copied" : "Copy your link"}
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <a href={`https://wa.me/?text=I joined RentOut — hire anyone for anything. Get your spot: https://getrentout.me?ref=${waitlistResult?.referralCode}`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#1a2e1a", border: "1px solid #2d4a2d", borderRadius: "12px", padding: "12px", fontSize: "13px", fontWeight: 600, color: "#4ade80", textDecoration: "none", textAlign: "center" }}>
            WhatsApp
          </a>
          <a href={`https://twitter.com/intent/tweet?text=Just joined %40RentOutApp — hire anyone for anything. https://getrentout.me?ref=${waitlistResult?.referralCode}`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#111116", border: "1px solid #222228", borderRadius: "12px", padding: "12px", fontSize: "13px", fontWeight: 600, color: "#fff", textDecoration: "none", textAlign: "center" }}>
            Post on X
          </a>
        </div>
      </div>
    </main>
  );

  // ── Provider form ────────────────────────────────────────────
  if (view === "provider") return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "400px", width: "100%" }}>
        <BackBtn />
        <div style={{ marginBottom: "28px" }}><Logo /></div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#1a0a2e", border: "1px solid #3b1d6e", borderRadius: "100px", padding: "5px 12px", marginBottom: "20px" }}>
          <span className="live-dot" style={{ background: "#c084fc" }} />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#c084fc" }}>
            <AnimatedNumber value={spots} /> of 100,000 spots left
          </span>
        </div>

        <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.8px", marginBottom: "6px", lineHeight: 1.2 }}>
          Become a founding provider
        </h1>
        <p style={{ fontSize: "15px", color: "#555", marginBottom: "28px", lineHeight: 1.6 }}>
          Any service. Your price. Zero commission — forever.
        </p>

        <form onSubmit={submitProvider} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input required placeholder="Full name" value={pForm.name} onChange={e => setPForm(p => ({ ...p, name: e.target.value }))} style={input} />
          <input required type="email" placeholder="Email address" value={pForm.email} onChange={e => setPForm(p => ({ ...p, email: e.target.value }))} style={input} />
          <input required placeholder="City" value={pForm.city} onChange={e => setPForm(p => ({ ...p, city: e.target.value }))} style={input} />
          <input required placeholder="What will you offer? (e.g. Gaming, Photography)" value={pForm.category} onChange={e => setPForm(p => ({ ...p, category: e.target.value }))} style={input} />
          <div style={{ height: "4px" }} />
          <button type="submit" disabled={loading} style={{ ...btnPurple, opacity: loading ? 0.6 : 1 }}>
            {loading ? "Claiming your spot..." : "Claim founding spot →"}
          </button>
          <p style={{ textAlign: "center", fontSize: "12px", color: "#444" }}>Free forever. No credit card needed.</p>
        </form>
      </div>
    </main>
  );

  // ── Customer form ────────────────────────────────────────────
  if (view === "customer") return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "400px", width: "100%" }}>
        <BackBtn />
        <div style={{ marginBottom: "28px" }}><Logo /></div>

        {refCode && (
          <div style={{ background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#4ade80", marginBottom: "20px" }}>
            ✓ Referred — you&apos;re already ahead of most people.
          </div>
        )}

        <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.8px", marginBottom: "6px" }}>Join the waitlist</h1>
        <p style={{ fontSize: "15px", color: "#555", marginBottom: "28px" }}>First access when we launch in your city.</p>

        <form onSubmit={submitCustomer} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input required placeholder="Full name" value={cForm.name} onChange={e => setCForm(p => ({ ...p, name: e.target.value }))} style={input} />
          <input required type="email" placeholder="Email address" value={cForm.email} onChange={e => setCForm(p => ({ ...p, email: e.target.value }))} style={input} />
          <input required placeholder="City" value={cForm.city} onChange={e => setCForm(p => ({ ...p, city: e.target.value }))} style={input} />
          <div style={{ height: "4px" }} />
          <button type="submit" disabled={loading} style={{ ...btnPurple, opacity: loading ? 0.6 : 1 }}>
            {loading ? "Saving..." : "Reserve my spot →"}
          </button>
          <p style={{ textAlign: "center", fontSize: "12px", color: "#444" }}>Free. No spam. Ever.</p>
        </form>
      </div>
    </main>
  );

  // ── Home ─────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#08080a" }}>

      {/* Nav */}
      <nav style={{ padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #111116", position: "sticky", top: 0, background: "#08080aee", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={() => setView("customer")} style={{ background: "none", border: "none", color: "#555", fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>
            Find someone
          </button>
          <button onClick={() => setView("provider")} style={{ background: "linear-gradient(135deg, #9333ea, #ec4899)", border: "none", borderRadius: "100px", color: "#fff", padding: "9px 18px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Start earning
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "100px 24px 80px", textAlign: "center" }}>

        {/* Live badge */}
        <div className="fade" style={{ marginBottom: "28px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#111116", border: "1px solid #1e1e26", borderRadius: "100px", padding: "8px 16px" }}>
            <span className="live-dot" />
            <span style={{ fontSize: "13px", color: "#888" }}>
              <span style={{ color: "#fff", fontWeight: 600 }}><AnimatedNumber value={spots} /></span> founding spots remaining
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="fade-2" style={{ fontSize: "clamp(44px, 8vw, 80px)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-3px", marginBottom: "24px" }}>
          Hire anyone.<br />
          <span className="gradient-text">For anything.</span>
        </h1>

        <p className="fade-3" style={{ fontSize: "18px", color: "#555", lineHeight: 1.7, marginBottom: "44px", maxWidth: "500px", margin: "0 auto 44px" }}>
          The first marketplace where anyone can offer any service — on their own terms, at their own price.
        </p>

        {/* CTA buttons */}
        <div className="fade-4" style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "60px" }}>
          <button onClick={() => setView("provider")} style={{ background: "linear-gradient(135deg, #9333ea, #ec4899)", border: "none", borderRadius: "14px", color: "#fff", padding: "16px 32px", fontSize: "16px", fontWeight: 700, cursor: "pointer", letterSpacing: "-0.2px" }}>
            Start earning — it&apos;s free
          </button>
          <button onClick={() => setView("customer")} style={{ background: "#111116", border: "1px solid #222228", borderRadius: "14px", color: "#888", padding: "16px 32px", fontSize: "16px", fontWeight: 500, cursor: "pointer" }}>
            Find someone
          </button>
        </div>

        {/* Stats */}
        <div className="fade-4" style={{ display: "flex", gap: "40px", justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { n: "100K", l: "Founding spots" },
            { n: "160+", l: "Countries" },
            { n: "∞", l: "Services" },
          ].map(({ n, l }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "2px" }}>{n}</div>
              <div style={{ fontSize: "13px", color: "#444" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #1e1e26, transparent)" }} />

      {/* How it works */}
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", color: "#444", textTransform: "uppercase", textAlign: "center", marginBottom: "48px" }}>How it works</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2px" }}>
          {[
            { n: "01", t: "List any service", b: "Gaming. Photography. Tutoring. Cooking. Literally anything you can offer." },
            { n: "02", t: "Set your terms", b: "Your price. Your hours. Your rules. No platform telling you what to charge." },
            { n: "03", t: "Get paid instantly", b: "Customer books. You show up. Money in your account. Simple." },
          ].map(({ n, t, b }) => (
            <div key={n} style={{ background: "#111116", border: "1px solid #1e1e26", padding: "28px 24px", borderRadius: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", color: "#9333ea", marginBottom: "12px" }}>{n}</div>
              <div style={{ fontSize: "17px", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.3px" }}>{t}</div>
              <div style={{ fontSize: "14px", color: "#555", lineHeight: 1.7 }}>{b}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #1e1e26, transparent)" }} />

      {/* Bottom CTA */}
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ background: "#111116", border: "1px solid #1e1e26", borderRadius: "24px", padding: "60px 40px" }}>
          <Image src="/logo.png" alt="RentOut" width={64} height={64} style={{ borderRadius: "16px", marginBottom: "24px" }} />
          <h2 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: "12px", lineHeight: 1.1 }}>
            First 100,000 providers.<br />
            <span className="gradient-text">Zero commission. Forever.</span>
          </h2>
          <p style={{ fontSize: "15px", color: "#555", marginBottom: "32px" }}>
            <AnimatedNumber value={spots} /> spots remaining. This offer closes when they&apos;re gone.
          </p>
          <button onClick={() => setView("provider")} style={{ background: "linear-gradient(135deg, #9333ea, #ec4899)", border: "none", borderRadius: "14px", color: "#fff", padding: "16px 40px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>
            Claim my founding spot
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #111116", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <Logo />
        <div style={{ display: "flex", gap: "24px" }}>
          <a href="/privacy" style={{ fontSize: "13px", color: "#333", textDecoration: "none" }}>Privacy</a>
          <a href="/terms" style={{ fontSize: "13px", color: "#333", textDecoration: "none" }}>Terms</a>
        </div>
        <span style={{ fontSize: "13px", color: "#333" }}>© 2025 RentOut</span>
      </div>
    </div>
  );
}
