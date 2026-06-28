"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = Date.now();
      const dur = 1400;
      const tick = () => {
        const p = Math.min((Date.now() - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setV(Math.round(ease * to));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{v.toLocaleString()}{suffix}</span>;
}

function Ticker({ value }: { value: number }) {
  const [d, setD] = useState(value);
  const p = useRef(value);
  useEffect(() => {
    if (value === p.current) return;
    const diff = p.current - value;
    let i = 0;
    const id = setInterval(() => {
      i++;
      const e = 1 - Math.pow(1 - i / 40, 3);
      setD(Math.round(p.current - diff * e));
      if (i >= 40) { clearInterval(id); p.current = value; }
    }, 16);
    return () => clearInterval(id);
  }, [value]);
  return <>{d.toLocaleString()}</>;
}

type V = "home" | "provider" | "customer" | "done-p" | "done-c";

export default function Page() {
  const [view, setView] = useState<V>("home");
  const [loading, setLoading] = useState(false);
  const [ref, setRef] = useState("");
  const [pSpot, setPSpot] = useState(0);
  const [wl, setWl] = useState<{ position: number; referralCode: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pf, setPf] = useState({ name: "", email: "", city: "", what: "" });
  const [cf, setCf] = useState({ name: "", email: "", city: "" });
  const { spots, setSpots } = useSpots();
  useReveal();

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("ref");
    if (r) setRef(r);
  }, []);

  const submitP = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await fetch("/api/provider", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: pf.name, email: pf.email, city: pf.city, category: pf.what }) });
      const d = await fetch("/api/spots").then(r => r.json());
      setSpots(d.remaining);
      setPSpot(TOTAL - d.remaining);
      setView("done-p");
    } finally { setLoading(false); }
  };

  const submitC = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...cf, referralCode: ref }) });
      const d = await res.json();
      setWl({ position: d.position, referralCode: d.referralCode });
      setView("done-c");
    } finally { setLoading(false); }
  };

  const copy = () => {
    navigator.clipboard.writeText(`https://getrentout.me?ref=${wl?.referralCode}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const Logo = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, overflow: "hidden", flexShrink: 0 }}>
        <Image src="/logo.png" alt="RentOut" width={34} height={34} />
      </div>
      <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px" }}>RentOut</span>
    </div>
  );

  const inp: React.CSSProperties = {
    display: "block", width: "100%", padding: "13px 15px",
    background: "#0a0a0a", border: "1px solid #1c1c1c",
    borderRadius: 11, color: "#fff", fontSize: 15, outline: "none",
  };

  // DONE PROVIDER
  if (view === "done-p") return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}><Logo /></div>
        <div style={{ background: "#0a0a0a", border: "1px solid #1c1c1c", borderRadius: 20, padding: "40px 32px", marginBottom: 12 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, overflow: "hidden", margin: "0 auto 20px" }}>
            <Image src="/logo.png" alt="RentOut" width={64} height={64} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "#444", textTransform: "uppercase", marginBottom: 10 }}>Founding Provider</div>
          <div style={{ fontSize: 72, fontWeight: 900, letterSpacing: "-3px", lineHeight: 1, marginBottom: 6 }}>
            <span className="g">#{pSpot.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: 14, color: "#444", marginBottom: 28 }}>of 100,000 worldwide</div>
          <div style={{ borderTop: "1px solid #1c1c1c", paddingTop: 20, fontSize: 15, color: "#666", lineHeight: 1.7 }}>
            Zero commission on every booking.<br />
            <span style={{ color: "#a855f7" }}>Yours. Forever.</span>
          </div>
        </div>
        <div style={{ background: "#0a0a0a", border: "1px solid #1c1c1c", borderRadius: 14, padding: "16px 20px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className="dot" /><span style={{ fontSize: 14, fontWeight: 600 }}><Ticker value={spots} /> spots left</span>
          </div>
          <div style={{ fontSize: 13, color: "#444" }}>Share before they're gone. Closes at 100,000.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href={`https://wa.me/?text=I claimed founding provider spot %23${pSpot.toLocaleString()} on RentOut. Sell ANY service. Your price. Zero commission for life. Only ${spots.toLocaleString()} of 100,000 left: https://getrentout.me`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#128C7E", borderRadius: 12, padding: 13, fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center" as const }}>
            WhatsApp
          </a>
          <a href={`https://twitter.com/intent/tweet?text=Just claimed founding spot %23${pSpot.toLocaleString()} on RentOut — sell any service%2C your price%2C zero commission. ${spots.toLocaleString()} left: https://getrentout.me`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#0a0a0a", border: "1px solid #1c1c1c", borderRadius: 12, padding: 13, fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center" as const }}>
            Post on X
          </a>
        </div>
      </div>
    </div>
  );

  // DONE CUSTOMER
  if (view === "done-c") return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}><Logo /></div>
        <div style={{ background: "#0a0a0a", border: "1px solid #1c1c1c", borderRadius: 20, padding: "40px 32px", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "#444", textTransform: "uppercase", marginBottom: 10 }}>Your position</div>
          <div style={{ fontSize: 80, fontWeight: 900, letterSpacing: "-3px", lineHeight: 1, marginBottom: 6 }}>
            <span className="g">#{wl?.position}</span>
          </div>
          <div style={{ fontSize: 14, color: "#444" }}>{cf.city}</div>
        </div>
        <div style={{ background: "#0a0a0a", border: "1px solid #1c1c1c", borderRadius: 14, padding: "18px 20px", marginBottom: 12, textAlign: "left" as const }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Move up the list</div>
          <div style={{ fontSize: 13, color: "#555", marginBottom: 14 }}>Every friend who signs up with your link moves you ahead.</div>
          <div style={{ background: "#060606", border: "1px solid #1c1c1c", borderRadius: 8, padding: "9px 13px", fontSize: 12, color: "#555", fontFamily: "monospace", wordBreak: "break-all" as const, marginBottom: 10 }}>
            getrentout.me?ref={wl?.referralCode}
          </div>
          <button onClick={copy} style={{ width: "100%", padding: 13, background: "linear-gradient(135deg,#9333ea,#ec4899)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {copied ? "✓ Copied" : "Copy referral link"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href={`https://wa.me/?text=I joined RentOut — hire anyone for anything. https://getrentout.me?ref=${wl?.referralCode}`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#128C7E", borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center" as const }}>
            WhatsApp
          </a>
          <a href={`https://twitter.com/intent/tweet?text=Just joined RentOut — hire anyone for anything. https://getrentout.me?ref=${wl?.referralCode}`}
            target="_blank" rel="noopener"
            style={{ flex: 1, background: "#0a0a0a", border: "1px solid #1c1c1c", borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center" as const }}>
            Post on X
          </a>
        </div>
      </div>
    </div>
  );

  // FORM
  if (view === "provider" || view === "customer") {
    const isP = view === "provider";
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 420, width: "100%" }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 14, padding: 0, marginBottom: 32 }}>← Back</button>
          <div style={{ marginBottom: 28 }}><Logo /></div>

          {isP && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#140a20", border: "1px solid #2d1654", borderRadius: 100, padding: "6px 14px", marginBottom: 20 }}>
              <span className="dot" style={{ background: "#a855f7" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#a855f7" }}><Ticker value={spots} /> of 100,000 spots left</span>
            </div>
          )}

          {!isP && ref && (
            <div style={{ background: "#0a180a", border: "1px solid #1a3a1a", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#4ade80", marginBottom: 20 }}>
              ✓ Referred — you're ahead of the line.
            </div>
          )}

          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-1px", marginBottom: 6, lineHeight: 1.2 }}>
            {isP ? "Become a founding provider" : "Join the waitlist"}
          </h1>
          <p style={{ fontSize: 15, color: "#555", marginBottom: 28, lineHeight: 1.6 }}>
            {isP ? "Any service. Your price. Zero commission — forever." : "First access when we launch in your city."}
          </p>

          <form onSubmit={isP ? submitP : submitC} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input required placeholder="Full name" style={inp}
              value={isP ? pf.name : cf.name}
              onChange={e => isP ? setPf(p => ({ ...p, name: e.target.value })) : setCf(p => ({ ...p, name: e.target.value }))} />
            <input required type="email" placeholder="Email address" style={inp}
              value={isP ? pf.email : cf.email}
              onChange={e => isP ? setPf(p => ({ ...p, email: e.target.value })) : setCf(p => ({ ...p, email: e.target.value }))} />
            <input required placeholder="Your city" style={inp}
              value={isP ? pf.city : cf.city}
              onChange={e => isP ? setPf(p => ({ ...p, city: e.target.value })) : setCf(p => ({ ...p, city: e.target.value }))} />
            {isP && (
              <input required placeholder="What will you offer? (e.g. Gaming, Tutoring)" style={inp}
                value={pf.what} onChange={e => setPf(p => ({ ...p, what: e.target.value }))} />
            )}
            <div style={{ height: 4 }} />
            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: 15, background: "linear-gradient(135deg,#9333ea,#ec4899)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.6 : 1, transition: "opacity 0.2s, transform 0.15s" }}>
              {loading ? "Just a moment..." : isP ? "Claim founding spot →" : "Reserve my spot →"}
            </button>
            <p style={{ textAlign: "center", fontSize: 12, color: "#333" }}>
              {isP ? "Free. No credit card needed." : "Free. No spam. Ever."}
            </p>
          </form>
        </div>
      </div>
    );
  }

  // HOME
  return (
    <div style={{ background: "#000", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 99, background: "#000000f0", borderBottom: "1px solid #111", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setView("customer")}
            style={{ background: "none", border: "none", color: "#555", fontSize: 14, cursor: "pointer", padding: "8px 12px" }}>
            Find someone
          </button>
          <button onClick={() => setView("provider")}
            style={{ background: "linear-gradient(135deg,#9333ea,#ec4899)", border: "none", borderRadius: 100, color: "#fff", padding: "9px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Start earning
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "100px 24px 80px", textAlign: "center" }}>

        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0a0a0a", border: "1px solid #1c1c1c", borderRadius: 100, padding: "7px 16px", marginBottom: 36 }}>
          <span className="dot" />
          <span style={{ fontSize: 13, color: "#555" }}>
            <span style={{ color: "#fff", fontWeight: 700 }}><Ticker value={spots} /></span> founding spots remaining
          </span>
        </div>

        {/* App icon — hero */}
        <div style={{ marginBottom: 32, animation: "float 5s ease-in-out infinite" }}>
          <div style={{ width: 96, height: 96, borderRadius: 26, overflow: "hidden", margin: "0 auto", boxShadow: "0 0 0 1px #1c1c1c, 0 32px 64px #9333ea33" }}>
            <Image src="/logo.png" alt="RentOut" width={96} height={96} />
          </div>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: "clamp(48px,8.5vw,96px)", fontWeight: 900, lineHeight: 0.96, letterSpacing: "-4px", marginBottom: 24 }}>
          Hire anyone.<br />
          <span className="g">For anything.</span>
        </h1>

        <p style={{ fontSize: "clamp(16px,2vw,20px)", color: "#555", lineHeight: 1.7, maxWidth: 500, margin: "0 auto 44px" }}>
          The first marketplace where anyone monetizes any skill — on their own terms, at their own price.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
          <button onClick={() => setView("provider")}
            style={{ background: "linear-gradient(135deg,#9333ea,#ec4899)", border: "none", borderRadius: 14, color: "#fff", padding: "16px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 32px #9333ea44" }}>
            Start earning — it's free
          </button>
          <button onClick={() => setView("customer")}
            style={{ background: "#0a0a0a", border: "1px solid #1c1c1c", borderRadius: 14, color: "#888", padding: "16px 32px", fontSize: 16, fontWeight: 500, cursor: "pointer" }}>
            Find someone
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", justifyContent: "center", gap: 0, flexWrap: "wrap" }}>
          {[
            { n: 100000, s: "", l: "Founding spots" },
            { n: 160, s: "+", l: "Countries" },
            { n: 0, s: "%", l: "Commission for founders" },
          ].map(({ n, s, l }, i) => (
            <div key={l} style={{ padding: "0 36px", borderLeft: i ? "1px solid #111" : "none", textAlign: "center" }}>
              <div style={{ fontSize: "clamp(26px,3.5vw,38px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.1 }}>
                {n === 0 ? "0%" : <><CountUp to={n} />{s}</>}
              </div>
              <div style={{ fontSize: 13, color: "#444", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{ height: 1, background: "#111", margin: "0 24px" }} />

      {/* BENTO GRID */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "#333", textTransform: "uppercase", marginBottom: 40, textAlign: "center" }}>How it works</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gridTemplateRows: "auto", gap: 12 }}>

          {/* Big card — list */}
          <div className="reveal" style={{ gridColumn: "1 / 8", gridRow: "1", background: "#0a0a0a", border: "1px solid #1c1c1c", borderRadius: 20, padding: "36px 32px", overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, #9333ea18, transparent)" }} />
            <div style={{ fontSize: 32, marginBottom: 16 }}>⚡</div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#9333ea", textTransform: "uppercase", marginBottom: 10 }}>01</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 10 }}>List any service</div>
            <div style={{ fontSize: 15, color: "#555", lineHeight: 1.7 }}>Gaming. Photography. Tutoring. Cooking. Travel. Companionship. Whatever you can offer — list it in minutes.</div>
          </div>

          {/* Tall card — terms */}
          <div className="reveal" style={{ gridColumn: "8 / 13", gridRow: "1 / 3", background: "#0a0a0a", border: "1px solid #1c1c1c", borderRadius: 20, padding: "36px 28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🎯</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#ec4899", textTransform: "uppercase", marginBottom: 10 }}>02</div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 10 }}>Set your terms</div>
              <div style={{ fontSize: 15, color: "#555", lineHeight: 1.7 }}>Your price. Your hours. Your rules. No platform telling you what to charge.</div>
            </div>
            <div style={{ marginTop: 32 }}>
              {["Any price you want", "Any hours you choose", "Any service you offer", "Any city you're in"].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: "1px solid #111" }}>
                  <span style={{ color: "#9333ea", fontSize: 14, fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 14, color: "#666" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card — get paid */}
          <div className="reveal" style={{ gridColumn: "1 / 5", gridRow: "2", background: "linear-gradient(135deg, #1a0a2e, #2a0a3e)", border: "1px solid #2d1654", borderRadius: 20, padding: "28px 24px" }}>
            <div style={{ fontSize: 28, marginBottom: 14 }}>💸</div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#a855f7", textTransform: "uppercase", marginBottom: 8 }}>03</div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.3px", marginBottom: 8 }}>Get paid</div>
            <div style={{ fontSize: 14, color: "#7c3aed", lineHeight: 1.6 }}>Customer books. You show up. Money in your account.</div>
          </div>

          {/* Counter card */}
          <div className="reveal" style={{ gridColumn: "5 / 8", gridRow: "2", background: "#0a0a0a", border: "1px solid #1c1c1c", borderRadius: 20, padding: "28px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#333", textTransform: "uppercase" }}>Spots remaining</div>
            <div>
              <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1 }} className="g">
                <Ticker value={spots} />
              </div>
              <div style={{ fontSize: 13, color: "#333", marginTop: 4 }}>of 100,000</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="dot" />
              <span style={{ fontSize: 12, color: "#444" }}>Updating live</span>
            </div>
          </div>

        </div>
      </div>

      {/* DIVIDER */}
      <div style={{ height: 1, background: "#111", margin: "0 24px" }} />

      {/* TRUST */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "60px 24px" }}>
        <div className="reveal" style={{ display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "center", alignItems: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "#222", textTransform: "uppercase" }}>Trusted infrastructure</div>
          {["Razorpay Secured", "Firebase", "256-bit SSL", "GDPR Compliant", "Payoneer"].map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#333", fontWeight: 500 }}>
              <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 11 }}>✓</span>{t}
            </div>
          ))}
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{ height: 1, background: "#111", margin: "0 24px" }} />

      {/* BOTTOM CTA */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "80px 24px 100px", textAlign: "center" }}>
        <div className="reveal" style={{ background: "#0a0a0a", border: "1px solid #1c1c1c", borderRadius: 24, padding: "64px 40px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, #9333ea18, transparent)", pointerEvents: "none" }} />
          <div style={{ width: 64, height: 64, borderRadius: 18, overflow: "hidden", margin: "0 auto 24px", boxShadow: "0 0 48px #9333ea44, 0 0 0 1px #1c1c1c" }}>
            <Image src="/logo.png" alt="RentOut" width={64} height={64} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "#333", textTransform: "uppercase", marginBottom: 16 }}>Limited time offer</div>
          <h2 style={{ fontSize: "clamp(28px,4.5vw,48px)", fontWeight: 900, letterSpacing: "-2px", lineHeight: 1.05, marginBottom: 12 }}>
            First 100,000 providers.<br /><span className="g">Zero commission. Forever.</span>
          </h2>
          <p style={{ fontSize: 16, color: "#444", marginBottom: 36 }}>
            <span style={{ color: "#fff", fontWeight: 600 }}><Ticker value={spots} /></span> spots remaining. Closes when they're gone.
          </p>
          <button onClick={() => setView("provider")}
            style={{ background: "linear-gradient(135deg,#9333ea,#ec4899)", border: "none", borderRadius: 14, color: "#fff", padding: "16px 44px", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 32px #9333ea44" }}>
            Claim my founding spot
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid #111", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Logo />
        <div style={{ display: "flex", gap: 24 }}>
          <a href="/privacy" style={{ fontSize: 13, color: "#333", textDecoration: "none" }}>Privacy</a>
          <a href="/terms" style={{ fontSize: 13, color: "#333", textDecoration: "none" }}>Terms</a>
        </div>
        <span style={{ fontSize: 13, color: "#222" }}>© 2025 RentOut</span>
      </div>
    </div>
  );
}
