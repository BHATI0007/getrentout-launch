"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

function Sparkline({ position }: { position: number }) {
  const pts = Array.from({length:8},(_,i)=>{
    const decay = Math.pow(0.72, 7-i);
    return Math.round(position + (7-i)*14*decay + Math.sin(i*1.3)*2);
  });
  const max=Math.max(...pts), min=Math.min(...pts,position);
  const W=140,H=36;
  const px=(i:number)=>(i/(pts.length-1))*(W-8)+4;
  const py=(v:number)=>H-((v-min)/(max-min||1))*(H-8)-4;
  const d=pts.map((v,i)=>`${i===0?"M":"L"}${px(i)},${py(v)}`).join(" ")+` L${W-4},${py(position)}`;
  return (
    <svg width={W} height={H} style={{overflow:"visible"}}>
      <defs><linearGradient id="sg2" x1="0" x2="1"><stop offset="0%" stopColor="#9B6DFF"/><stop offset="100%" stopColor="#F28B82"/></linearGradient></defs>
      <path d={d} fill="none" stroke="url(#sg2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
      <circle cx={W-4} cy={py(position)} r="3.5" fill="#F28B82" style={{filter:"drop-shadow(0 0 4px #F28B82)"}}/>
    </svg>
  );
}

const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ width: 32, height: 32, borderRadius: 9, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg, #1a1228, #120d1e)", border: "1px solid rgba(155,109,255,0.25)" }}>
      <Image src="/logo.png" alt="RentOut" width={32} height={32} style={{ borderRadius: 8 }} />
    </div>
    <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.03em", color: "#f0f0fa" }}>RentOut</span>
  </div>
);

type Status = { name: string; position: number; referralCount: number; referralCode: string };

export default function StatusPage() {
  const { code } = useParams<{ code: string }>();
  const [status, setStatus] = useState<Status | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!code) return;
    fetch(`/api/status?code=${code}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setNotFound(true);
        else setStatus(d);
      })
      .catch(() => setNotFound(true));
  }, [code]);

  const shareUrl = `https://getrentout.me?ref=${code}`;
  const shareText = "Just got early access to RentOut — something big is coming. Get yours:";

  const shareLinks = [
    {
      label: "WhatsApp", bg: "#25D366",
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      icon: <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.852L.057 23.177a.75.75 0 0 0 .92.92l5.355-1.484A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.523-5.205-1.431l-.372-.218-3.853 1.068 1.036-3.78-.236-.386A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>,
    },
    {
      label: "Facebook", bg: "#1877F2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      icon: <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    },
    {
      label: "X", bg: "#000", border: "1px solid #2a2a2a",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    },
    {
      label: "Telegram", bg: "#229ED9",
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      icon: <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
    },
  ];

  return (
    <div style={{ background: "#07070a", minHeight: "100vh", color: "#f0f0fa", fontFamily: "Inter, sans-serif" }}>
      {/* Glow */}
      <div style={{ position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 800, height: 600, background: "radial-gradient(ellipse, rgba(155,109,255,0.1), transparent 60%)", pointerEvents: "none" }} />

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 99, background: "rgba(7,7,10,0.85)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "0 28px", height: 58, display: "flex", alignItems: "center", backdropFilter: "blur(16px)" }}>
        <a href="https://getrentout.me" style={{ textDecoration: "none" }}><Logo /></a>
      </nav>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "60px 24px 80px", position: "relative" }}>

        {/* Loading */}
        {!status && !notFound && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ width: 40, height: 40, border: "3px solid rgba(155,109,255,0.2)", borderTopColor: "#9B6DFF", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
            <p style={{ color: "#666688", fontSize: 14 }}>Loading your spot…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Not found */}
        {notFound && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🤔</p>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Link not found</h2>
            <p style={{ color: "#8888aa", marginBottom: 32 }}>This referral link doesn&apos;t exist. Check the URL and try again.</p>
            <a href="https://getrentout.me" style={{ display: "inline-block", background: "linear-gradient(135deg,#9B6DFF,#F28B82)", color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 12, textDecoration: "none" }}>
              Sign up instead →
            </a>
          </div>
        )}

        {/* Status */}
        {status && (
          <>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", color: "#9B6DFF", textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>
              Early access position
            </p>

            {/* Big position number */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span className="position-3d" style={{ fontSize: "clamp(100px, 25vw, 220px)", fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 0.85, background: "linear-gradient(135deg,#9B6DFF,#F28B82)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                #{status.position.toLocaleString()}
              </span>
            </div>

            <p style={{ textAlign: "center", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
              {status.name.split(" ")[0]}, you&apos;re in line.
            </p>
            <p style={{ textAlign: "center", fontSize: 14, color: "#8888aa", marginBottom: 16, lineHeight: 1.6 }}>
              We&apos;ll email you when it&apos;s time to start earning.
            </p>
            {/* Sparkline — position trend */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginBottom: 32 }}>
              <Sparkline position={status.position} />
              <p style={{ fontSize: 11, color: "#444466", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Your position over time</p>
            </div>

            {/* Referral stats */}
            <div style={{ background: "rgba(155,109,255,0.07)", border: "1px solid rgba(155,109,255,0.2)", borderRadius: 20, padding: "28px 24px", marginBottom: 28, textAlign: "center" }}>
              <div style={{ fontSize: "clamp(48px,10vw,72px)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 4, background: "linear-gradient(135deg,#9B6DFF,#F28B82)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {status.referralCount}
              </div>
              <p style={{ fontSize: 13, color: "#9090b8", fontWeight: 600, marginBottom: 16 }}>
                {status.referralCount === 1 ? "friend referred" : "friends referred"}
              </p>
              <div style={{ height: 1, background: "rgba(155,109,255,0.15)", marginBottom: 16 }} />
              <p style={{ fontSize: 13, color: "#7070a0" }}>
                Each referral moves you <span style={{ color: "#b090ff", fontWeight: 700 }}>5 spots higher</span>.
                {status.referralCount > 0 && (
                  <span style={{ color: "#9B6DFF" }}> You&apos;ve moved up {status.referralCount * 5} spots so far.</span>
                )}
              </p>
            </div>

            {/* Share section */}
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "#555577", textTransform: "uppercase", marginBottom: 14, textAlign: "center" }}>
              Share your link
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 12 }}>
              {shareLinks.map(({ label, bg, border, href, icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener"
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: bg, border: border || "none", borderRadius: 16, padding: "18px 8px", textDecoration: "none", transition: "opacity .15s" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                  {icon}
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>{label}</span>
                </a>
              ))}
            </div>

            <a href={`/leaderboard?me=${code}`}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 700, color: "#8888aa", textDecoration: "none", width: "100%", marginBottom: 10, transition: "all .2s", boxSizing: "border-box" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(155,109,255,0.25)"; e.currentTarget.style.color = "#b090ff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#8888aa"; }}>
              🏆 View leaderboard
            </a>

            <button onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: copied ? "rgba(155,109,255,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${copied ? "rgba(155,109,255,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: "16px", fontSize: 14, fontWeight: 700, color: copied ? "#9B6DFF" : "#8888aa", cursor: "pointer", width: "100%", transition: "all .2s" }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
              {copied ? "Copied!" : `Copy — getrentout.me?ref=${code}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
