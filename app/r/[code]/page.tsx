"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

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
    { label: "WhatsApp", bg: "#25D366", href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, icon: "https://cdn.simpleicons.org/whatsapp/ffffff" },
    { label: "Facebook", bg: "#1877F2", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, icon: "https://cdn.simpleicons.org/facebook/ffffff" },
    { label: "X", bg: "#000", border: "1px solid #2a2a2a", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, icon: "https://cdn.simpleicons.org/x/ffffff" },
    { label: "Telegram", bg: "#229ED9", href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, icon: "https://cdn.simpleicons.org/telegram/ffffff" },
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
            <div style={{ fontSize: "clamp(100px, 25vw, 220px)", fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 0.85, textAlign: "center", marginBottom: 32, background: "linear-gradient(135deg,#9B6DFF,#F28B82)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              #{status.position.toLocaleString()}
            </div>

            <p style={{ textAlign: "center", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
              {status.name.split(" ")[0]}, you&apos;re in line.
            </p>
            <p style={{ textAlign: "center", fontSize: 14, color: "#8888aa", marginBottom: 40, lineHeight: 1.6 }}>
              We&apos;ll email you when it&apos;s time to start earning.
            </p>

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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={icon} alt={label} width={26} height={26} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>{label}</span>
                </a>
              ))}
            </div>

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
