"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const TOTAL = 100000;
const CLOSE_DATE = new Date("2026-07-19T23:59:59");

function useSpots() {
  const [spots, setSpots] = useState(TOTAL);
  useEffect(() => {
    const go = () => fetch("/api/spots").then(r => r.json()).then(d => setSpots(d.remaining)).catch(() => {});
    go();
    const id = setInterval(go, 30000);
    return () => clearInterval(id);
  }, []);
  return spots;
}

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useCursorGlow() {
  useEffect(() => {
    const el = document.getElementById("cursor-glow");
    if (!el) return;
    const move = (e: MouseEvent) => { el.style.left = e.clientX + "px"; el.style.top = e.clientY + "px"; };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
}

function useCountdown() {
  const [t, setT] = useState({ d: 0, h: 0, m: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = CLOSE_DATE.getTime() - Date.now();
      if (diff <= 0) return;
      setT({ d: Math.floor(diff / 864e5), h: Math.floor((diff % 864e5) / 36e5), m: Math.floor((diff % 36e5) / 6e4) });
    };
    tick(); const id = setInterval(tick, 30000); return () => clearInterval(id);
  }, []);
  return t;
}

function CountUp({ to }: { to: number }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return;
      done.current = true; io.disconnect();
      const t0 = Date.now(), dur = 1800;
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
    const diff = prev.current - value; let i = 0;
    const id = setInterval(() => {
      i++; setD(Math.round(prev.current - diff * (1 - Math.pow(1 - i / 40, 3))));
      if (i >= 40) { clearInterval(id); prev.current = value; }
    }, 16);
    return () => clearInterval(id);
  }, [value]);
  return <>{d.toLocaleString()}</>;
}

const SERVICES = [
  { who: "Arjun", what: "FIFA gaming partner", price: "₹499/hr", tag: "Gaming", c: "#9B6DFF" },
  { who: "Priya", what: "Portrait photographer", price: "₹1,499/hr", tag: "Photography", c: "#F28B82" },
  { who: "Rohan", what: "Spanish conversation", price: "₹699/hr", tag: "Language", c: "#38bdf8" },
  { who: "Sneha", what: "Watch-party companion", price: "₹899/hr", tag: "Social", c: "#9B6DFF" },
  { who: "Karan", what: "City photo walk", price: "₹999/hr", tag: "Travel", c: "#fb923c" },
  { who: "Ananya", what: "Fitness coach", price: "₹799/session", tag: "Fitness", c: "#F28B82" },
  { who: "Dev", what: "Guitar lessons", price: "₹599/hr", tag: "Music", c: "#9B6DFF" },
  { who: "Meera", what: "Study partner", price: "₹399/hr", tag: "Tutoring", c: "#38bdf8" },
];

const TESTIMONIALS = [
  { quote: "Made ₹18,000 in my first two weeks just playing FIFA with people. Zero commission means I actually keep it all.", name: "Arjun S.", role: "Gaming partner, Delhi" },
  { quote: "Finally a platform that doesn't take 30% of everything. Set my own rates, work when I want.", name: "Priya M.", role: "Photographer, Mumbai" },
  { quote: "Listed my guitar lessons and got 3 bookings the same week. The setup took 5 minutes.", name: "Dev K.", role: "Music teacher, Bangalore" },
];

const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ width: 32, height: 32, borderRadius: 9, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg, #1a1228, #120d1e)", border: "1px solid rgba(155,109,255,0.25)" }}>
      <Image src="/logo.png" alt="RentOut" width={32} height={32} style={{ borderRadius: 8 }} />
    </div>
    <span className="logo-text">RentOut</span>
  </div>
);

type V = "home" | "form" | "done";

