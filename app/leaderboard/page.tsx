"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

function WorldMap() {
  const dots = [
    {lat:28.6,lng:77.2},{lat:19.07,lng:72.87},{lat:12.97,lng:77.59},{lat:22.57,lng:88.36},
    {lat:51.5,lng:-0.12},{lat:40.71,lng:-74.0},{lat:37.77,lng:-122.4},{lat:35.68,lng:139.69},
    {lat:-33.87,lng:151.2},{lat:48.85,lng:2.35},{lat:52.52,lng:13.4},{lat:55.75,lng:37.62},
    {lat:31.23,lng:121.47},{lat:1.35,lng:103.82},{lat:-23.55,lng:-46.63},
  ];
  const p=(lat:number,lng:number)=>({x:(lng+180)/360*300,y:(90-lat)/180*150});
  return (
    <svg viewBox="0 0 300 150" style={{width:"100%",opacity:0.65}}>
      {dots.map((d,i)=>{const {x,y}=p(d.lat,d.lng);return(
        <g key={i} transform={`translate(${x},${y})`}>
          <circle r="1.5" fill="#9B6DFF" opacity="0.9"/>
          <circle r="1.5" fill="#9B6DFF" opacity="0.4" style={{animation:`map-pulse 2.5s ease-out ${i*0.3}s infinite`}}/>
        </g>
      );})}
    </svg>
  );
}

