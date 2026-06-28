"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const TOTAL = 100000;
const CLOSE_DATE = new Date("2025-07-19T23:59:59");

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
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
    return () => io.disconnect();
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
  { who: "Alex", what: "FIFA gaming partner", price: "$15/hr", tag: "Gaming", c: "#a855f7" },
  { who: "Maya", what: "Portrait photographer", price: "$45/hr", tag: "Photography", c: "#ec4899" },
  { who: "Sam", what: "Spanish conversation", price: "$20/hr", tag: "Language", c: "#38bdf8" },
  { who: "Priya", what: "Watch-party companion", price: "$25/hr", tag: "Social", c: "#a855f7" },
  { who: "Leo", what: "City photo walk", price: "$30/hr", tag: "Travel", c: "#fb923c" },
  { who: "Nina", what: "Home-cooked dinner", price: "$40/session", tag: "Food", c: "#ec4899" },
];

type V = "home" | "provider" | "customer" | "done-p" | "done-c";

const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
      <Image src="/logo.png" alt="RentOut" width={32} height={32} />
    </div>
    <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px", color: "var(--text)" }}>RentOut</span>
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
  const cd = useCountdown();
  useReveal();

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("ref");
    if (r) setRefCode(r);
  }, []);

  const taken = TOTAL - spots;

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

  /* DONE — PROVIDER */
  if (view === "done-p") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}><Logo /></div>
        <div className="card" style={{ padding: "40px 28px", marginBottom: 10, borderRadius: 20 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, overflow: "hidden", margin: "0 auto 20px", boxShadow: "0 0 36px rgba(168,85,247,0.4)" }}>
            <Image src="/logo.png" alt="RentOut" width={60} height={60} />
          </div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 10 }}>Founding Provider</p>
          <div style={{ fontSize: 66, fontWeight: 900, letterSpacing: "-3px", lineHeight: 1.05, marginBottom: 6 }}><span className="g">#{pSpot.toLocaleString()}</span></div>
          <p style={{ fontSize: 14, color: "var(--text-faint)", marginBottom: 24 }}>of the first 100,000 worldwide</p>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, fontSize: 15, color: "var(--text-dim)", lineHeight: 1.7 }}>
            Zero commission on every booking.<br /><span style={{ color: "var(--accent)", fontWeight: 600 }}>Locked in forever.</span>
          </div>
        </div>
        <div className="card" style={{ padding: "16px 18px", marginBottom: 10, borderRadius: 14, textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span className="dot" /><span style={{ fontSize: 14, fontWeight: 600 }}><Ticker value={taken} /> founding providers so far</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-faint)" }}>Invite others before the founding offer closes.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href={`https://wa.me/?text=I just became founding provider %23${pSpot.toLocaleString()} on RentOut — sell ANY service, set YOUR price, zero commission for life. Join before the founding offer closes: https://getrentout.me`} target="_blank" rel="noopener"
            style={{ flex: 1, background: "#128C7E", borderRadius: 12, padding: "13px 8px", fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center" }}>WhatsApp</a>
          <a href={`https://twitter.com/intent/tweet?text=Just became founding provider %23${pSpot.toLocaleString()} on RentOut — any service, your price, zero commission for life: https://getrentout.me`} target="_blank" rel="noopener"
            style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "13px 8px", fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center" }}>Post on X</a>
        </div>
      </div>
    </div>
  );

  /* DONE — CUSTOMER */
  if (view === "done-c") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}><Logo /></div>
        <div className="card" style={{ padding: "40px 28px", marginBottom: 10, borderRadius: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 10 }}>You&apos;re on the list</p>
          <div style={{ fontSize: 74, fontWeight: 900, letterSpacing: "-3px", lineHeight: 1.05, marginBottom: 6 }}><span className="g">#{wl?.position}</span></div>
          <p style={{ fontSize: 14, color: "var(--text-faint)" }}>{cf.city}</p>
        </div>
        <div className="card" style={{ padding: "18px 20px", marginBottom: 10, borderRadius: 14, textAlign: "left" }}>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Move up the list</p>
          <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 14 }}>Every friend who joins with your link moves you ahead.</p>
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 12, color: "var(--text-dim)", fontFamily: "monospace", wordBreak: "break-all", marginBottom: 10 }}>getrentout.me?ref={wl?.referralCode}</div>
          <button onClick={copy} className="btn-primary" style={{ width: "100%", padding: 13 }}>{copied ? "✓ Copied to clipboard" : "Copy referral link"}</button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href={`https://wa.me/?text=I joined RentOut — hire anyone for anything. Get your spot: https://getrentout.me?ref=${wl?.referralCode}`} target="_blank" rel="noopener"
            style={{ flex: 1, background: "#128C7E", borderRadius: 12, padding: "12px 8px", fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center" }}>WhatsApp</a>
          <a href={`https://twitter.com/intent/tweet?text=Just joined RentOut — hire anyone for anything. https://getrentout.me?ref=${wl?.referralCode}`} target="_blank" rel="noopener"
            style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 8px", fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center" }}>Post on X</a>
        </div>
      </div>
    </div>
  );

  /* FORM */
  if (view === "provider" || view === "customer") {
    const isP = view === "provider";
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
        <div style={{ maxWidth: 420, width: "100%" }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", fontSize: 14, padding: 0, marginBottom: 32, display: "flex", alignItems: "center", gap: 6 }}>← Back</button>
          <div style={{ marginBottom: 28 }}><Logo /></div>
          {isP && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: 100, padding: "6px 14px", marginBottom: 20 }}>
              <span className="dot" style={{ background: "var(--accent)" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>Founding offer closes in {cd.d}d {cd.h}h</span>
            </div>
          )}
          {!isP && refCode && (
            <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#4ade80", marginBottom: 20 }}>✓ Referred — you&apos;re ahead of the line.</div>
          )}
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.8px", marginBottom: 6, lineHeight: 1.25 }}>{isP ? "Become a founding provider" : "Join the waitlist"}</h1>
          <p style={{ fontSize: 15, color: "var(--text-dim)", marginBottom: 28, lineHeight: 1.6 }}>{isP ? "Any service. Your price. Zero commission — forever." : "First access when we launch in your city."}</p>
          <form onSubmit={isP ? submitP : submitC} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input required placeholder="Full name" className="field" value={isP ? pf.name : cf.name} onChange={e => isP ? setPf(p => ({ ...p, name: e.target.value })) : setCf(p => ({ ...p, name: e.target.value }))} />
            <input required type="email" placeholder="Email address" className="field" value={isP ? pf.email : cf.email} onChange={e => isP ? setPf(p => ({ ...p, email: e.target.value })) : setCf(p => ({ ...p, email: e.target.value }))} />
            <input required placeholder="Your city" className="field" value={isP ? pf.city : cf.city} onChange={e => isP ? setPf(p => ({ ...p, city: e.target.value })) : setCf(p => ({ ...p, city: e.target.value }))} />
            {isP && <input required placeholder="What will you offer? (e.g. Gaming, Photography)" className="field" value={pf.what} onChange={e => setPf(p => ({ ...p, what: e.target.value }))} />}
            <div style={{ height: 6 }} />
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", fontSize: 15, padding: 15 }}>{loading ? "Just a moment..." : isP ? "Claim founding spot" : "Reserve my spot"}</button>
            <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-faint)", marginTop: 2 }}>{isP ? "Free. No credit card needed." : "Free. No spam. Unsubscribe anytime."}</p>
          </form>
        </div>
      </div>
    );
  }

  /* HOME */
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 99, background: "rgba(8,8,11,0.82)", borderBottom: "1px solid var(--border)", padding: "0 20px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(12px)" }}>
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="nav-ghost" onClick={() => setView("customer")} style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 14, cursor: "pointer", padding: "8px 14px" }}>Find someone</button>
          <button className="btn-primary" onClick={() => setView("provider")} style={{ padding: "9px 18px", fontSize: 14, borderRadius: 100 }}>Start earning</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse at center, rgba(168,85,247,0.14), transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 760, margin: "0 auto", padding: "72px 20px 64px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 100, padding: "7px 16px", marginBottom: 30 }}>
            <span className="dot" />
            <span style={{ fontSize: 13, color: "var(--text-dim)" }}>Founding offer closes in <span style={{ color: "var(--text)", fontWeight: 600 }}>{cd.d}d {cd.h}h</span></span>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ width: 84, height: 84, borderRadius: 22, overflow: "hidden", margin: "0 auto", animation: "float 5s ease-in-out infinite", boxShadow: "0 0 0 1px var(--border), 0 24px 60px rgba(168,85,247,0.3)" }}>
              <Image src="/logo.png" alt="RentOut" width={84} height={84} priority />
            </div>
          </div>

          <h1 style={{ fontSize: "clamp(44px, 8.5vw, 84px)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.04em", marginBottom: 20 }}>
            Hire anyone.<br /><span className="g">For anything.</span>
          </h1>
          <p style={{ fontSize: "clamp(16px, 2vw, 18px)", color: "var(--text-body)", lineHeight: 1.7, maxWidth: 470, margin: "0 auto 36px" }}>
            The first marketplace where anyone can offer any service — on their own terms, at their own price.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", marginBottom: 24 }}>
            <button className="btn-primary" onClick={() => setView("provider")} style={{ width: "100%", maxWidth: 320, fontSize: 16, padding: "15px 32px" }}>Start earning — it&apos;s free</button>
            <button className="btn-secondary" onClick={() => setView("customer")} style={{ width: "100%", maxWidth: 320, fontSize: 15, padding: "14px 32px" }}>I want to hire someone</button>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-faint)" }}>Zero commission for the first 100,000 providers. Forever.</p>
        </div>
      </div>

      {/* MARKETPLACE PREVIEW — shows the product */}
      <div style={{ overflow: "hidden", padding: "12px 0 8px", maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" }}>
        <div style={{ display: "flex", gap: 12, width: "max-content", animation: "marquee 38s linear infinite" }}>
          {[...SERVICES, ...SERVICES].map((s, i) => (
            <div key={i} className="card" style={{ width: 248, padding: "16px 18px", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: `${s.c}1f`, border: `1px solid ${s.c}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: s.c, flexShrink: 0 }}>{s.who[0]}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{s.who}</div>
                  <div style={{ fontSize: 12, color: "var(--text-faint)" }}>{s.tag}</div>
                </div>
              </div>
              <div style={{ fontSize: 14, color: "var(--text-body)", marginBottom: 12 }}>{s.what}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{s.price}</span>
                <span style={{ fontSize: 12, color: s.c, fontWeight: 600 }}>Book →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px 8px" }}>
        <div className="stats reveal">
          {[{ l: "Founding spots", v: 100000, s: "" }, { l: "Countries at launch", v: 160, s: "+" }, { l: "Commission for founders", v: -1, s: "" }].map(({ l, v, s }) => (
            <div className="stat" key={l}>
              <div style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.1 }}>{v === -1 ? <span className="g">0%</span> : <><CountUp to={v} />{s}</>}</div>
              <div style={{ fontSize: 13, color: "var(--text-faint)", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "56px 20px 0" }} />

      {/* HOW IT WORKS */}
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "72px 20px" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 44 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>How it works</p>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-1.2px" }}>Earn in three steps</h2>
        </div>
        <div className="bento">
          <div className="card bento-wide reveal d1" style={{ padding: "30px 28px" }}>
            <div style={{ display: "inline-flex", padding: "5px 11px", borderRadius: 8, background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.22)", fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 16 }}>STEP 01</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.4px", marginBottom: 8 }}>List any service</h3>
            <p style={{ fontSize: 15, color: "var(--text-body)", lineHeight: 1.7 }}>Gaming, photography, tutoring, cooking, companionship — whatever you&apos;re good at. No fixed categories, no restrictions. Live in minutes.</p>
          </div>
          <div className="card bento-tall reveal d2" style={{ padding: "30px 28px" }}>
            <div style={{ display: "inline-flex", padding: "5px 11px", borderRadius: 8, background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.22)", fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 16 }}>STEP 02</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.4px", marginBottom: 8 }}>Set your terms</h3>
            <p style={{ fontSize: 15, color: "var(--text-body)", lineHeight: 1.7, marginBottom: 22 }}>Your price. Your hours. Your rules. No platform deciding for you.</p>
            <div>
              {["Any price you set", "Any hours you choose", "Anywhere you are", "Your rules, always"].map((t, i) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 0", borderTop: i ? "1px solid var(--border)" : "none" }}>
                  <span style={{ color: "var(--accent)", fontSize: 13, fontWeight: 800 }}>✓</span>
                  <span style={{ fontSize: 14, color: "var(--text-dim)" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card reveal d1" style={{ padding: "28px 24px" }}>
            <div style={{ display: "inline-flex", padding: "5px 11px", borderRadius: 8, background: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.22)", fontSize: 12, fontWeight: 700, color: "var(--accent-2)", marginBottom: 16 }}>STEP 03</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.4px", marginBottom: 8 }}>Get paid</h3>
            <p style={{ fontSize: 15, color: "var(--text-body)", lineHeight: 1.7 }}>Customer books. You show up. Money in your account.</p>
          </div>
          <div className="card reveal d2" style={{ padding: "28px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 16 }}>Founders so far</p>
            <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1, marginBottom: 6 }} className="g"><Ticker value={taken} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
              <span className="dot" /><span style={{ fontSize: 12, color: "var(--text-faint)" }}>Updating live</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "0 20px" }} />

      {/* TRUST */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "44px 20px" }}>
        <p className="reveal" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "var(--text-faint)", textTransform: "uppercase", textAlign: "center", marginBottom: 22 }}>Built on trusted infrastructure</p>
        <div className="reveal d1" style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          {["Razorpay", "Payoneer", "Firebase", "256-bit SSL", "GDPR compliant"].map(t => (
            <span key={t} className="chip" style={{ color: "var(--text-dim)", fontSize: 13 }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "0 20px" }} />

      {/* BOTTOM CTA */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "72px 20px 92px" }}>
        <div className="card reveal" style={{ borderRadius: 22, padding: "clamp(40px, 6vw, 64px) clamp(24px, 5vw, 52px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.16), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, overflow: "hidden", margin: "0 auto 22px", boxShadow: "0 0 40px rgba(168,85,247,0.4)" }}>
              <Image src="/logo.png" alt="RentOut" width={60} height={60} />
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 16, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "var(--accent)", textTransform: "uppercase" }}>
              <span className="dot" style={{ background: "var(--accent)" }} /> Offer closes in {cd.d}d {cd.h}h
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4.5vw, 46px)", fontWeight: 900, letterSpacing: "-1.5px", lineHeight: 1.08, marginBottom: 14 }}>
              Be a founding provider.<br /><span className="g">Zero commission. Forever.</span>
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-dim)", marginBottom: 32, lineHeight: 1.6, maxWidth: 420, margin: "0 auto 32px" }}>
              The first 100,000 providers keep 100% of every booking — for life. After launch, this never comes back.
            </p>
            <button className="btn-primary" onClick={() => setView("provider")} style={{ fontSize: 16, padding: "15px 40px" }}>Claim my founding spot</button>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Logo />
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms"].map(t => <a key={t} href={`/${t.toLowerCase()}`} style={{ fontSize: 13, color: "var(--text-faint)", textDecoration: "none" }}>{t}</a>)}
        </div>
        <span style={{ fontSize: 13, color: "var(--text-faint)" }}>© 2025 RentOut</span>
      </div>
    </div>
  );
}
