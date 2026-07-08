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
type Stats = { name: string; code: string; status: string; totalReferrals: number; convertedReferrals: number; referrals: Referral[] };

const fmtDate = (iso: string) => {
  try { return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" }); }
  catch { return ""; }
};

export default function CreatorDashboard() {
  const { code } = useParams<{ code: string }>();
  const [stats, setStats] = useState<Stats | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

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
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Creator link not found</h2>
            <p style={{ color: "#8888aa" }}>This creator code doesn&apos;t exist or hasn&apos;t been activated yet.</p>
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
            <p style={{ textAlign: "center", fontSize: 13, color: "#8888aa", marginBottom: 30 }}>
              You earn <span style={{ color: "#b090ff", fontWeight: 700 }}>5% of every booking</span> your referrals make, for 3 months.
            </p>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
              <div style={{ background: "rgba(155,109,255,0.07)", border: "1px solid rgba(155,109,255,0.2)", borderRadius: 18, padding: "24px 16px", textAlign: "center" }}>
                <div style={{ fontSize: "clamp(40px,9vw,60px)", fontWeight: 900, letterSpacing: "-0.04em", background: "linear-gradient(135deg,#9B6DFF,#F28B82)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {stats.totalReferrals}
                </div>
                <p style={{ fontSize: 12, color: "#9090b8", fontWeight: 600 }}>people signed up</p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "24px 16px", textAlign: "center" }}>
                <div style={{ fontSize: "clamp(40px,9vw,60px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#f0f0fa" }}>
                  {stats.convertedReferrals}
                </div>
                <p style={{ fontSize: 12, color: "#7070a0", fontWeight: 600 }}>started booking</p>
              </div>
            </div>

            {/* Referral link */}
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "#555577", textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>
              Your referral link
            </p>
            <button onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: copied ? "rgba(155,109,255,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${copied ? "rgba(155,109,255,0.35)" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: "16px", fontSize: 14, fontWeight: 700, color: copied ? "#9B6DFF" : "#c0c0e0", cursor: "pointer", width: "100%", marginBottom: 32, boxSizing: "border-box" }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
              {copied ? "Copied!" : `getrentout.me?ref=${stats.code}`}
            </button>

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

            {/* Strict program terms — every creator is bound by these */}
            <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "#555577", textTransform: "uppercase", marginBottom: 14 }}>
                Program terms
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "You earn 5% of a referred user's booking value, on completed and paid bookings only. Sign-ups alone earn nothing.",
                  "You keep earning from each referred user for 3 months from their first booking.",
                  "Referrals only apply within RentOut's first 100,000 early-access spots. Once the waitlist is full, no further referral credit is earned.",
                  "A referral counts only if the person signs up using your link and provides a valid phone/WhatsApp number.",
                  "Commission is reversed if a booking is refunded, cancelled, or disputed. Already-paid commission may be deducted from your next payout.",
                  "Self-referrals and fake accounts are prohibited and result in forfeiture of all pending earnings and removal from the program.",
                  "Payouts require identity (KYC) verification in the app and a minimum balance of ₹500.",
                  "This is an invite-only program. RentOut may change rates or end it with 30 days' notice; earnings already locked in are honoured.",
                ].map((t, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, fontSize: 12.5, lineHeight: 1.6, color: "#8888aa" }}>
                    <span style={{ color: "#9B6DFF", flexShrink: 0 }}>•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