const Logo = () => (
  <a href="https://getrentout.me" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
    <div style={{ width: 32, height: 32, borderRadius: 9, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg, #1a1228, #120d1e)", border: "1px solid rgba(155,109,255,0.25)" }}>
      <Image src="/logo.png" alt="RentOut" width={32} height={32} style={{ borderRadius: 8 }} />
    </div>
    <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.03em", color: "#f0f0fa" }}>RentOut</span>
  </a>
);

type Leader = { rank: number; firstName: string; city: string; referralCount: number; referralCode: string };

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [myCode, setMyCode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMyCode(params.get("me"));
    fetch("/api/leaderboard")
      .then(r => r.json())
      .then(d => { setLeaders(d.leaders ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "#07070a", minHeight: "100vh", color: "#f0f0fa", fontFamily: "Inter, sans-serif" }}>
      <div className="leaderboard-glow" />
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse at bottom, rgba(242,139,130,0.05), transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

      <nav style={{ position: "sticky", top: 0, zIndex: 99, background: "rgba(7,7,10,0.85)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(16px)" }}>
        <Logo />
        <a href="https://getrentout.me" style={{ fontSize: 13, fontWeight: 600, color: "#8888aa", textDecoration: "none" }}>← Back</a>
      </nav>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "56px 24px 80px", position: "relative" }}>

        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", color: "#9B6DFF", textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>
          Top referrers
        </p>
        <h1 style={{ fontSize: "clamp(32px, 7vw, 52px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, textAlign: "center", marginBottom: 8 }}>
          Leaderboard
        </h1>
        <p style={{ fontSize: 15, color: "#8888aa", textAlign: "center", marginBottom: 32, lineHeight: 1.6 }}>
          Each referral moves you 5 spots higher in line.<br />The more you share, the sooner you earn.
        </p>

        {/* World map */}
        <div style={{ background: "rgba(155,109,255,0.04)", border: "1px solid rgba(155,109,255,0.1)", borderRadius: 16, padding: "16px 20px", marginBottom: 32, overflow: "hidden" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "#555577", textTransform: "uppercase", marginBottom: 10, textAlign: "center" }}>Earners worldwide</p>
          <WorldMap />
        </div>

        {loading && (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div style={{ width: 36, height: 36, border: "3px solid rgba(155,109,255,0.2)", borderTopColor: "#9B6DFF", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!loading && leaders.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🏆</p>
            <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No referrals yet</p>
            <p style={{ color: "#8888aa", fontSize: 14 }}>Be the first to climb the leaderboard.</p>
            <a href="https://getrentout.me" style={{ display: "inline-block", marginTop: 24, background: "linear-gradient(135deg,#9B6DFF,#F28B82)", color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 12, textDecoration: "none" }}>
              Sign up →
            </a>
          </div>
        )}

        {!loading && leaders.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {leaders.map((l) => {
              const isMe = myCode && l.referralCode === myCode;
              const isTop3 = l.rank <= 3;
              return (
                <div key={l.referralCode}
                  className="leader-row card-flip"
                  style={{
                    display: "flex", alignItems: "center", gap: 16,
                    background: isMe ? "rgba(155,109,255,0.1)" : isTop3 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isMe ? "rgba(155,109,255,0.35)" : isTop3 ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)"}`,
                    borderRadius: 16, padding: "16px 20px",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.2s",
                    animationDelay: `${l.rank * 0.1}s`, animationFillMode: "both",
                  }}
                  onMouseMove={e => {
                    const r = e.currentTarget.getBoundingClientRect();
                    const x = (e.clientX - r.left) / r.width - 0.5;
                    const y = (e.clientY - r.top) / r.height - 0.5;
                    e.currentTarget.style.transform = `perspective(700px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateZ(6px)`;
                    e.currentTarget.style.boxShadow = isMe ? `0 8px 32px rgba(155,109,255,0.25)` : `0 8px 24px rgba(0,0,0,0.3)`;
                    e.currentTarget.style.borderColor = isMe ? "rgba(155,109,255,0.5)" : "rgba(255,255,255,0.12)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = isMe ? "rgba(155,109,255,0.35)" : isTop3 ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)";
                  }}>

                  {/* Rank */}
                  <div style={{ width: 36, textAlign: "center", flexShrink: 0 }}>
                    {l.rank <= 3
                      ? <span style={{ fontSize: 22 }}>{MEDALS[l.rank - 1]}</span>
                      : <span style={{ fontSize: 14, fontWeight: 800, color: "#555577" }}>#{l.rank}</span>}
                  </div>

                  {/* Avatar */}
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, #9B6DFF, #F28B82)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                    {l.firstName[0].toUpperCase()}
                  </div>

                  {/* Name + city */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: isMe ? "#c0a0ff" : "#e0e0f0", display: "flex", alignItems: "center", gap: 8 }}>
                      {l.firstName}
                      {isMe && <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(155,109,255,0.2)", color: "#9B6DFF", borderRadius: 100, padding: "2px 10px", letterSpacing: "0.06em" }}>YOU</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#666688", marginTop: 2 }}>{l.city}</div>
                  </div>

                  {/* Referral count */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em", background: "linear-gradient(135deg,#9B6DFF,#F28B82)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", overflow: "hidden" }}>
                      <span className="odometer-digit" style={{ animationDelay: `${l.rank * 0.1 + 0.3}s` }}>{l.referralCount}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#555577", fontWeight: 600 }}>
                      {l.referralCount === 1 ? "referral" : "referrals"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && leaders.length > 0 && (
          <>
            <p style={{ textAlign: "center", fontSize: 13, color: "#444466", marginTop: 32, marginBottom: 40 }}>
              Only showing earners with at least 1 referral.
            </p>
            <div style={{ background: "linear-gradient(160deg, rgba(155,109,255,0.07), rgba(242,139,130,0.04))", border: "1px solid rgba(155,109,255,0.15)", borderRadius: 20, padding: "32px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 22, marginBottom: 10 }}>🚀</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#e0e0f0", marginBottom: 6 }}>Want to climb higher?</p>
              <p style={{ fontSize: 13, color: "#8888aa", marginBottom: 20, lineHeight: 1.6 }}>Each friend you refer moves you 5 spots up the queue.</p>
              <a href="https://getrentout.me" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(110deg,#9B6DFF,#b57dff)", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 28px", borderRadius: 100, textDecoration: "none", boxShadow: "0 8px 28px rgba(155,109,255,0.35)" }}>
                Share your link →
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
