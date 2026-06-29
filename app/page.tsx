"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const Icons = {
  whatsapp: <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>,
  facebook: <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  twitter: <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  telegram: <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
  reddit: <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>,
  linkedin: <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  email: <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
  pinterest: <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>,
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
  const [fields, setFields] = useState({ name: "", email: "", city: "" });
  const [errors, setErrors] = useState({ name: "", email: "", city: "" });
  const spots = useSpots();
  const cd = useCountdown();
  const taken = TOTAL - spots;
  useReveal();
  useCursorGlow();

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
        body: JSON.stringify(fields),
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
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <div id="cursor-glow" className="cursor-glow" />
      <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 1000, height: 800, background: "radial-gradient(ellipse, rgba(155,109,255,0.12), transparent 55%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: 700, height: 600, background: "radial-gradient(ellipse, rgba(242,139,130,0.06), transparent 55%)", pointerEvents: "none" }} />

      {/* Top nav */}
      <div style={{ padding: "24px 32px", display: "flex", justifyContent: "center", position: "relative" }}>
        <Logo />
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
        <p style={{ fontSize: 16, color: "var(--text-faint)", maxWidth: 360, textAlign: "center", lineHeight: 1.6 }}>
          We&apos;ll email you when it&apos;s time.<br />Watch your inbox.
        </p>
      </div>

      {/* Bottom share section — pinned to bottom like Robinhood */}
      <div style={{ padding: "40px 24px 48px", maxWidth: 560, width: "100%", margin: "0 auto", position: "relative" }}>
        <div style={{ height: 1, background: "var(--border)", marginBottom: 32 }} />
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>
          Spread the word
        </p>
        {/* Share grid — real brand logos */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 10 }}>
          {[
            { label: "WhatsApp", bg: "#128C7E", href: "https://wa.me/?text=Just got early access to RentOut — something big is coming. Get yours: https://getrentout.me", icon: Icons.whatsapp },
            { label: "Facebook", bg: "#1877F2", href: "https://www.facebook.com/sharer/sharer.php?u=https://getrentout.me", icon: Icons.facebook },
            { label: "X", bg: "#0f0f0f", border: "1px solid #2a2a2a", href: "https://twitter.com/intent/tweet?text=Just got early access to RentOut — something big is coming: https://getrentout.me", icon: Icons.twitter },
            { label: "Telegram", bg: "#229ED9", href: "https://t.me/share/url?url=https://getrentout.me&text=Just got early access to RentOut — something big is coming", icon: Icons.telegram },
            { label: "Reddit", bg: "#FF4500", href: "https://www.reddit.com/submit?url=https://getrentout.me&title=Just got early access to RentOut — something big is coming", icon: Icons.reddit },
            { label: "LinkedIn", bg: "#0A66C2", href: "https://www.linkedin.com/sharing/share-offsite/?url=https://getrentout.me", icon: Icons.linkedin },
            { label: "Email", bg: "#1a1a2e", border: "1px solid #2a2a40", href: "mailto:?subject=Something big is coming&body=Just got early access to RentOut — something big is coming. Get yours: https://getrentout.me", icon: Icons.email },
            { label: "Pinterest", bg: "#E60023", href: "https://pinterest.com/pin/create/button/?url=https://getrentout.me&description=Something+big+is+coming", icon: Icons.pinterest },
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
        <button onClick={() => { navigator.clipboard.writeText("https://getrentout.me"); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: copied ? "rgba(155,109,255,0.1)" : "var(--surface)", border: `1px solid ${copied ? "rgba(155,109,255,0.3)" : "var(--border)"}`, borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 700, color: copied ? "var(--accent)" : "var(--text-dim)", cursor: "pointer", width: "100%", transition: "all .2s" }}>
          {Icons.copy} {copied ? "Link copied!" : "Copy link — getrentout.me"}
        </button>

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
              Something new<br />is coming.<br /><span className="g">Start earning early.</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-body)", lineHeight: 1.75, marginBottom: 40 }}>
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
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(155,109,255,0.12)", border: "1px solid rgba(155,109,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--accent)", fontWeight: 800, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Right — form */}
        <div className="form-panel">
          <div style={{ maxWidth: 400, width: "100%" }} className="page-in">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(155,109,255,0.08)", border: "1px solid rgba(155,109,255,0.18)", borderRadius: 100, padding: "6px 14px", marginBottom: 28 }}>
              <span className="dot" style={{ background: "var(--accent)" }} />
              <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>For early earners</span>
            </div>

            <h3 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>
              Start earning early
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 28, lineHeight: 1.6 }}>
              60 seconds. We&apos;ll email you when we&apos;re ready.
            </p>

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: errors.name ? "var(--text-danger, #F28B82)" : "var(--text-dim)", letterSpacing: "0.04em", display: "block", marginBottom: 7 }}>Full name</label>
                <input
                  name="fullname" type="text" placeholder="Your name" className="field"
                  value={fields.name}
                  style={{ borderColor: errors.name ? "#F28B82" : undefined }}
                  onChange={e => { setFields(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: "" })); }}
                />
                {errors.name && <p style={{ fontSize: 12, color: "#F28B82", marginTop: 6 }}>{errors.name}</p>}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: errors.email ? "#F28B82" : "var(--text-dim)", letterSpacing: "0.04em", display: "block", marginBottom: 7 }}>Email address</label>
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
                <label style={{ fontSize: 12, fontWeight: 600, color: errors.city ? "#F28B82" : "var(--text-dim)", letterSpacing: "0.04em", display: "block", marginBottom: 7 }}>Your city</label>
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
        <button className="btn-primary" onClick={() => setView("form")} style={{ padding: "9px 20px", fontSize: 14, borderRadius: 100 }}>
          Start earning early
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
              <span style={{ color: "var(--text)", fontWeight: 600 }}>Earner early access</span>
            </span>
          </div>

          <h1 className="hero-h1" style={{ fontSize: "clamp(58px, 13vw, 140px)", fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.055em", marginBottom: 36 }}>
            Sell anything.<br /><span className="g">Keep everything.</span>
          </h1>

          <p className="hero-sub" style={{ fontSize: "clamp(17px, 2vw, 21px)", color: "var(--text-body)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 56px" }}>
            Something new is coming. Sign up to earn — before anyone else.
          </p>

          <div className="hero-cta" style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
            <button className="btn-primary" onClick={() => setView("form")} style={{ fontSize: 17, padding: "20px 48px", borderRadius: 14 }}>
              Start earning early
            </button>
          </div>

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
              <span className="dot" style={{ background: "var(--accent)", width: 6, height: 6 }} /> Earner early access
            </div>
            <h2 style={{ fontSize: "clamp(32px, 5.5vw, 60px)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.02, marginBottom: 18 }}>
              Don&apos;t wait.<br /><span className="g">Start earning early.</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 460, margin: "0 auto 40px" }}>
              We&apos;re building something new. Sign up now and be among the first to experience it.
            </p>
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
// force redeploy Mon Jun 29 13:24:50 IST 2026