export default function Page() {
  const [view, setView] = useState<V>("home");
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", city: "", category: "" });
  const spots = useSpots();
  const cd = useCountdown();
  const taken = TOTAL - spots;
  useReveal();
  useCursorGlow();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setPosition(data.position ?? taken + 1);
      setView("done");
    } finally {
      setLoading(false);
    }
  };

  /* ── DONE ── */
  if (view === "done") return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", position: "relative", overflow: "hidden" }}>
      <div id="cursor-glow" className="cursor-glow" />
      <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: 600, height: 500, background: "radial-gradient(ellipse, rgba(155,109,255,0.12), transparent 65%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 440, width: "100%", textAlign: "center", position: "relative" }} className="page-in">
        <div style={{ width: 80, height: 80, borderRadius: 22, overflow: "hidden", margin: "0 auto 32px", background: "linear-gradient(135deg, #1a1228, #120d1e)", boxShadow: "0 0 0 1px rgba(155,109,255,0.3), 0 20px 60px rgba(155,109,255,0.5)" }}>
          <Image src="/logo.png" alt="RentOut" width={80} height={80} />
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 12 }}>
          Founding Provider
        </p>
        <div style={{ fontSize: "clamp(72px, 14vw, 100px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.95, marginBottom: 10 }}>
          <span className="g">#{position.toLocaleString()}</span>
        </div>
        <p style={{ fontSize: 16, color: "var(--text-dim)", marginBottom: 40, lineHeight: 1.6 }}>
          of 100,000 founding providers worldwide
        </p>

        <div className="card" style={{ padding: "24px 28px", marginBottom: 24, textAlign: "left", borderRadius: 16 }}>
          <p style={{ fontSize: 15, color: "var(--text-body)", lineHeight: 1.75, marginBottom: 16 }}>
            You&apos;re in. We&apos;ll email you directly when the beta app is ready to download — <span style={{ color: "var(--text)", fontWeight: 600 }}>no confirmation email for now.</span>
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <span className="dot" />
            <span style={{ fontSize: 13, color: "var(--text-dim)" }}>
              <Ticker value={taken} /> founders signed up so far
            </span>
          </div>
        </div>

        <p style={{ fontSize: 13, color: "var(--text-faint)", marginBottom: 16 }}>
          Share with other providers while spots are free
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <a href={`https://wa.me/?text=I just claimed founding provider spot %23${position.toLocaleString()} on RentOut — sell ANY service, set YOUR price, zero commission for life. Sign up free: https://getrentout.me`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#128C7E", borderRadius: 13, padding: "14px 8px", fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center" }}>
            WhatsApp
          </a>
          <a href={`https://twitter.com/intent/tweet?text=Just claimed founding provider spot %23${position.toLocaleString()} on %40RentOut — any service, your price, zero commission for life: https://getrentout.me`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 13, padding: "14px 8px", fontSize: 14, fontWeight: 700, color: "var(--text)", textDecoration: "none", textAlign: "center" }}>
            Post on X
          </a>
        </div>
      </div>
    </div>
  );

  /* ── FORM ── */
  if (view === "form") return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <div id="cursor-glow" className="cursor-glow" />
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 99, background: "rgba(7,7,10,0.85)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(16px)" }}>
        <Logo />
        <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 14, padding: "8px 0", transition: "color .2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-dim)")}>
          ← Back
        </button>
      </nav>

      <div className="form-layout" style={{ paddingTop: 58, minHeight: "100vh" }}>
        {/* Left — brand */}
        <div className="form-brand" style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -100, left: -100, width: 500, height: 500, background: "radial-gradient(circle, rgba(155,109,255,0.15), transparent 65%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", maxWidth: 420 }}>
            <p className="section-label" style={{ marginBottom: 20 }}>Founding offer</p>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 20 }}>
              Your service.<br />Your price.<br /><span className="g">Zero cut. Forever.</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-body)", lineHeight: 1.75, marginBottom: 40 }}>
              The first 100,000 providers on RentOut keep every rupee they earn — for life. Offer closes in {cd.d} days.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
              {[
                "Keep 100% of every booking — forever",
                "Set your own price and availability",
                "No fixed categories — offer anything",
                "Verified customers, escrow payments",
                "Beta app access before public launch",
              ].map(text => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(155,109,255,0.12)", border: "1px solid rgba(155,109,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--accent)", fontWeight: 800, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", background: "rgba(155,109,255,0.07)", border: "1px solid rgba(155,109,255,0.15)", borderRadius: 12 }}>
              <span className="dot" />
              <span style={{ fontSize: 13, color: "var(--text-dim)" }}>
                <Ticker value={taken} /> of 100,000 founding spots taken
              </span>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="form-panel">
          <div style={{ maxWidth: 400, width: "100%" }} className="page-in">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(155,109,255,0.08)", border: "1px solid rgba(155,109,255,0.18)", borderRadius: 100, padding: "6px 14px", marginBottom: 28 }}>
              <span className="dot" style={{ background: "var(--accent)" }} />
              <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>Closes in {cd.d}d {cd.h}h</span>
            </div>

            <h3 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>
              Claim your founding spot
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 28, lineHeight: 1.6 }}>
              Free. 60 seconds. We&apos;ll email you when the beta is ready.
            </p>

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Full name", key: "name", placeholder: "Your name", type: "text" },
                { label: "Email address", key: "email", placeholder: "you@email.com", type: "email" },
                { label: "Your city", key: "city", placeholder: "Delhi, Mumbai, Bangalore…", type: "text" },
                { label: "What will you offer?", key: "category", placeholder: "Gaming, Photography, Fitness…", type: "text" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dim)", letterSpacing: "0.04em", display: "block", marginBottom: 7 }}>{label}</label>
                  <input
                    required type={type} placeholder={placeholder} className="field"
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div style={{ height: 4 }} />
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", fontSize: 15, padding: "17px", borderRadius: 13 }}>
                {loading ? "Saving your spot…" : "Claim founding spot"}
              </button>
              <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-faint)" }}>
                Free forever. No credit card. No spam.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── HOME ── */
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div id="cursor-glow" className="cursor-glow" />

      <nav style={{ position: "sticky", top: 0, zIndex: 99, background: "rgba(7,7,10,0.85)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(16px)" }}>
        <Logo />
        <button className="btn-primary" onClick={() => setView("form")} style={{ padding: "9px 20px", fontSize: 14, borderRadius: 100 }}>
          Start earning
        </button>
      </nav>

      {/* HERO */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 1000, height: 700, background: "radial-gradient(ellipse at center, rgba(155,109,255,0.14), transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, right: "0%", width: 600, height: 500, background: "radial-gradient(ellipse at center, rgba(242,139,130,0.05), transparent 60%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 960, margin: "0 auto", padding: "104px 24px 96px", textAlign: "center" }}>
          <div className="hero-eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(155,109,255,0.07)", border: "1px solid rgba(155,109,255,0.16)", borderRadius: 100, padding: "7px 18px", marginBottom: 52 }}>
            <span className="dot" />
            <span style={{ fontSize: 13, color: "var(--text-dim)", letterSpacing: "0.01em" }}>
              Founding offer — <span style={{ color: "var(--text)", fontWeight: 600 }}>{cd.d}d {cd.h}h left</span>
            </span>
          </div>

          <h1 className="hero-h1" style={{ fontSize: "clamp(58px, 13vw, 140px)", fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.055em", marginBottom: 36 }}>
            Sell anything.<br /><span className="g">Keep everything.</span>
          </h1>

          <p className="hero-sub" style={{ fontSize: "clamp(17px, 2vw, 21px)", color: "var(--text-body)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 56px" }}>
            RentOut is India&apos;s first marketplace where you can offer any service — gaming, photography, tutoring, fitness, anything — and keep 100% of every booking. Forever.
          </p>

          <div className="hero-cta" style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
            <button className="btn-primary" onClick={() => setView("form")} style={{ fontSize: 17, padding: "20px 48px", borderRadius: 14 }}>
              Claim your founding spot — free
            </button>
          </div>

          <p className="hero-note" style={{ fontSize: 13, color: "var(--text-faint)", letterSpacing: "0.01em" }}>
            <Ticker value={taken} /> of 100,000 founding spots taken · Zero commission forever
          </p>
        </div>
      </div>

      {/* MARQUEE */}
      <div style={{ overflow: "hidden", padding: "16px 0", maskImage: "linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)" }}>
        <div style={{ display: "flex", gap: 14, width: "max-content", animation: "marquee 55s linear infinite" }}>
          {[...SERVICES, ...SERVICES].map((s, i) => (
            <div key={i} className="card" style={{ width: 268, padding: "20px 22px", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 13 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: `${s.c}18`, border: `1px solid ${s.c}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: s.c, flexShrink: 0 }}>{s.who[0]}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{s.who}</div>
                  <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 1 }}>{s.tag}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-body)", marginBottom: 14, lineHeight: 1.4 }}>{s.what}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{s.price}</span>
                <span style={{ fontSize: 12, color: s.c, fontWeight: 600 }}>Book →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "80px 24px 20px" }}>
        <div className="stats reveal">
          {[
            { l: "Founding spots available", v: 100000, s: "" },
            { l: "Indian cities at launch", v: 20, s: "+" },
            { l: "Commission for founders", v: -1, s: "" },
          ].map(({ l, v, s }) => (
            <div className="stat" key={l}>
              <div className="stat-num">{v === -1 ? <span className="g">0%</span> : <><CountUp to={v} />{s}</>}</div>
              <div style={{ fontSize: 13, color: "var(--text-faint)", marginTop: 8, letterSpacing: "0.02em" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <hr className="hr" style={{ marginTop: 80 }} />

      {/* HOW IT WORKS */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "100px 24px" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 60 }}>
          <p className="section-label">01 — How it works</p>
          <h2 style={{ fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 900, letterSpacing: "-0.04em" }}>Earn in three steps</h2>
        </div>
        <div className="bento">
          <div className="card bento-wide reveal d1" style={{ padding: "40px 36px" }}>
            <div className="step-badge-purple">Step 01</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 10 }}>List any service</h3>
            <p style={{ fontSize: 15, color: "var(--text-body)", lineHeight: 1.75 }}>Gaming, photography, tutoring, cooking, fitness — whatever you&apos;re good at. No fixed categories. Live in minutes.</p>
          </div>
          <div className="card bento-tall reveal d2" style={{ padding: "40px 36px" }}>
            <div className="step-badge-purple">Step 02</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 10 }}>Set your terms</h3>
            <p style={{ fontSize: 15, color: "var(--text-body)", lineHeight: 1.75, marginBottom: 24 }}>Your price. Your hours. Your rules.</p>
            <div>
              {["Any price you set", "Any hours you choose", "Anywhere you are", "Your rules, always"].map((t, i) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i ? "1px solid var(--border)" : "none" }}>
                  <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 800, width: 18, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 14, color: "var(--text-dim)" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card reveal d1" style={{ padding: "40px 36px" }}>
            <div className="step-badge-coral">Step 03</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 10 }}>Get paid</h3>
            <p style={{ fontSize: 15, color: "var(--text-body)", lineHeight: 1.75 }}>Customer books. You show up. Money hits your account via Razorpay.</p>
          </div>
          <div className="card reveal d2" style={{ padding: "36px 32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 20 }}>You keep</p>
            <div>
              <div style={{ fontSize: "clamp(56px, 8vw, 80px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 6 }} className="g">100%</div>
              <p style={{ fontSize: 14, color: "var(--text-dim)" }}>of every booking, for life</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
              <span className="dot" style={{ background: "var(--accent)" }} />
              <span style={{ fontSize: 13, color: "var(--text-faint)" }}><Ticker value={taken} /> founders joined</span>
            </div>
          </div>
        </div>
      </div>

      <hr className="hr" />

      {/* TESTIMONIALS */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "100px 24px" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 60 }}>
          <p className="section-label">02 — Early providers</p>
          <h2 style={{ fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 900, letterSpacing: "-0.04em" }}>Already earning</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={`card reveal${i > 0 ? ` d${i}` : ""}`} style={{ padding: "32px 28px" }}>
              <p style={{ fontSize: 15, color: "var(--text-body)", lineHeight: 1.75, marginBottom: 24, fontStyle: "italic" }}>&ldquo;{t.quote}&rdquo;</p>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: "var(--text-faint)" }}>{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="hr" />

      {/* TRUST */}
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "56px 24px" }}>
        <p className="reveal" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "var(--text-faint)", textTransform: "uppercase", textAlign: "center", marginBottom: 28 }}>Built on trusted infrastructure</p>
        <div className="trust-row reveal d1">
          {["Razorpay", "Payoneer", "Firebase", "256-bit SSL", "GDPR ready"].map(t => (
            <span key={t} className="trust-item">{t}</span>
          ))}
        </div>
      </div>

      <hr className="hr" />

      {/* BOTTOM CTA */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "100px 24px 120px" }}>
        <div className="card reveal" style={{ borderRadius: 24, padding: "clamp(52px, 8vw, 88px) clamp(28px, 6vw, 72px)", textAlign: "center", position: "relative", overflow: "hidden", border: "1px solid rgba(155,109,255,0.16)", background: "linear-gradient(160deg, rgba(155,109,255,0.06) 0%, var(--surface) 55%)" }}>
          <div style={{ position: "absolute", top: -140, left: "50%", transform: "translateX(-50%)", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(155,109,255,0.13), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -80, right: "0%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,139,130,0.06), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "var(--accent)", textTransform: "uppercase", background: "rgba(155,109,255,0.08)", border: "1px solid rgba(155,109,255,0.18)", borderRadius: 100, padding: "6px 16px" }}>
              <span className="dot" style={{ background: "var(--accent)", width: 6, height: 6 }} /> Offer closes in {cd.d}d {cd.h}h
            </div>
            <h2 style={{ fontSize: "clamp(32px, 5.5vw, 60px)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.02, marginBottom: 18 }}>
              Be a founding provider.<br /><span className="g">Zero commission. Forever.</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 460, margin: "0 auto 40px" }}>
              The first 100,000 providers keep 100% of every booking — for life. After launch, this never comes back.
            </p>
            <button className="btn-primary" onClick={() => setView("form")} style={{ fontSize: 16, padding: "18px 48px", borderRadius: 14 }}>
              Claim my founding spot
            </button>
          </div>
        </div>
      </div>

      <hr className="hr" />
      <div style={{ padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <Logo />
        <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          {["Privacy", "Terms"].map(t => (
            <a key={t} href={`/${t.toLowerCase()}`} style={{ fontSize: 13, color: "var(--text-faint)", textDecoration: "none", transition: "color .2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text-dim)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-faint)")}>{t}</a>
          ))}
          <a href="mailto:hello@getrentout.me" style={{ fontSize: 13, color: "var(--text-faint)", textDecoration: "none", transition: "color .2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-dim)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-faint)")}>hello@getrentout.me</a>
        </div>
        <span style={{ fontSize: 13, color: "var(--text-faint)" }}>© 2026 RentOut</span>
      </div>
    </div>
  );
}
