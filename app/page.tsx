"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const TOTAL = 100000;

function useSpots() {
  const [spots, setSpots] = useState(TOTAL);
  useEffect(() => {
    const go = () => fetch("/api/spots").then(r => r.json()).then(d => setSpots(d.remaining)).catch(() => {});
    go();
    const id = setInterval(go, 30000);
    return () => clearInterval(id);
  }, []);
  return { spots, setSpots };
}

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function CountUp({ to }: { to: number }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return;
      started.current = true;
      io.disconnect();
      const t0 = Date.now(), dur = 1600;
      const tick = () => {
        const p = Math.min((Date.now() - t0) / dur, 1);
        setV(Math.round((1 - Math.pow(1 - p, 4)) * to));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{v.toLocaleString()}</span>;
}

function Ticker({ value }: { value: number }) {
  const [d, setD] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (value === prev.current) return;
    const diff = prev.current - value;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setD(Math.round(prev.current - diff * (1 - Math.pow(1 - i / 40, 3))));
      if (i >= 40) { clearInterval(id); prev.current = value; }
    }, 16);
    return () => clearInterval(id);
  }, [value]);
  return <>{d.toLocaleString()}</>;
}

type V = "home" | "provider" | "customer" | "done-p" | "done-c";

const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
      <Image src="/logo.png" alt="RentOut" width={32} height={32} />
    </div>
    <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px" }}>RentOut</span>
  </div>
);

