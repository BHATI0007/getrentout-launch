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
  { who: "Arjun", what: "FIFA gaming partner", price: "$6/hr", tag: "Gaming", c: "#9B6DFF" },
  { who: "Priya", what: "Portrait photographer", price: "$18/hr", tag: "Photography", c: "#F28B82" },
  { who: "Rohan", what: "Spanish conversation", price: "$8/hr", tag: "Language", c: "#38bdf8" },
  { who: "Sneha", what: "Watch-party companion", price: "$11/hr", tag: "Social", c: "#9B6DFF" },
  { who: "Karan", what: "City photo walk", price: "$12/hr", tag: "Travel", c: "#fb923c" },
  { who: "Ananya", what: "Fitness coach", price: "$10/session", tag: "Fitness", c: "#F28B82" },
  { who: "Dev", what: "Guitar lessons", price: "$7/hr", tag: "Music", c: "#9B6DFF" },
  { who: "Meera", what: "Study partner", price: "$5/hr", tag: "Tutoring", c: "#38bdf8" },
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
  const [form, setForm] = useState({ name: "", email: "", city: "" });
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
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 800, height: 600, background: "radial-gradient(ellipse, rgba(155,109,255,0.13), transparent 60%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 500, height: 400, background: "radial-gradient(ellipse, rgba(242,139,130,0.06), transparent 60%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 520, width: "100%", textAlign: "center", position: "relative" }} className="page-in">

        {/* Position badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(155,109,255,0.1)", border: "1px solid rgba(155,109,255,0.2)", borderRadius: 100, padding: "7px 18px", marginBottom: 40 }}>
          <span className="dot" />
          <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600, letterSpacing: "0.02em" }}>You&apos;re in</span>
        </div>

        {/* Big number */}
        <div style={{ fontSize: "clamp(80px, 18vw, 160px)", fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 0.88, marginBottom: 20 }}>
          <span className="g">#{position.toLocaleString()}</span>
        </div>

        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 8 }}>
          Early access
        </p>

        <p style={{ fontSize: 17, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 380, margin: "0 auto 48px" }}>
          Watch your inbox. We&apos;ll email you when it&apos;s time.
        </p>

        {/* Live counter */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 48 }}>
          <span className="dot" />
          <span style={{ fontSize: 14, color: "var(--text-dim)" }}>
            <Ticker value={taken} /> {taken === 1 ? "person" : "people"} signed up
          </span>
        </div>

        {/* Share section */}
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 16 }}>
          Spread the word
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <a href={`https://wa.me/?text=Just got early access to RentOut — something big is coming. Get yours: https://getrentout.me`}
            target="_blank" rel="noopener"
            style={{ background: "#128C7E", borderRadius: 13, padding: "14px 8px", fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center", display: "block" }}>
            WhatsApp
          </a>
          <a href={`https://twitter.com/intent/tweet?text=Just got early access to RentOut — something big is coming: https://getrentout.me`}
            target="_blank" rel="noopener"
            style={{ background: "#000", border: "1px solid #333", borderRadius: 13, padding: "14px 8px", fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center", display: "block" }}>
            X / Twitter
          </a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=https://getrentout.me`}
            target="_blank" rel="noopener"
            style={{ background: "#0A66C2", borderRadius: 13, padding: "14px 8px", fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center", display: "block" }}>
            LinkedIn
          </a>
          <button
            onClick={() => { navigator.clipboard.writeText("https://getrentout.me"); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 13, padding: "14px 8px", fontSize: 14, fontWeight: 700, color: copied ? "var(--accent)" : "var(--text)", cursor: "pointer", textAlign: "center", display: "block", width: "100%" }}>
            {copied ? "✓ Copied" : "Copy link"}
          </button>
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
            <p className="section-label" style={{ marginBottom: 20 }}>Early access</p>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 20 }}>
              Something big<br />is coming.<br /><span className="g">Get in early.</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-body)", lineHeight: 1.75, marginBottom: 40 }}>
              We&apos;re not ready to reveal everything yet. Sign up and be among the first to know when we launch.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
              {[
                "Early access before anyone else",
                "First in line on launch day",
                "Exclusive early member benefits",
                "Direct line to the team",
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
                <Ticker value={taken} /> people already signed up
              </span>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="form-panel">
          <div style={{ maxWidth: 400, width: "100%" }} className="page-in">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(155,109,255,0.08)", border: "1px solid rgba(155,109,255,0.18)", borderRadius: 100, padding: "6px 14px", marginBottom: 28 }}>
              <span className="dot" style={{ background: "var(--accent)" }} />
              <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>Early access open now</span>
            </div>

            <h3 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>
              Get early access
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 28, lineHeight: 1.6 }}>
              60 seconds. We&apos;ll email you when we&apos;re ready.
            </p>

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Full name", key: "name", placeholder: "Your name", type: "text" },
                { label: "Email address", key: "email", placeholder: "you@email.com", type: "email" },
                { label: "Your city", key: "city", placeholder: "New York, London, Tokyo…", type: "text" },
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
                {loading ? "Just a moment…" : "Get early access"}
              </button>
              <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-faint)" }}>
                No credit card. No spam.
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
          Get early access
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
              <span style={{ color: "var(--text)", fontWeight: 600 }}>Early access open</span>
            </span>
          </div>

          <h1 className="hero-h1" style={{ fontSize: "clamp(58px, 13vw, 140px)", fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.055em", marginBottom: 36 }}>
            Sell anything.<br /><span className="g">Keep everything.</span>
          </h1>

          <p className="hero-sub" style={{ fontSize: "clamp(17px, 2vw, 21px)", color: "var(--text-body)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 56px" }}>
            Something new is coming. Sign up now and be among the first to know.
          </p>

          <div className="hero-cta" style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
            <button className="btn-primary" onClick={() => setView("form")} style={{ fontSize: 17, padding: "20px 48px", borderRadius: 14 }}>
              Get early access
            </button>
          </div>

          <p className="hero-note" style={{ fontSize: 13, color: "var(--text-faint)", letterSpacing: "0.01em" }}>
            <Ticker value={taken} /> people already signed up
          </p>
        </div>
      </div>

      {/* STATS */}
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "80px 24px 20px" }}>
        <div className="reveal" style={{ textAlign: "center" }}>
          <div className="stat-num"><CountUp to={100000} /></div>
          <div style={{ fontSize: 13, color: "var(--text-faint)", marginTop: 8, letterSpacing: "0.02em" }}>Early access spots</div>
        </div>
      </div>

      <hr className="hr" style={{ marginTop: 80 }} />

      {/* BOTTOM CTA */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "100px 24px 120px" }}>
        <div className="card reveal" style={{ borderRadius: 24, padding: "clamp(52px, 8vw, 88px) clamp(28px, 6vw, 72px)", textAlign: "center", position: "relative", overflow: "hidden", border: "1px solid rgba(155,109,255,0.16)", background: "linear-gradient(160deg, rgba(155,109,255,0.06) 0%, var(--surface) 55%)" }}>
          <div style={{ position: "absolute", top: -140, left: "50%", transform: "translateX(-50%)", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(155,109,255,0.13), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -80, right: "0%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,139,130,0.06), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "var(--accent)", textTransform: "uppercase", background: "rgba(155,109,255,0.08)", border: "1px solid rgba(155,109,255,0.18)", borderRadius: 100, padding: "6px 16px" }}>
              <span className="dot" style={{ background: "var(--accent)", width: 6, height: 6 }} /> Early access open
            </div>
            <h2 style={{ fontSize: "clamp(32px, 5.5vw, 60px)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.02, marginBottom: 18 }}>
              Don&apos;t wait.<br /><span className="g">Get in early.</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 460, margin: "0 auto 40px" }}>
              We&apos;re building something new. Sign up now and be among the first to experience it.
            </p>
            <button className="btn-primary" onClick={() => setView("form")} style={{ fontSize: 16, padding: "18px 48px", borderRadius: 14 }}>
              Get early access
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
