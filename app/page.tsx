"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const BrandLogo = ({ src, alt }: { src: string; alt: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src} alt={alt} width={28} height={28} style={{ display: "block" }} />
);

const Icons = {
  whatsapp: <BrandLogo src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="WhatsApp" />,
  facebook: <BrandLogo src="https://cdn.simpleicons.org/facebook/ffffff" alt="Facebook" />,
  instagram: <BrandLogo src="https://cdn.simpleicons.org/instagram/ffffff" alt="Instagram" />,
  twitter: <BrandLogo src="https://cdn.simpleicons.org/x/ffffff" alt="X" />,
  telegram: <BrandLogo src="https://cdn.simpleicons.org/telegram/ffffff" alt="Telegram" />,
  reddit: <BrandLogo src="https://cdn.simpleicons.org/reddit/ffffff" alt="Reddit" />,
  linkedin: <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  tiktok: <BrandLogo src="https://cdn.simpleicons.org/tiktok/ffffff" alt="TikTok" />,
  email: <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
  copy: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>,
};

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

function useParallax() {
  useEffect(() => {
    const blobs = document.querySelector(".aurora-parallax") as HTMLElement | null;
    if (!blobs) return;
    const move = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      blobs.style.transform = `translate(${x}px, ${y}px)`;
    };
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
  const [copied, setCopied] = useState(false);
  const [myRefCode, setMyRefCode] = useState<string | null>(null);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [fields, setFields] = useState({ name: "", email: "", city: "" });
  const [errors, setErrors] = useState({ name: "", email: "", city: "" });
  const [showRankModal, setShowRankModal] = useState(false);
  const [rankEmail, setRankEmail] = useState("");
  const [rankLoading, setRankLoading] = useState(false);
  const [rankError, setRankError] = useState("");
  const spots = useSpots();
  const cd = useCountdown();
  const taken = TOTAL - spots;
  useReveal();
  useCursorGlow();
  useParallax();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRefCode(params.get("ref"));
  }, []);

  const lookupRank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rankEmail.trim()) return;
    setRankLoading(true);
    setRankError("");
    try {
      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: rankEmail.trim() }),
      });
      const data = await res.json();
      if (data.error) { setRankError("We couldn't find that email. Did you sign up?"); return; }
      window.open(`/r/${data.referralCode}`, "_blank");
      setShowRankModal(false);
      setRankEmail("");
    } finally {
      setRankLoading(false);
    }
  };

  const validate = () => {
    const e = { name: "", email: "", city: "" };
    if (!fields.name.trim()) e.name = "Please enter your name";
    else if (fields.name.trim().length < 2) e.name = "Name is too short";
    if (!fields.email.trim()) e.email = "Please enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) e.email = "That doesn't look like a valid email";
    if (!fields.city.trim()) e.city = "Please enter your city";
    setErrors(e);
    return !e.name && !e.email && !e.city;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, referredBy: refCode }),
      });
      const data = await res.json();
      setPosition(data.position ?? taken + 1);
      setMyRefCode(data.referralCode ?? null);
      setView("done");
    } finally {
      setLoading(false);
    }
  };

  /* ── DONE ── */
  if (view === "done") return (
    <div className="view-transition" style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <div id="cursor-glow" className="cursor-glow" />
      <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 1000, height: 800, background: "radial-gradient(ellipse, rgba(155,109,255,0.12), transparent 55%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: 700, height: 600, background: "radial-gradient(ellipse, rgba(242,139,130,0.06), transparent 55%)", pointerEvents: "none" }} />

      {/* Top nav */}
      <div style={{ padding: "24px 32px", display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
        <Logo />
        <a href="/leaderboard" target="_blank" rel="noopener" style={{ position: "absolute", right: 32, fontSize: 13, fontWeight: 700, color: "#8888aa", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 100, padding: "7px 14px", transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#b090ff"; e.currentTarget.style.borderColor = "rgba(155,109,255,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#8888aa"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}>
          🏆 Leaderboard
        </a>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 0", position: "relative" }} className="page-in">

        {/* Robinhood-style: number IS the hero */}
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 20 }}>
          Early access confirmed
        </p>

        <div style={{ fontSize: "clamp(120px, 28vw, 280px)", fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 0.82, marginBottom: 40, textAlign: "center" }}>
          <span className="g">#{position.toLocaleString()}</span>
        </div>

        <p style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 600, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.02em" }}>
          You&apos;re one of the first.
        </p>
        <p style={{ fontSize: 16, color: "#8888aa", maxWidth: 360, textAlign: "center", lineHeight: 1.6 }}>
          We&apos;ll email you when it&apos;s time.<br />Watch your inbox.
        </p>

        {myRefCode && (
          <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <a href={`/r/${myRefCode}`} target="_blank" rel="noopener"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#9B6DFF", textDecoration: "none", background: "rgba(155,109,255,0.08)", border: "1px solid rgba(155,109,255,0.2)", borderRadius: 100, padding: "8px 18px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#9B6DFF", display: "inline-block" }} />
              Check your position anytime →
            </a>
            <a href={`/leaderboard?me=${myRefCode}`} target="_blank" rel="noopener"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#c0a080", textDecoration: "none", background: "rgba(242,139,130,0.07)", border: "1px solid rgba(242,139,130,0.2)", borderRadius: 100, padding: "8px 18px" }}>
              🏆 See your rank
            </a>
          </div>
        )}
      </div>

      {/* Bottom share section — pinned to bottom like Robinhood */}
      <div style={{ padding: "40px 24px 48px", maxWidth: 560, width: "100%", margin: "0 auto", position: "relative" }}>
        <div style={{ height: 1, background: "var(--border)", marginBottom: 32 }} />

        {/* Referral callout */}
        {myRefCode && (
          <div style={{ background: "rgba(155,109,255,0.08)", border: "1px solid rgba(155,109,255,0.22)", borderRadius: 16, padding: "18px 20px", marginBottom: 28, textAlign: "center" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#b090ff", marginBottom: 4, letterSpacing: "0.04em" }}>
              YOUR REFERRAL LINK
            </p>
            <p style={{ fontSize: 13, color: "#8888aa", marginBottom: 2 }}>
              Each friend who signs up moves you <span style={{ color: "var(--text)", fontWeight: 700 }}>5 spots higher</span>.
            </p>
            <p style={{ fontSize: 12, color: "#666688", fontFamily: "monospace", marginTop: 8 }}>
              getrentout.me?ref={myRefCode}
            </p>
          </div>
        )}

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>
          Spread the word
        </p>
        {/* Share grid — real brand logos */}
        {(() => {
          const shareUrl = myRefCode ? `https://getrentout.me?ref=${myRefCode}` : "https://getrentout.me";
          const shareText = "Just got early access to RentOut — something big is coming. Get yours:";
          return (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 10 }}>
                {[
                  { label: "WhatsApp", bg: "#25D366", href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, icon: Icons.whatsapp },
                  { label: "Instagram", bg: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", href: "https://www.instagram.com/", icon: Icons.instagram },
                  { label: "Facebook", bg: "#1877F2", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, icon: Icons.facebook },
                  { label: "X", bg: "#000", border: "1px solid #2a2a2a", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, icon: Icons.twitter },
                  { label: "Telegram", bg: "#229ED9", href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, icon: Icons.telegram },
                  { label: "TikTok", bg: "#010101", border: "1px solid #333", href: "https://www.tiktok.com/", icon: Icons.tiktok },
                  { label: "Reddit", bg: "#FF4500", href: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`, icon: Icons.reddit },
                  { label: "LinkedIn", bg: "#0A66C2", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, icon: Icons.linkedin },
                ].map(({ label, bg, border, href, icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener"
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: bg, border: border || "none", borderRadius: 16, padding: "18px 8px", textDecoration: "none", transition: "opacity .15s" }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                    {icon}
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>{label}</span>
                  </a>
                ))}
              </div>
              <button onClick={() => {
                navigator.clipboard.writeText(myRefCode ? `https://getrentout.me?ref=${myRefCode}` : "https://getrentout.me");
                setCopied(true); setTimeout(() => setCopied(false), 2000);
              }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: copied ? "rgba(155,109,255,0.1)" : "var(--surface)", border: `1px solid ${copied ? "rgba(155,109,255,0.3)" : "var(--border)"}`, borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 700, color: copied ? "var(--accent)" : "var(--text-dim)", cursor: "pointer", width: "100%", transition: "all .2s" }}>
                {Icons.copy} {copied ? "Link copied!" : myRefCode ? `Copy your referral link` : "Copy link — getrentout.me"}
              </button>
            </>
          );
        })()}

      </div>
    </div>
  );

  /* ── FORM ── */
  if (view === "form") return (
    <div className="view-transition" style={{ background: "var(--bg)", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <div id="cursor-glow" className="cursor-glow" />
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 99, background: "rgba(7,7,10,0.85)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(16px)" }}>
        <Logo />
        <button onClick={() => setView("home")} className="nav-link" style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-dim)")}>
          ← Back
        </button>
      </nav>

      <div className="form-layout" style={{ paddingTop: 58, minHeight: "100vh" }}>
        {/* Left — brand */}
        <div className="form-brand" style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -100, left: -100, width: 600, height: 600, background: "radial-gradient(circle, rgba(155,109,255,0.2), transparent 65%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", maxWidth: 420 }}>
            <p className="section-label" style={{ marginBottom: 20 }}>Early access</p>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 20, color: "#f0f0fa" }}>
              Something new<br />is coming.<br /><span className="g">Start earning early.</span>
            </h2>
            <p style={{ fontSize: 16, color: "#b0b0cc", lineHeight: 1.75, marginBottom: 40 }}>
              We&apos;re not ready to reveal everything yet. Sign up and be among the first to know when we launch.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
              {[
                "Early access before anyone else",
                "First in line on launch day",
                "Exclusive earner benefits",
                "Direct line to the team",
              ].map(text => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(155,109,255,0.18)", border: "1px solid rgba(155,109,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#b090ff", fontWeight: 800, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 14, color: "#a8a8c8", lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Right — form */}
        <div className="form-panel">
          <div style={{ maxWidth: 400, width: "100%" }} className="page-in">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(155,109,255,0.12)", border: "1px solid rgba(155,109,255,0.3)", borderRadius: 100, padding: "6px 14px", marginBottom: 28 }}>
              <span className="dot" style={{ background: "var(--accent)" }} />
              <span style={{ fontSize: 13, color: "#b090ff", fontWeight: 600 }}>For early earners</span>
            </div>

            <h3 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8, color: "#f0f0fa" }}>
              Start earning early
            </h3>
            <p style={{ fontSize: 14, color: "#9090b8", marginBottom: 28, lineHeight: 1.6 }}>
              60 seconds. We&apos;ll email you when we&apos;re ready.
            </p>

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: errors.name ? "#F28B82" : "#a8a8c8", letterSpacing: "0.04em", display: "block", marginBottom: 7 }}>Full name</label>
                <input
                  name="fullname" type="text" placeholder="Your name" className="field"
                  value={fields.name}
                  style={{ borderColor: errors.name ? "#F28B82" : undefined }}
                  onChange={e => { setFields(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: "" })); }}
                />
                {errors.name && <p style={{ fontSize: 12, color: "#F28B82", marginTop: 6 }}>{errors.name}</p>}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: errors.email ? "#F28B82" : "#a8a8c8", letterSpacing: "0.04em", display: "block", marginBottom: 7 }}>Email address</label>
                <input
                  type="email" placeholder="you@email.com" className="field"
                  inputMode="email" name="useremail"
                  value={fields.email}
                  style={{ borderColor: errors.email ? "#F28B82" : undefined }}
                  onChange={e => { setFields(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: "" })); }}
                />
                {errors.email && <p style={{ fontSize: 12, color: "#F28B82", marginTop: 6 }}>{errors.email}</p>}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: errors.city ? "#F28B82" : "#a8a8c8", letterSpacing: "0.04em", display: "block", marginBottom: 7 }}>Your city</label>
                <input
                  type="text" placeholder="City" className="field"
                  name="usercity"
                  value={fields.city}
                  style={{ borderColor: errors.city ? "#F28B82" : undefined }}
                  onChange={e => { setFields(p => ({ ...p, city: e.target.value })); setErrors(p => ({ ...p, city: "" })); }}
                />
                {errors.city && <p style={{ fontSize: 12, color: "#F28B82", marginTop: 6 }}>{errors.city}</p>}
              </div>
              <div style={{ height: 4 }} />
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", fontSize: 15, padding: "17px", borderRadius: 13 }}>
                {loading ? "Just a moment…" : "Start earning early"}
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/leaderboard" target="_blank" rel="noopener" className="nav-hide-mobile" style={{ fontSize: 13, fontWeight: 700, color: "#8888aa", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#b090ff"; e.currentTarget.style.borderColor = "rgba(155,109,255,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#8888aa"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}>
            🏆 Leaderboard
          </a>
          <button onClick={() => { setShowRankModal(true); setRankError(""); setRankEmail(""); }} className="nav-hide-mobile"
            style={{ fontSize: 13, fontWeight: 700, color: "#8888aa", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 100, padding: "7px 14px", cursor: "pointer", transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#b090ff"; e.currentTarget.style.borderColor = "rgba(155,109,255,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#8888aa"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}>
            Check my rank
          </button>
          <button className="btn-primary" onClick={() => setView("form")} style={{ padding: "9px 20px", fontSize: 14, borderRadius: 100 }}>
            Start earning early
          </button>
        </div>
      </nav>

      {/* Rank lookup modal */}
      {showRankModal && (
        <div onClick={() => setShowRankModal(false)} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#111118", border: "1px solid rgba(155,109,255,0.25)", borderRadius: 24, padding: "40px 32px", width: "100%", maxWidth: 400, position: "relative" }}>
            <button onClick={() => setShowRankModal(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#666688", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", color: "#9B6DFF", textTransform: "uppercase", marginBottom: 12 }}>Already signed up?</p>
            <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8, color: "#f0f0fa" }}>Check your rank</h3>
            <p style={{ fontSize: 14, color: "#8888aa", marginBottom: 24, lineHeight: 1.6 }}>Enter the email you signed up with to see your current position.</p>
            <form onSubmit={lookupRank} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="email" placeholder="you@email.com" value={rankEmail}
                onChange={e => { setRankEmail(e.target.value); setRankError(""); }}
                className="field" style={{ borderColor: rankError ? "#F28B82" : undefined }}
              />
              {rankError && <p style={{ fontSize: 12, color: "#F28B82", marginTop: -4 }}>{rankError}</p>}
              <button type="submit" disabled={rankLoading} className="btn-primary" style={{ width: "100%", fontSize: 15, padding: "15px", borderRadius: 12 }}>
                {rankLoading ? "Looking up…" : "See my rank →"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HERO */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        {/* Aurora blobs — parallax on mousemove */}
        <div className="aurora-parallax" style={{ position: "absolute", inset: 0, pointerEvents: "none", transition: "transform 0.8s cubic-bezier(.25,.46,.45,.94)" }}>
          <div className="aurora-blob aurora-1" style={{ top: "-30%", left: "30%" }} />
          <div className="aurora-blob aurora-2" style={{ bottom: "-20%", right: "-10%" }} />
          <div className="aurora-blob aurora-3" style={{ top: "20%", left: "-5%" }} />
        </div>

        <div style={{ position: "relative", maxWidth: 960, margin: "0 auto", padding: "72px 24px 64px", textAlign: "center" }}>
          <div className="hero-eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(155,109,255,0.07)", border: "1px solid rgba(155,109,255,0.16)", borderRadius: 100, padding: "7px 18px", marginBottom: 36 }}>
            <span className="dot" />
            <span style={{ fontSize: 13, color: "var(--text-dim)", letterSpacing: "0.01em" }}>
              <span style={{ color: "var(--text)", fontWeight: 600 }}>Earner early access</span>
            </span>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div className="hero-line-1" style={{ fontSize: "clamp(52px, 10vw, 118px)", fontWeight: 900, lineHeight: 0.92, letterSpacing: "-0.055em", color: "#f8f8fa" }}>
              Sell anything.
            </div>
            <div className="hero-line-2" style={{ fontSize: "clamp(52px, 10vw, 118px)", fontWeight: 900, lineHeight: 0.92, letterSpacing: "-0.055em" }}>
              <span className="g">Keep everything.</span>
            </div>
          </div>

          <p className="hero-sub" style={{ fontSize: "clamp(17px, 2vw, 21px)", color: "var(--text-body)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 40px" }}>
            Something new is coming. Sign up to earn — before anyone else.
          </p>

          <div className="hero-cta" style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
            <button className="btn-primary" onClick={() => setView("form")} style={{ fontSize: 17, padding: "20px 48px", borderRadius: 14 }}>
              Start earning early
            </button>
          </div>

          {/* 3D live spots remaining */}
          <div className="hero-note" style={{ textAlign: "center" }}>
            <div className="counter-3d">
              <Ticker value={spots} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 }}>
              <span className="dot" />
              <span style={{ fontSize: 13, color: "var(--text-faint)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>
                spots remaining
              </span>
            </div>
          </div>

        </div>
      </div>

      <hr className="hr" style={{ marginTop: 40 }} />

      {/* BOTTOM CTA */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "100px 24px 120px" }}>
        <div className="card reveal" style={{ borderRadius: 24, padding: "clamp(52px, 8vw, 88px) clamp(28px, 6vw, 72px)", textAlign: "center", position: "relative", overflow: "hidden", border: "1px solid rgba(155,109,255,0.16)", background: "linear-gradient(160deg, rgba(155,109,255,0.06) 0%, var(--surface) 55%)" }}>
          <div style={{ position: "absolute", top: -140, left: "50%", transform: "translateX(-50%)", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(155,109,255,0.13), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -80, right: "0%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,139,130,0.06), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "var(--accent)", textTransform: "uppercase", background: "rgba(155,109,255,0.08)", border: "1px solid rgba(155,109,255,0.18)", borderRadius: 100, padding: "6px 16px" }}>
              <span className="dot" style={{ background: "var(--accent)", width: 6, height: 6 }} /> Earner early access
            </div>
            <h2 style={{ fontSize: "clamp(32px, 5.5vw, 60px)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.02, marginBottom: 18 }}>
              Don&apos;t wait.<br /><span className="g">Start earning early.</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 460, margin: "0 auto 40px" }}>
              We&apos;re building something new. Sign up now and be among the first to experience it.
            </p>
            {/* Countdown */}
            {(cd.d > 0 || cd.h > 0 || cd.m > 0) && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {[{ v: cd.d, l: "days" }, { v: cd.h, l: "hrs" }, { v: cd.m, l: "min" }].map(({ v, l }, i) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(155,109,255,0.09)", border: "1px solid rgba(155,109,255,0.22)", borderRadius: 10, padding: "10px 18px", minWidth: 58 }}>
                        <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", color: "var(--text)" }}>{String(v).padStart(2, "0")}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-dim)", textTransform: "uppercase", marginTop: 3 }}>{l}</span>
                      </div>
                      {i < 2 && <span style={{ fontSize: 22, fontWeight: 900, color: "var(--text-dim)", lineHeight: 1, paddingBottom: 14 }}>:</span>}
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dim)", letterSpacing: "0.04em" }}>left to claim your spot</span>
              </div>
            )}
            <button className="btn-primary" onClick={() => setView("form")} style={{ fontSize: 16, padding: "18px 48px", borderRadius: 14 }}>
              Start earning early
            </button>
          </div>
        </div>
      </div>

      <hr className="hr" />
      <div style={{ padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <Logo />
        <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <a href="mailto:hello@getrentout.me" style={{ fontSize: 13, color: "var(--text-faint)", textDecoration: "none", transition: "color .2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-dim)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-faint)")}>hello@getrentout.me</a>
        </div>
        <span style={{ fontSize: 13, color: "var(--text-faint)" }}>© 2026 RentOut</span>
      </div>
    </div>
  );
}
// force redeploy Mon Jun 29 13:24:50 IST 2026