export default function Page() {
  const [view, setView] = useState<V>("home");
  const [loading, setLoading] = useState(false);
  const [refCode, setRefCode] = useState("");
  const [pSpot, setPSpot] = useState(0);
  const [wl, setWl] = useState<{ position: number; referralCode: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pf, setPf] = useState({ name: "", email: "", city: "", what: "" });
  const [cf, setCf] = useState({ name: "", email: "", city: "" });
  const { spots, setSpots } = useSpots();
  useReveal();

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("ref");
    if (r) setRefCode(r);
  }, []);

  const submitP = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await fetch("/api/provider", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: pf.name, email: pf.email, city: pf.city, category: pf.what }) });
      const d = await fetch("/api/spots").then(r => r.json());
      setSpots(d.remaining); setPSpot(TOTAL - d.remaining);
      setView("done-p");
    } finally { setLoading(false); }
  };

  const submitC = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...cf, referralCode: refCode }) });
      const d = await res.json();
      setWl({ position: d.position, referralCode: d.referralCode });
      setView("done-c");
    } finally { setLoading(false); }
  };

  const copy = () => {
    navigator.clipboard.writeText(`https://getrentout.me?ref=${wl?.referralCode}`);
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  /* ── DONE: Provider ─────────────────────────────────────── */
  if (view === "done-p") return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}><Logo /></div>

        <div className="card" style={{ padding: "40px 28px", marginBottom: 10, borderRadius: 20 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, overflow: "hidden", margin: "0 auto 20px", boxShadow: "0 0 32px rgba(147,51,234,0.4)" }}>
            <Image src="/logo.png" alt="RentOut" width={60} height={60} />
          </div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#444", textTransform: "uppercase", marginBottom: 8 }}>Founding Provider</p>
          <div style={{ fontSize: 68, fontWeight: 900, letterSpacing: "-3px", lineHeight: 1.05, marginBottom: 4 }}>
            <span className="g">#{pSpot.toLocaleString()}</span>
          </div>
          <p style={{ fontSize: 14, color: "#3a3a3a", marginBottom: 24 }}>of 100,000 worldwide</p>
          <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 20, fontSize: 15, color: "#555", lineHeight: 1.7 }}>
            Zero commission on every booking.<br />
            <span style={{ color: "#a855f7", fontWeight: 600 }}>Yours. Forever.</span>
          </div>
        </div>

        <div className="card" style={{ padding: "14px 18px", marginBottom: 10, borderRadius: 14, textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span className="dot" />
            <span style={{ fontSize: 14, fontWeight: 600 }}><Ticker value={spots} /> spots remaining</span>
          </div>
          <p style={{ fontSize: 13, color: "#444" }}>Share before spots are gone. Closes at 100,000.</p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <a href={`https://wa.me/?text=I claimed founding provider spot %23${pSpot.toLocaleString()} on RentOut. Sell ANY service. Zero commission for life. Only ${spots.toLocaleString()} of 100,000 left: https://getrentout.me`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#128C7E", borderRadius: 12, padding: "13px 8px", fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center" }}>
            WhatsApp
          </a>
          <a href={`https://twitter.com/intent/tweet?text=Just claimed founding spot %23${pSpot.toLocaleString()} on RentOut — sell any service%2C zero commission. ${spots.toLocaleString()} left: https://getrentout.me`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 12, padding: "13px 8px", fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center" }}>
            Post on X
          </a>
        </div>
      </div>
    </div>
  );

  /* ── DONE: Customer ─────────────────────────────────────── */
  if (view === "done-c") return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}><Logo /></div>

        <div className="card" style={{ padding: "40px 28px", marginBottom: 10, borderRadius: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#444", textTransform: "uppercase", marginBottom: 8 }}>You&apos;re on the list</p>
          <div style={{ fontSize: 76, fontWeight: 900, letterSpacing: "-3px", lineHeight: 1.05, marginBottom: 4 }}>
            <span className="g">#{wl?.position}</span>
          </div>
          <p style={{ fontSize: 14, color: "#3a3a3a" }}>{cf.city}</p>
        </div>

        <div className="card" style={{ padding: "18px 20px", marginBottom: 10, borderRadius: 14, textAlign: "left" }}>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Move up the list</p>
          <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 14 }}>Every friend who joins with your link moves you ahead.</p>
          <div style={{ background: "#060606", border: "1px solid #1a1a1a", borderRadius: 8, padding: "9px 12px", fontSize: 12, color: "#555", fontFamily: "monospace", wordBreak: "break-all", marginBottom: 10 }}>
            getrentout.me?ref={wl?.referralCode}
          </div>
          <button onClick={copy} className="btn-primary" style={{ width: "100%", padding: 13 }}>
            {copied ? "✓ Copied to clipboard" : "Copy referral link"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <a href={`https://wa.me/?text=I joined RentOut — hire anyone for anything. Get your spot: https://getrentout.me?ref=${wl?.referralCode}`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#128C7E", borderRadius: 12, padding: "12px 8px", fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center" }}>
            WhatsApp
          </a>
          <a href={`https://twitter.com/intent/tweet?text=Just joined RentOut — hire anyone for anything. https://getrentout.me?ref=${wl?.referralCode}`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 12, padding: "12px 8px", fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center" }}>
            Post on X
          </a>
        </div>
      </div>
    </div>
  );

  /* ── FORM ───────────────────────────────────────────────── */
  if (view === "provider" || view === "customer") {
    const isP = view === "provider";
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
        <div style={{ maxWidth: 420, width: "100%" }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 14, padding: 0, marginBottom: 32, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
            ← Back
          </button>
          <div style={{ marginBottom: 28 }}><Logo /></div>

          {isP && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#110820", border: "1px solid #2a1050", borderRadius: 100, padding: "6px 14px", marginBottom: 20 }}>
              <span className="dot" style={{ background: "#a855f7", boxShadow: "0 0 0 0 rgba(168,85,247,0.4)" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#a855f7" }}>
                <Ticker value={spots} /> of 100,000 spots left
              </span>
            </div>
          )}

          {!isP && refCode && (
            <div style={{ background: "#071407", border: "1px solid #183018", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#4ade80", marginBottom: 20 }}>
              ✓ Referred — you&apos;re ahead of the line.
            </div>
          )}

          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.8px", marginBottom: 6, lineHeight: 1.25 }}>
            {isP ? "Become a founding provider" : "Join the waitlist"}
          </h1>
          <p style={{ fontSize: 15, color: "#555", marginBottom: 28, lineHeight: 1.6 }}>
            {isP ? "Any service. Your price. Zero commission — forever." : "First access when we launch in your city."}
          </p>

          <form onSubmit={isP ? submitP : submitC} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input required placeholder="Full name" className="field"
              value={isP ? pf.name : cf.name}
              onChange={e => isP ? setPf(p => ({ ...p, name: e.target.value })) : setCf(p => ({ ...p, name: e.target.value }))} />
            <input required type="email" placeholder="Email address" className="field"
              value={isP ? pf.email : cf.email}
              onChange={e => isP ? setPf(p => ({ ...p, email: e.target.value })) : setCf(p => ({ ...p, email: e.target.value }))} />
            <input required placeholder="Your city" className="field"
              value={isP ? pf.city : cf.city}
              onChange={e => isP ? setPf(p => ({ ...p, city: e.target.value })) : setCf(p => ({ ...p, city: e.target.value }))} />
            {isP && (
              <input required placeholder="What will you offer? (e.g. Gaming, Photography)" className="field"
                value={pf.what} onChange={e => setPf(p => ({ ...p, what: e.target.value }))} />
            )}
            <div style={{ height: 6 }} />
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", fontSize: 15, padding: 15 }}>
              {loading ? "Just a moment..." : isP ? "Claim founding spot" : "Reserve my spot"}
            </button>
            <p style={{ textAlign: "center", fontSize: 12, color: "#2e2e2e", marginTop: 2 }}>
              {isP ? "Free. No credit card needed." : "Free. No spam. Unsubscribe anytime."}
            </p>
          </form>
        </div>
      </div>
    );
  }

  /* ── HOME ───────────────────────────────────────────────── */
  return (
    <div style={{ background: "#000", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 99, background: "rgba(0,0,0,0.92)", borderBottom: "1px solid #111", padding: "0 20px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(12px)" }}>
        <Logo />
        <div className="nav-cta">
          <button className="nav-ghost btn-secondary" onClick={() => setView("customer")}
            style={{ padding: "8px 16px", fontSize: 14, border: "none", background: "none", color: "#555" }}>
            Find someone
          </button>
          <button className="btn-primary" onClick={() => setView("provider")}
            style={{ padding: "9px 18px", fontSize: 14, borderRadius: 100 }}>
            Start earning
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "80px 20px 72px", textAlign: "center" }}>

        {/* Live badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 100, padding: "7px 16px", marginBottom: 32 }}>
          <span className="dot" />
          <span style={{ fontSize: 13, color: "#555" }}>
            <span style={{ color: "#fff", fontWeight: 700 }}><Ticker value={spots} /></span> founding spots remaining
          </span>
        </div>

        {/* Floating icon */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ width: 88, height: 88, borderRadius: 24, overflow: "hidden", margin: "0 auto", animation: "float 5s ease-in-out infinite", boxShadow: "0 0 0 1px #1a1a1a, 0 24px 64px rgba(147,51,234,0.25)" }}>
            <Image src="/logo.png" alt="RentOut" width={88} height={88} priority />
          </div>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: "clamp(44px, 8.5vw, 88px)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "clamp(-2px,-0.04em,-4px)", marginBottom: 20 }}>
          Hire anyone.<br />
          <span className="g">For anything.</span>
        </h1>

        <p style={{ fontSize: "clamp(16px, 2vw, 18px)", color: "#555", lineHeight: 1.75, maxWidth: 480, margin: "0 auto 40px" }}>
          The first marketplace where anyone can monetize any skill — on their own terms, at their own price.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", marginBottom: 56 }}>
          <button className="btn-primary" onClick={() => setView("provider")}
            style={{ width: "100%", maxWidth: 340, fontSize: 16, padding: "15px 32px" }}>
            Start earning — it&apos;s free
          </button>
          <button className="btn-secondary" onClick={() => setView("customer")}
            style={{ width: "100%", maxWidth: 340, fontSize: 15, padding: "14px 32px" }}>
            I want to hire someone
          </button>
        </div>

        {/* Stats */}
        <div className="stats reveal">
          {[
            { label: "Founding spots", value: 100000 },
            { label: "Countries", value: 160 },
            { label: "Providers earning", value: spots > 99990 ? 0 : TOTAL - spots },
          ].map(({ label, value }) => (
            <div className="stat" key={label}>
              <div style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.1 }}>
                {label === "Countries" ? <><CountUp to={value} />+</> : label === "Founding spots" ? <><CountUp to={value} /></> : <CountUp to={value === 0 ? 0 : value} />}
              </div>
              <div style={{ fontSize: 13, color: "#3a3a3a", marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{ height: 1, background: "#111", margin: "0 20px" }} />

      {/* HOW IT WORKS */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "72px 20px" }}>

        <div className="reveal" style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", color: "#333", textTransform: "uppercase", marginBottom: 10 }}>How it works</p>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-1px", color: "#fff" }}>
            Simple as it gets
          </h2>
        </div>

        <div className="bento">
          {/* Wide card */}
          <div className="card bento-wide reveal d1" style={{ padding: "32px 28px" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#140a20", border: "1px solid #2a1050", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, fontSize: 18 }}>
              <span style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>01</span>
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.4px", marginBottom: 8 }}>List any service</h3>
            <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7 }}>Gaming. Photography. Tutoring. Cooking. Travel guide. Companionship. Whatever you can offer — list it in minutes. No categories. No restrictions.</p>
          </div>

          {/* Tall card */}
          <div className="card bento-tall reveal d2" style={{ padding: "32px 28px" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#0d1a0a", border: "1px solid #1a3a14", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <span style={{ color: "#4ade80", fontWeight: 800, fontSize: 14 }}>02</span>
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.4px", marginBottom: 8 }}>Set your terms</h3>
            <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: 24 }}>Your price. Your hours. Your rules. No platform telling you what to charge or how to work.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {["Your price — any amount", "Your hours — any schedule", "Your location — anywhere", "Your rules — your way"].map((t, i) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderTop: i > 0 ? "1px solid #111" : "none" }}>
                  <span style={{ width: 20, height: 20, borderRadius: 6, background: "#0d1a0a", border: "1px solid #1a3a14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: "#4ade80", fontSize: 10, fontWeight: 700 }}>✓</span>
                  </span>
                  <span style={{ fontSize: 14, color: "#666" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card — get paid */}
          <div className="card reveal d1" style={{ padding: "28px 24px", background: "linear-gradient(135deg, #0e0618, #160825)" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <span style={{ color: "#a855f7", fontWeight: 800, fontSize: 14 }}>03</span>
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.4px", marginBottom: 8 }}>Get paid</h3>
            <p style={{ fontSize: 14, color: "#6b5a7e", lineHeight: 1.7 }}>Customer books. You show up. Money in your account. That simple.</p>
          </div>

          {/* Live counter card */}
          <div className="card reveal d2" style={{ padding: "28px 24px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#333", textTransform: "uppercase", marginBottom: 16 }}>Founding spots left</p>
            <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1, marginBottom: 6 }} className="g">
              <Ticker value={spots} />
            </div>
            <p style={{ fontSize: 13, color: "#333", marginBottom: 16 }}>of 100,000 total</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="dot" />
              <span style={{ fontSize: 12, color: "#3a3a3a" }}>Updates live</span>
            </div>
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{ height: 1, background: "#111", margin: "0 20px" }} />

      {/* TRUST */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 20px" }}>
        <div className="reveal" style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center", alignItems: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "#222", textTransform: "uppercase", width: "100%", textAlign: "center" }}>Trusted infrastructure</p>
          {[
            { icon: "🔒", label: "Razorpay Secured" },
            { icon: "🔥", label: "Firebase" },
            { icon: "🛡️", label: "256-bit SSL" },
            { icon: "✅", label: "GDPR Compliant" },
            { icon: "💳", label: "Payoneer Payouts" },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 7, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 100, padding: "8px 14px" }}>
              <span style={{ fontSize: 13 }}>{icon}</span>
              <span style={{ fontSize: 13, color: "#444", fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{ height: 1, background: "#111", margin: "0 20px" }} />

      {/* BOTTOM CTA */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "72px 20px 96px" }}>
        <div className="card reveal" style={{ borderRadius: 22, padding: "clamp(36px, 5vw, 60px) clamp(24px, 5vw, 52px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(147,51,234,0.12), transparent)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.08), transparent)", pointerEvents: "none" }} />

          <div style={{ width: 60, height: 60, borderRadius: 16, overflow: "hidden", margin: "0 auto 22px", boxShadow: "0 0 40px rgba(147,51,234,0.35)" }}>
            <Image src="/logo.png" alt="RentOut" width={60} height={60} />
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "#333", textTransform: "uppercase", marginBottom: 14 }}>Limited time</p>

          <h2 style={{ fontSize: "clamp(26px, 4.5vw, 44px)", fontWeight: 900, letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 12 }}>
            First 100,000 providers.<br />
            <span className="g">Zero commission. Forever.</span>
          </h2>

          <p style={{ fontSize: 15, color: "#444", marginBottom: 32, lineHeight: 1.6 }}>
            <span style={{ color: "#fff", fontWeight: 700 }}><Ticker value={spots} /></span> spots remaining.
            Closes when they&apos;re gone.
          </p>

          <button className="btn-primary" onClick={() => setView("provider")}
            style={{ fontSize: 16, padding: "15px 40px" }}>
            Claim my founding spot
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid #111", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Logo />
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms"].map(t => (
            <a key={t} href={`/${t.toLowerCase()}`} style={{ fontSize: 13, color: "#2e2e2e", textDecoration: "none" }}>{t}</a>
          ))}
        </div>
        <span style={{ fontSize: 13, color: "#222" }}>© 2025 RentOut</span>
      </div>
    </div>
  );
}
