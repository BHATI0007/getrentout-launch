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
    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "#9B6DFF", textTransform: "uppercase", border: "1px solid rgba(155,109,255,0.3)", borderRadius: 6, padding: "2px 7px", marginLeft: 2 }}>Creator</span>
  </div>
);

type Referral = { name: string; city: string; converted: boolean; date: string };
type Stats = { name: string; code: string; status: string; totalReferrals: number; convertedReferrals: number; acceptedTerms: boolean | null; totalEarnedUsd: number; pendingUsd: number; referrals: Referral[] };

const fmtDate = (iso: string) => {
  try { return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" }); }
  catch { return ""; }
};

export default function CreatorDashboard() {
  const { code } = useParams<{ code: string }>();
  const [stats, setStats] = useState<Stats | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const acceptTerms = async () => {
    if (!code || accepting) return;
    setAccepting(true);
    try {
      const r = await fetch("/api/creator-accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: String(code).toUpperCase() }),
      });
      const d = await r.json();
      if (d.success) setStats(s => (s ? { ...s, acceptedTerms: true } : s));
    } finally {
      setAccepting(false);
    }
  };

  useEffect(() => {
    if (!code) return;
    fetch(`/api/creator-stats?code=${code}`)
      .then(r => r.json())
      .then(d => (d.error ? setNotFound(true) : setStats(d)))
      .catch(() => setNotFound(true));
  }, [code]);

  const shareUrl = `https://getrentout.me?ref=${(code || "").toUpperCase()}`;

  return (
    <div style={{ background: "#07070a", minHeight: "100vh", color: "#f0f0fa", fontFamily: "Inter, sans-serif" }}>
      <div style={{ position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 800, height: 600, background: "radial-gradient(ellipse, rgba(155,109,255,0.1), transparent 60%)", pointerEvents: "none" }} />

      <nav style={{ position: "sticky", top: 0, zIndex: 99, background: "rgba(7,7,10,0.85)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "0 28px", height: 58, display: "flex", alignItems: "center", backdropFilter: "blur(16px)" }}>
        <a href="https://getrentout.me" style={{ textDecoration: "none" }}><Logo /></a>
      </nav>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "56px 24px 80px", position: "relative" }}>

        {!stats && !notFound && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ width: 40, height: 40, border: "3px solid rgba(155,109,255,0.2)", borderTopColor: "#9B6DFF", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
            <p style={{ color: "#666688", fontSize: 14 }}>Loading your dashboard…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {notFound && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>We couldn&apos;t find that dashboard</h2>
            <p style={{ color: "#8888aa", marginBottom: 8, lineHeight: 1.7 }}>
              Double-check the link from your invite — codes are case-insensitive, so a typo is the usual culprit.
            </p>
            <p style={{ color: "#8888aa", marginBottom: 32, lineHeight: 1.7 }}>
              Still stuck? Write to <a href="mailto:support@getrentout.me" style={{ color: "#b090ff", fontWeight: 600 }}>support@getrentout.me</a> and we&apos;ll sort it out.
            </p>
            <a href="https://getrentout.me" style={{ display: "inline-block", background: "linear-gradient(135deg,#9B6DFF,#F28B82)", color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 12, textDecoration: "none" }}>
              Back to RentOut →
            </a>
          </div>
        )}

        {stats && (
          <>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", color: "#9B6DFF", textTransform: "uppercase", marginBottom: 10, textAlign: "center" }}>
              Creator dashboard
            </p>
            <p style={{ textAlign: "center", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
              Welcome, {stats.name}
            </p>
            <p style={{ textAlign: "center", fontSize: 13, color: "#8888aa", marginBottom: 6, lineHeight: 1.6 }}>
              You earn <span style={{ color: "#b090ff", fontWeight: 700 }}>5% of every completed, paid booking</span> your referrals make, for 3 months.
            </p>
            <p style={{ textAlign: "center", fontSize: 11.5, color: "#666688", marginBottom: 30 }}>
              Earnings depend on real bookings — no income is guaranteed.
            </p>

            {stats.acceptedTerms === false && (
              <div style={{ background: "rgba(155,109,255,0.08)", border: "1px solid rgba(155,109,255,0.3)", borderRadius: 16, padding: "20px 22px", marginBottom: 28 }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: "#e8e8f5", marginBottom: 6 }}>One step before you start sharing</p>
                <p style={{ fontSize: 13, color: "#9090b8", lineHeight: 1.65, marginBottom: 14 }}>
                  Please read the <a href="/creator-terms" target="_blank" rel="noopener" style={{ color: "#b090ff", fontWeight: 600 }}>Creator Program Terms</a> — they
                  cover how you earn, when you&apos;re paid, and your responsibilities.
                </p>
                <button onClick={acceptTerms} disabled={accepting}
                  style={{ background: "linear-gradient(135deg,#9B6DFF,#F28B82)", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 24px", borderRadius: 11, border: "none", cursor: accepting ? "default" : "pointer", opacity: accepting ? 0.7 : 1 }}>
                  {accepting ? "Saving…" : "I've read them — I agree"}
                </button>
              </div>
            )}
            {stats.acceptedTerms === true && (
              <p style={{ textAlign: "center", fontSize: 12, color: "#5fd39a", marginBottom: 28 }}>
                ✓ Program terms accepted
              </p>
            )}

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 28 }}>
              <div style={{ background: "rgba(95,211,154,0.06)", border: "1px solid rgba(95,211,154,0.22)", borderRadius: 18, padding: "24px 12px", textAlign: "center" }}>
                <div style={{ fontSize: "clamp(26px,5.5vw,40px)", fontWeight: 900, letterSpacing: "-0.03em", color: "#5fd39a" }}>
                  ${(stats.totalEarnedUsd ?? 0).toFixed(2)}
                </div>
                <p style={{ fontSize: 12, color: "#7aa88f", fontWeight: 600 }}>earned so far</p>
              </div>
              <div style={{ background: "rgba(155,109,255,0.07)", border: "1px solid rgba(155,109,255,0.2)", borderRadius: 18, padding: "24px 16px", textAlign: "center" }}>
                <div style={{ fontSize: "clamp(26px,5.5vw,40px)", fontWeight: 900, letterSpacing: "-0.04em", background: "linear-gradient(135deg,#9B6DFF,#F28B82)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {stats.totalReferrals.toLocaleString()}
                </div>
                <p style={{ fontSize: 12, color: "#9090b8", fontWeight: 600 }}>people signed up</p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "24px 16px", textAlign: "center" }}>
                <div style={{ fontSize: "clamp(26px,5.5vw,40px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#f0f0fa" }}>
                  {stats.convertedReferrals.toLocaleString()}
                </div>
                <p style={{ fontSize: 12, color: "#7070a0", fontWeight: 600 }}>started booking</p>
              </div>
            </div>
            <p style={{ textAlign: "center", fontSize: 12.5, color: "#9090b8", marginBottom: 6, fontWeight: 600 }}>
              ${(stats.pendingUsd ?? 0).toFixed(2)} pending · paid out monthly (min $10)
              {(() => { const wk = stats.referrals.filter(r => Date.now() - new Date(r.date).getTime() < 7 * 864e5).length; return wk > 0 ? ` · ${wk} sign-up${wk === 1 ? "" : "s"} this week` : ""; })()}
            </p>
            <p style={{ textAlign: "center", fontSize: 12, color: "#666688", marginBottom: 28, lineHeight: 1.6 }}>
              Bookings and your earnings will appear here — and in the RentOut app — once RentOut launches in your referrals&apos; area.
            </p>

            {/* Referral link */}
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "#555577", textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>
              Your referral link
            </p>
            <button onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: copied ? "rgba(155,109,255,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${copied ? "rgba(155,109,255,0.35)" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: "16px", fontSize: 14, fontWeight: 700, color: copied ? "#9B6DFF" : "#c0c0e0", cursor: "pointer", width: "100%", marginBottom: 32, boxSizing: "border-box" }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
              {copied ? "Copied!" : `getrentout.me?ref=${stats.code}`}
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: -20, marginBottom: 32 }}>
              {[
                { label: "WhatsApp", bg: "#25D366", href: `https://wa.me/?text=${encodeURIComponent(`I'm a creator on RentOut — join the early-access list with my link: ${shareUrl}`)}` },
                { label: "Telegram", bg: "#229ED9", href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("Join RentOut early access with my link")}` },
                { label: "X", bg: "#000", border: "1px solid #2a2a2a", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join RentOut early access with my link: ${shareUrl}`)}` },
              ].map(({ label, bg, border, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", background: bg, border: border || "none", borderRadius: 12, padding: "12px 8px", textDecoration: "none", fontSize: 12.5, fontWeight: 700, color: "#fff", letterSpacing: "0.03em", transition: "opacity .15s" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                  {label}
                </a>
              ))}
            </div>

            {/* Referred people list */}
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "#555577", textTransform: "uppercase", marginBottom: 14, textAlign: "center" }}>
              Your referrals
            </p>

            {stats.referrals.length === 0 ? (
              <p style={{ textAlign: "center", color: "#666688", fontSize: 14, padding: "24px 0" }}>
                No one yet — share your link to get started.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {stats.referrals.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "13px 16px" }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#e8e8f5" }}>{r.name}</span>
                      {r.city && <span style={{ fontSize: 12, color: "#7070a0", marginLeft: 8 }}>{r.city}</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {r.converted && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#5fd39a", background: "rgba(95,211,154,0.1)", border: "1px solid rgba(95,211,154,0.25)", borderRadius: 6, padding: "2px 7px" }}>Booking</span>
                      )}
                      <span style={{ fontSize: 12, color: "#666688" }}>{fmtDate(r.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Key terms — condensed, with a link to the full program terms */}
            <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "#555577", textTransform: "uppercase", marginBottom: 14 }}>
                How it works
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "You earn 5% of the service price on each completed, paid booking your referrals make — for 3 months from their first booking.",
                  "Each commission is confirmed 14 days after the booking completes (to cover refunds), then paid out.",
                  "Payouts are monthly once your confirmed balance is $10+. Your payout method is confirmed before your first payout. KYC required; you handle your own local taxes.",
                  "Refer real people only — no spam or fake sign-ups — and disclose that you earn a commission when you promote RentOut.",
                ].map((t, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, fontSize: 12.5, lineHeight: 1.65, color: "#8888aa" }}>
                    <span style={{ color: "#9B6DFF", flexShrink: 0 }}>•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <a href="/creator-terms" target="_blank" rel="noopener"
                style={{ display: "inline-block", marginTop: 16, fontSize: 13, fontWeight: 700, color: "#b090ff", textDecoration: "none" }}>
                Read the full program terms →
              </a>
            </div>

            {/* Trust footer — who runs this + how to reach a human */}
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "#666688", lineHeight: 1.7 }}>
                Questions about your earnings or the program?<br />
                Contact <a href="mailto:support@getrentout.me" style={{ color: "#9090b8", fontWeight: 600 }}>support@getrentout.me</a>.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
