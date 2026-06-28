"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.1 });
    document.querySelectorAll(".fade-in").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        setCount(Math.round(ease * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{count.toLocaleString()}</span>;
}

function LiveCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (value === prev.current) return;
    const diff = prev.current - value;
    const steps = 40;
    let i = 0;
    const id = setInterval(() => {
      i++;
      const ease = 1 - Math.pow(1 - i / steps, 3);
      setDisplay(Math.round(prev.current - diff * ease));
      if (i >= steps) { clearInterval(id); prev.current = value; }
    }, 16);
    return () => clearInterval(id);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

function Card3D({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(8px)`;
  }, []);
  const onLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
  }, []);
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transition: "transform 0.4s ease", transformStyle: "preserve-3d", ...style }}>
      {children}
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
  useScrollReveal();

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

  const inp: React.CSSProperties = {
    width: "100%", padding: "14px 16px",
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px", color: "#fff", fontSize: "15px",
    outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
  };

  const Logo = ({ size = 32 }: { size?: number }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ width: size, height: size, borderRadius: size * 0.28, overflow: "hidden", boxShadow: "0 0 20px #9333ea44", flexShrink: 0 }}>
        <Image src="/logo.png" alt="RentOut" width={size} height={size} style={{ display: "block" }} />
      </div>
      <span style={{ fontSize: size * 0.53, fontWeight: 700, letterSpacing: "-0.3px" }}>RentOut</span>
    </div>
  );

  // ── Done: Provider ──────────────────────────────────────────
  if (view === "done-provider") return (
    <div style={{ minHeight: "100vh", background: "#05000f", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div className="noise" />
      <div style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "40px" }}><Logo /></div>
        <Card3D style={{ marginBottom: "16px" }}>
          <div className="glass" style={{ borderRadius: "24px", padding: "44px 32px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "120px", height: "120px", borderRadius: "50%", background: "radial-gradient(circle, #9333ea44, transparent)" }} />
            <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "100px", height: "100px", borderRadius: "50%", background: "radial-gradient(circle, #ec489933, transparent)" }} />
            <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", color: "#555", textTransform: "uppercase", marginBottom: "12px" }}>Founding Provider</div>
            <div style={{ fontSize: "76px", fontWeight: 900, lineHeight: 1, marginBottom: "4px", letterSpacing: "-3px" }}>
              <span className="gradient-text">#{providerSpot.toLocaleString()}</span>
            </div>
            <div style={{ fontSize: "14px", color: "#444", marginBottom: "28px" }}>of 100,000 worldwide</div>
            <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)", marginBottom: "20px" }} />
            <div style={{ fontSize: "15px", color: "#888", lineHeight: 1.7 }}>
              Zero commission on every booking.<br />
              <span style={{ color: "#c084fc", fontWeight: 600 }}>This spot is yours. Forever.</span>
            </div>
          </div>
        </Card3D>

        <div className="glass" style={{ borderRadius: "16px", padding: "18px 20px", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="live-dot" />
            <span style={{ fontSize: "14px", fontWeight: 600 }}><LiveCounter value={spots} /> spots remaining</span>
          </div>
          <p style={{ fontSize: "13px", color: "#555" }}>Share before they&apos;re gone. Closes when 100,000 is reached.</p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <a href={`https://wa.me/?text=I just claimed founding provider spot %23${providerSpot.toLocaleString()} on RentOut. Sell ANY service. Set YOUR price. Zero commission for life. Only ${spots.toLocaleString()} of 100,000 left: https://getrentout.me`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#128C7E", borderRadius: "12px", padding: "13px", fontSize: "13px", fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center" }}>
            Share on WhatsApp
          </a>
          <a href={`https://twitter.com/intent/tweet?text=Just claimed founding spot %23${providerSpot.toLocaleString()} on RentOut — sell any service%2C set your price%2C zero commission for life. ${spots.toLocaleString()} left: https://getrentout.me`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "13px", fontSize: "13px", fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center" }}>
            Post on X
          </a>
        </div>
      </div>
    </div>
  );

  // ── Done: Customer ──────────────────────────────────────────
  if (view === "done-customer") return (
    <div style={{ minHeight: "100vh", background: "#05000f", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div className="noise" />
      <div style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "40px" }}><Logo /></div>
        <Card3D style={{ marginBottom: "16px" }}>
          <div className="glass" style={{ borderRadius: "24px", padding: "44px 32px" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", color: "#555", textTransform: "uppercase", marginBottom: "12px" }}>You&apos;re on the list</div>
            <div style={{ fontSize: "80px", fontWeight: 900, lineHeight: 1, marginBottom: "4px", letterSpacing: "-3px" }}>
              <span className="gradient-text">#{waitlistResult?.position}</span>
            </div>
            <div style={{ fontSize: "14px", color: "#444" }}>{cForm.city}</div>
          </div>
        </Card3D>

        <div className="glass" style={{ borderRadius: "16px", padding: "18px 20px", marginBottom: "12px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>Move up the list</div>
          <p style={{ fontSize: "13px", color: "#555", marginBottom: "14px" }}>Every friend who signs up with your link moves you ahead.</p>
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "#666", fontFamily: "monospace", wordBreak: "break-all", marginBottom: "10px" }}>
            getrentout.me?ref={waitlistResult?.referralCode}
          </div>
          <button onClick={copyLink} style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg, #9333ea, #ec4899)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
            {copied ? "✓ Copied to clipboard" : "Copy your referral link"}
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <a href={`https://wa.me/?text=I joined RentOut — hire anyone for anything. Get your spot: https://getrentout.me?ref=${waitlistResult?.referralCode}`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#128C7E", borderRadius: "12px", padding: "12px", fontSize: "13px", fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center" }}>
            WhatsApp
          </a>
          <a href={`https://twitter.com/intent/tweet?text=Just joined RentOut — hire anyone for anything. https://getrentout.me?ref=${waitlistResult?.referralCode}`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px", fontSize: "13px", fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center" }}>
            X (Twitter)
          </a>
        </div>
      </div>
    </div>
  );

  // ── Forms ───────────────────────────────────────────────────
  if (view === "provider" || view === "customer") {
    const isProvider = view === "provider";
    return (
      <div style={{ minHeight: "100vh", background: "#05000f", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div className="noise" />
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, #9333ea18 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "420px", width: "100%", position: "relative", zIndex: 1 }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "14px", padding: 0, marginBottom: "32px" }}>← Back</button>
          <div style={{ marginBottom: "32px" }}><Logo /></div>

          {isProvider && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(147,51,234,0.12)", border: "1px solid rgba(147,51,234,0.25)", borderRadius: "100px", padding: "6px 14px", marginBottom: "20px" }}>
              <span className="live-dot" style={{ background: "#c084fc", boxShadow: "0 0 8px #c084fc" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#c084fc" }}>
                <LiveCounter value={spots} /> of 100,000 spots left
              </span>
            </div>
          )}

          <h1 style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "8px", lineHeight: 1.2 }}>
            {isProvider ? "Become a founding provider" : "Join the waitlist"}
          </h1>
          <p style={{ fontSize: "15px", color: "#555", marginBottom: "28px", lineHeight: 1.6 }}>
            {isProvider ? "Any service. Your price. Zero commission — forever." : "First access when we launch in your city."}
          </p>

          {!isProvider && refCode && (
            <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#4ade80", marginBottom: "20px" }}>
              ✓ Referred — you&apos;re ahead of most people.
            </div>
          )}

          <form onSubmit={isProvider ? submitProvider : submitCustomer} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input required placeholder="Full name" value={isProvider ? pForm.name : cForm.name}
              onChange={e => isProvider ? setPForm(p => ({ ...p, name: e.target.value })) : setCForm(p => ({ ...p, name: e.target.value }))} style={inp} />
            <input required type="email" placeholder="Email address" value={isProvider ? pForm.email : cForm.email}
              onChange={e => isProvider ? setPForm(p => ({ ...p, email: e.target.value })) : setCForm(p => ({ ...p, email: e.target.value }))} style={inp} />
            <input required placeholder="Your city" value={isProvider ? pForm.city : cForm.city}
              onChange={e => isProvider ? setPForm(p => ({ ...p, city: e.target.value })) : setCForm(p => ({ ...p, city: e.target.value }))} style={inp} />
            {isProvider && (
              <input required placeholder="What will you offer? (e.g. Gaming, Photography, Tutoring)" value={pForm.category}
                onChange={e => setPForm(p => ({ ...p, category: e.target.value }))} style={inp} />
            )}
            <div style={{ height: "6px" }} />
            <button type="submit" disabled={loading} className="btn-glow"
              style={{ width: "100%", padding: "15px", background: "linear-gradient(135deg, #9333ea, #ec4899)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "15px", fontWeight: 700, cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Just a moment..." : isProvider ? "Claim founding spot →" : "Reserve my spot →"}
            </button>
            <p style={{ textAlign: "center", fontSize: "12px", color: "#333" }}>
              {isProvider ? "Free forever. No credit card." : "Free. No spam. Unsubscribe anytime."}
            </p>
          </form>
        </div>
      </div>
    );
  }

  // ── HOME ────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#05000f", overflowX: "hidden" }}>
      <div className="noise" />

      {/* Aurora background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "60vw", height: "60vw", borderRadius: "50%", background: "radial-gradient(circle, #7c3aed22 0%, transparent 70%)", animation: "aurora 20s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, #ec489918 0%, transparent 70%)", animation: "aurora 25s ease-in-out infinite reverse" }} />
        <div style={{ position: "absolute", top: "40%", left: "30%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, #9333ea12 0%, transparent 70%)", animation: "aurora 18s ease-in-out infinite 5s" }} />
      </div>

      {/* Grid */}
      <div className="grid-bg" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(5,0,15,0.7)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <Logo size={32} />
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={() => setView("customer")} style={{ background: "none", border: "none", color: "#444", fontSize: "14px", cursor: "pointer", fontFamily: "inherit", padding: "8px 14px" }}>
            Find someone
          </button>
          <button onClick={() => setView("provider")} className="btn-glow"
            style={{ background: "linear-gradient(135deg, #9333ea, #ec4899)", border: "none", borderRadius: "100px", color: "#fff", padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Start earning
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto", padding: "120px 24px 100px", textAlign: "center" }}>

        {/* Live badge */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "100px", padding: "8px 18px", backdropFilter: "blur(10px)" }}>
            <span className="live-dot" />
            <span style={{ fontSize: "13px", color: "#888" }}>
              <span style={{ color: "#fff", fontWeight: 700 }}><LiveCounter value={spots} /></span> founding provider spots remaining
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: "clamp(52px, 9vw, 96px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-4px", marginBottom: "28px" }}>
          Hire anyone.<br />
          <span className="gradient-text">For anything.</span>
        </h1>

        <p style={{ fontSize: "clamp(16px, 2.5vw, 20px)", color: "#555", lineHeight: 1.7, marginBottom: "48px", maxWidth: "520px", margin: "0 auto 48px" }}>
          The first marketplace where anyone can monetize any skill — on their own terms, at their own price.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "80px" }}>
          <button onClick={() => setView("provider")} className="btn-glow"
            style={{ background: "linear-gradient(135deg, #9333ea, #ec4899)", border: "none", borderRadius: "14px", color: "#fff", padding: "18px 36px", fontSize: "17px", fontWeight: 700, cursor: "pointer", letterSpacing: "-0.3px" }}>
            Start earning — it&apos;s free
          </button>
          <button onClick={() => setView("customer")}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", color: "#888", padding: "18px 36px", fontSize: "17px", fontWeight: 500, cursor: "pointer", backdropFilter: "blur(10px)" }}>
            Find someone
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "0", justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { n: 100000, l: "Founding spots", prefix: "" },
            { n: 160, l: "Countries", prefix: "" },
            { n: 0, l: "Commission for founders", prefix: "" },
          ].map(({ n, l, prefix }, i) => (
            <div key={l} style={{ padding: "0 40px", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none", textAlign: "center" }}>
              <div style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: "2px" }}>
                {n === 0 ? "0%" : <><AnimatedCounter target={n} />{prefix}</>}
              </div>
              <div style={{ fontSize: "13px", color: "#444" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)", position: "relative", zIndex: 1 }} />

      {/* Floating logo section */}
      <div style={{ position: "relative", zIndex: 1, padding: "100px 24px", textAlign: "center" }}>
        <div className="fade-in" style={{ display: "inline-block", marginBottom: "40px", animation: "float 6s ease-in-out infinite", position: "relative" }}>
          <div style={{ position: "absolute", inset: "-20px", borderRadius: "50%", border: "1px solid rgba(147,51,234,0.15)", animation: "pulse-ring 3s ease-out infinite" }} />
          <div style={{ position: "absolute", inset: "-40px", borderRadius: "50%", border: "1px solid rgba(147,51,234,0.08)", animation: "pulse-ring 3s ease-out infinite 1s" }} />
          <div style={{ width: "96px", height: "96px", borderRadius: "26px", overflow: "hidden", boxShadow: "0 0 60px #9333ea44, 0 0 120px #9333ea22" }}>
            <Image src="/logo.png" alt="RentOut" width={96} height={96} style={{ display: "block" }} />
          </div>
        </div>

        <h2 className="fade-in" style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, letterSpacing: "-2px", marginBottom: "16px", lineHeight: 1.1 }}>
          Any skill.<br /><span className="gradient-text">Any price. Your rules.</span>
        </h2>
        <p className="fade-in" style={{ fontSize: "16px", color: "#444", maxWidth: "400px", margin: "0 auto", lineHeight: 1.7 }}>
          Gaming. Photography. Tutoring. Cooking. Travel guide. Whatever you&apos;re good at — someone needs it.
        </p>
      </div>

      {/* 3 cards */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto", padding: "0 24px 100px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
          {[
            { n: "01", t: "List any service", b: "Gaming. Photography. Tutoring. Cooking. Companionship. Whatever you can offer — list it.", icon: "⚡" },
            { n: "02", t: "Set your terms", b: "Your price. Your hours. Your rules. No platform telling you what to charge or how to work.", icon: "🎯" },
            { n: "03", t: "Get paid", b: "Customer books you. You show up. Money hits your account. That simple.", icon: "💸" },
          ].map(({ n, t, b, icon }) => (
            <Card3D key={n}>
              <div className="fade-in glass" style={{ borderRadius: "20px", padding: "32px 24px", height: "100%" }}>
                <div style={{ fontSize: "28px", marginBottom: "16px" }}>{icon}</div>
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "#9333ea", marginBottom: "10px" }}>{n}</div>
                <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.3px" }}>{t}</div>
                <div style={{ fontSize: "14px", color: "#555", lineHeight: 1.7 }}>{b}</div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>

      {/* Trust section */}
      <div style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.04)", padding: "60px 24px" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <div className="fade-in shimmer-text" style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "32px" }}>
            Trusted infrastructure
          </div>
          <div style={{ display: "flex", gap: "32px", justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
            {["Razorpay Secured", "Firebase", "256-bit SSL", "GDPR Compliant"].map(t => (
              <div key={t} className="fade-in" style={{ fontSize: "13px", color: "#333", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#22c55e", fontSize: "10px" }}>✓</span> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ position: "relative", zIndex: 1, padding: "80px 24px 100px" }}>
        <Card3D style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div className="glass-purple fade-in" style={{ borderRadius: "28px", padding: "64px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, #9333ea33, transparent)" }} />
            <div style={{ position: "absolute", bottom: "-40px", left: "-40px", width: "160px", height: "160px", borderRadius: "50%", background: "radial-gradient(circle, #ec489922, transparent)" }} />

            <div style={{ width: "64px", height: "64px", borderRadius: "18px", overflow: "hidden", margin: "0 auto 24px", boxShadow: "0 0 40px #9333ea66" }}>
              <Image src="/logo.png" alt="RentOut" width={64} height={64} style={{ display: "block" }} />
            </div>

            <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", color: "#9333ea", textTransform: "uppercase", marginBottom: "16px" }}>
              Limited time
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, letterSpacing: "-1.5px", marginBottom: "12px", lineHeight: 1.1 }}>
              First 100,000 providers.<br />
              <span className="gradient-text">Zero commission. Forever.</span>
            </h2>
            <p style={{ fontSize: "16px", color: "#555", marginBottom: "36px" }}>
              <span style={{ color: "#fff", fontWeight: 600 }}><LiveCounter value={spots} /></span> spots remaining. Closes when they&apos;re gone.
            </p>
            <button onClick={() => setView("provider")} className="btn-glow"
              style={{ background: "linear-gradient(135deg, #9333ea, #ec4899)", border: "none", borderRadius: "14px", color: "#fff", padding: "18px 48px", fontSize: "17px", fontWeight: 700, cursor: "pointer", letterSpacing: "-0.3px" }}>
              Claim my founding spot
            </button>
          </div>
        </Card3D>
      </div>

      {/* Footer */}
      <div style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.04)", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <Logo size={28} />
        <div style={{ display: "flex", gap: "24px" }}>
          {["Privacy", "Terms"].map(t => (
            <a key={t} href={`/${t.toLowerCase()}`} style={{ fontSize: "13px", color: "#333", textDecoration: "none" }}>{t}</a>
          ))}
        </div>
        <span style={{ fontSize: "13px", color: "#2a2a2a" }}>© 2025 RentOut</span>
      </div>
    </div>
  );
}
