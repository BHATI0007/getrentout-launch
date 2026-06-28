"use client";

import { useState, useEffect } from "react";

const LAUNCH_DATE = new Date("2025-07-08T00:00:00");

const CITIES = [
  { name: "Delhi", current: 8, total: 10, flag: "🇮🇳" },
  { name: "Mumbai", current: 6, total: 10, flag: "🇮🇳" },
  { name: "Bangalore", current: 3, total: 10, flag: "🇮🇳" },
  { name: "Dubai", current: 4, total: 10, flag: "🇦🇪" },
  { name: "London", current: 1, total: 10, flag: "🇬🇧" },
  { name: "Toronto", current: 2, total: 10, flag: "🇨🇦" },
  { name: "Singapore", current: 0, total: 10, flag: "🇸🇬" },
  { name: "New York", current: 0, total: 10, flag: "🇺🇸" },
];

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #FF8FAB, #FF6B6B)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M13 3L5 13h7l-1 8 8-10h-7l1-8z" fill="white" strokeWidth="0.5" />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1 }}>
          Rent<span style={{ color: "#FF8FAB" }}>Out</span>
        </div>
        <div style={{ fontSize: "8px", letterSpacing: "3px", color: "#FF8FAB", opacity: 0.7 }}>RENT ANYTHING · ANYTIME</div>
      </div>
    </div>
  );
}

function Countdown() {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = LAUNCH_DATE.getTime() - Date.now();
      if (diff <= 0) { setTime({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setTime({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
      {[{ v: time.d, l: "Days" }, { v: time.h, l: "Hours" }, { v: time.m, l: "Min" }, { v: time.s, l: "Sec" }].map(({ v, l }) => (
        <div key={l} style={{ textAlign: "center" }}>
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: "10px", padding: "10px 14px", minWidth: "58px", fontSize: "24px", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "#fff", lineHeight: 1 }}>{pad(v)}</div>
          <div style={{ fontSize: "9px", color: "#555", marginTop: "4px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

function CityBar({ city, current, total, flag }: { city: string; current: number; total: number; flag: string }) {
  const pct = (current / total) * 100;
  const left = total - current;
  const unlocked = current >= total;
  return (
    <div style={{ padding: "12px 16px", background: unlocked ? "#0a1a0a" : "#0d0d0d", border: `1px solid ${unlocked ? "#34C75933" : "#1a1a1a"}`, borderRadius: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>{flag}</span>
          <span style={{ fontSize: "14px", fontWeight: 600, color: unlocked ? "#34C759" : "#fff" }}>{city}</span>
          {unlocked && <span style={{ fontSize: "10px", background: "#34C75922", color: "#34C759", border: "1px solid #34C75933", borderRadius: "100px", padding: "2px 8px", fontWeight: 600 }}>UNLOCKED</span>}
        </div>
        <div style={{ textAlign: "right" }}>
          {unlocked ? (
            <span style={{ fontSize: "12px", color: "#34C759", fontWeight: 600 }}>Zero commission ✓</span>
          ) : (
            <span style={{ fontSize: "12px", color: "#FF8FAB", fontWeight: 600 }}>{left} spot{left !== 1 ? "s" : ""} left</span>
          )}
        </div>
      </div>
      <div style={{ height: "6px", background: "#1a1a1a", borderRadius: "100px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: unlocked ? "#34C759" : "linear-gradient(90deg, #FF8FAB, #FF6B6B)", borderRadius: "100px", transition: "width 0.5s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
        <span style={{ fontSize: "10px", color: "#333" }}>{current}/{total} providers</span>
        {!unlocked && <span style={{ fontSize: "10px", color: "#333" }}>First {total} = 0% commission forever</span>}
      </div>
    </div>
  );
}

type View = "home" | "provider" | "customer" | "done-provider" | "done-customer";

export default function Page() {
  const [view, setView] = useState<View>("home");
  const [loading, setLoading] = useState(false);
  const [pForm, setPForm] = useState({ name: "", email: "", city: "", category: "", about: "" });
  const [cForm, setCForm] = useState({ name: "", email: "", city: "" });
  const [waitlistResult, setWaitlistResult] = useState<{ position: number; referralCode: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [refCode, setRefCode] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setRefCode(ref);
  }, []);

  async function submitProvider(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      await fetch("/api/provider", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pForm) });
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

  if (view === "done-provider") return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "420px", width: "100%", textAlign: "center" }}>
        <div style={{ marginBottom: "28px", display: "flex", justifyContent: "center" }}><Logo /></div>
        <div style={{ fontSize: "52px", marginBottom: "16px" }}>⚡</div>
        <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "10px" }}>You're in the race.</h2>
        <p style={{ color: "#555", fontSize: "15px", lineHeight: 1.7, marginBottom: "16px" }}>
          We're reviewing your application now.<br />
          If your city unlocks — you get <span style={{ color: "#FF8FAB" }}>zero commission forever.</span>
        </p>
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "16px", marginBottom: "20px", fontSize: "13px", color: "#555" }}>
          Tell other providers in your city to apply.<br />
          <span style={{ color: "#FF8FAB" }}>More providers = city unlocks faster = you all earn sooner.</span>
        </div>
        <button onClick={() => setView("home")} style={{ background: "none", border: "1px solid #222", borderRadius: "10px", color: "#666", padding: "10px 24px", cursor: "pointer", fontSize: "14px" }}>← Back</button>
      </div>
    </main>
  );

  if (view === "done-customer") return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "420px", width: "100%", textAlign: "center" }}>
        <div style={{ marginBottom: "28px", display: "flex", justifyContent: "center" }}><Logo /></div>
        <div style={{ background: "#0d0d0d", border: "1px solid #FF8FAB33", borderRadius: "20px", padding: "28px", marginBottom: "16px" }}>
          <p style={{ color: "#666", fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>Your position</p>
          <div style={{ fontSize: "64px", fontWeight: 800, lineHeight: 1, background: "linear-gradient(135deg,#FF8FAB,#FF6B6B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>#{waitlistResult?.position}</div>
          <p style={{ color: "#444", fontSize: "13px", marginTop: "6px" }}>{cForm.city} waitlist</p>
        </div>
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "16px", marginBottom: "12px", textAlign: "left" }}>
          <p style={{ fontWeight: 600, fontSize: "14px", marginBottom: "6px" }}>Skip the line</p>
          <p style={{ color: "#555", fontSize: "12px", marginBottom: "12px" }}>Share your link — every friend moves you up.</p>
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "8px 12px", fontFamily: "monospace", fontSize: "11px", color: "#FF8FAB", marginBottom: "10px" }}>
            getrentout.me?ref={waitlistResult?.referralCode}
          </div>
          <button onClick={copyLink} style={{ width: "100%", background: "linear-gradient(135deg,#FF8FAB,#FF6B6B)", border: "none", borderRadius: "8px", color: "#fff", padding: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
            {copied ? "✓ Copied!" : "Copy referral link"}
          </button>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <a href={`https://twitter.com/intent/tweet?text=I just joined RentOut — the app launching during FIFA World Cup. Never watch alone again 👇&url=https://getrentout.me?ref=${waitlistResult?.referralCode}`} target="_blank" rel="noopener" style={{ flex: 1, background: "#111", border: "1px solid #222", borderRadius: "10px", padding: "9px", fontSize: "12px", color: "#fff", textDecoration: "none", textAlign: "center" as const }}>Share on X</a>
          <a href={`https://wa.me/?text=I just joined RentOut — launching during FIFA World Cup. Get your spot: https://getrentout.me?ref=${waitlistResult?.referralCode}`} target="_blank" rel="noopener" style={{ flex: 1, background: "#111", border: "1px solid #222", borderRadius: "10px", padding: "9px", fontSize: "12px", color: "#fff", textDecoration: "none", textAlign: "center" as const }}>Share on WhatsApp</a>
        </div>
      </div>
    </main>
  );

  if (view === "provider") return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "400px", width: "100%" }}>
        <div style={{ marginBottom: "24px" }}><button onClick={() => setView("home")} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "14px", padding: 0 }}>← Back</button></div>
        <div style={{ marginBottom: "20px" }}><Logo /></div>
        <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "4px" }}>Apply as a provider</h2>
        <p style={{ color: "#555", fontSize: "13px", marginBottom: "8px" }}>First 10 in your city = zero commission forever.</p>
        <div style={{ background: "#FF8FAB15", border: "1px solid #FF8FAB33", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#FF8FAB", marginBottom: "20px" }}>
          ⚡ Spots are filling fast. Check the city map below.
        </div>
        <form onSubmit={submitProvider} style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
          <input required placeholder="Your name" value={pForm.name} onChange={e => setPForm(p => ({ ...p, name: e.target.value }))} style={{ background: "#111", border: "1px solid #222", borderRadius: "10px", color: "#fff", padding: "12px 14px", fontSize: "14px", width: "100%", outline: "none", fontFamily: "inherit" }} />
          <input required type="email" placeholder="Email address" value={pForm.email} onChange={e => setPForm(p => ({ ...p, email: e.target.value }))} style={{ background: "#111", border: "1px solid #222", borderRadius: "10px", color: "#fff", padding: "12px 14px", fontSize: "14px", width: "100%", outline: "none", fontFamily: "inherit" }} />
          <input required placeholder="Your city" value={pForm.city} onChange={e => setPForm(p => ({ ...p, city: e.target.value }))} style={{ background: "#111", border: "1px solid #222", borderRadius: "10px", color: "#fff", padding: "12px 14px", fontSize: "14px", width: "100%", outline: "none", fontFamily: "inherit" }} />
          <select required value={pForm.category} onChange={e => setPForm(p => ({ ...p, category: e.target.value }))} style={{ background: "#111", border: "1px solid #222", borderRadius: "10px", color: pForm.category ? "#fff" : "#555", padding: "12px 14px", fontSize: "14px", width: "100%", outline: "none", fontFamily: "inherit" }}>
            <option value="">What do you offer?</option>
            <option>Gaming Partner</option>
            <option>Watch Party Companion</option>
            <option>Social Companion</option>
            <option>Event Companion</option>
            <option>Fitness Partner</option>
            <option>Language Partner</option>
            <option>Other</option>
          </select>
          <textarea placeholder="Tell us about yourself (optional)" rows={3} value={pForm.about} onChange={e => setPForm(p => ({ ...p, about: e.target.value }))} style={{ background: "#111", border: "1px solid #222", borderRadius: "10px", color: "#fff", padding: "12px 14px", fontSize: "14px", width: "100%", outline: "none", fontFamily: "inherit", resize: "none" }} />
          <button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg,#FF8FAB,#FF6B6B)", border: "none", borderRadius: "10px", color: "#fff", padding: "13px", fontSize: "14px", fontWeight: 700, cursor: "pointer", marginTop: "4px", opacity: loading ? 0.5 : 1 }}>
            {loading ? "Applying..." : "Claim my founding spot →"}
          </button>
        </form>
      </div>
    </main>
  );

  if (view === "customer") return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "400px", width: "100%" }}>
        <div style={{ marginBottom: "24px" }}><button onClick={() => setView("home")} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "14px", padding: 0 }}>← Back</button></div>
        <div style={{ marginBottom: "20px" }}><Logo /></div>
        <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "4px" }}>Join the waitlist</h2>
        <p style={{ color: "#555", fontSize: "13px", marginBottom: "20px" }}>Get notified the moment your city unlocks.</p>
        {refCode && <div style={{ background: "#FF8FAB15", border: "1px solid #FF8FAB33", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#FF8FAB", marginBottom: "16px" }}>✓ Referred by a friend — you're already ahead.</div>}
        <form onSubmit={submitCustomer} style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
          <input required placeholder="Your name" value={cForm.name} onChange={e => setCForm(p => ({ ...p, name: e.target.value }))} style={{ background: "#111", border: "1px solid #222", borderRadius: "10px", color: "#fff", padding: "12px 14px", fontSize: "14px", width: "100%", outline: "none", fontFamily: "inherit" }} />
          <input required type="email" placeholder="Email address" value={cForm.email} onChange={e => setCForm(p => ({ ...p, email: e.target.value }))} style={{ background: "#111", border: "1px solid #222", borderRadius: "10px", color: "#fff", padding: "12px 14px", fontSize: "14px", width: "100%", outline: "none", fontFamily: "inherit" }} />
          <input required placeholder="Your city" value={cForm.city} onChange={e => setCForm(p => ({ ...p, city: e.target.value }))} style={{ background: "#111", border: "1px solid #222", borderRadius: "10px", color: "#fff", padding: "12px 14px", fontSize: "14px", width: "100%", outline: "none", fontFamily: "inherit" }} />
          <button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg,#FF8FAB,#FF6B6B)", border: "none", borderRadius: "10px", color: "#fff", padding: "13px", fontSize: "14px", fontWeight: 700, cursor: "pointer", marginTop: "4px", opacity: loading ? 0.5 : 1 }}>
            {loading ? "Saving..." : "Reserve my spot →"}
          </button>
        </form>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, #FF8FAB18 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "520px", width: "100%", position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ marginBottom: "36px" }}><Logo /></div>

        {/* FIFA badge */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#FF8FAB15", border: "1px solid #FF8FAB30", borderRadius: "100px", padding: "5px 14px", fontSize: "11px", color: "#FF8FAB", fontWeight: 600, letterSpacing: "0.06em" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#FF8FAB", display: "inline-block" }} />
            FIFA WORLD CUP 2026 · SEMI FINALS IN 10 DAYS
          </span>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: "clamp(34px,8vw,56px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-1.5px", marginBottom: "14px" }}>
          Never watch<br />
          <span style={{ background: "linear-gradient(135deg,#FF8FAB,#FF6B6B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>alone again.</span>
        </h1>
        <p style={{ color: "#555", fontSize: "15px", lineHeight: 1.65, marginBottom: "24px" }}>
          We're not telling you everything yet.<br />But founding providers won't regret it.
        </p>

        {/* Countdown */}
        <div style={{ marginBottom: "28px" }}><Countdown /></div>

        {/* City Unlock Map */}
        <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px" }}>City Unlock Map</div>
              <div style={{ fontSize: "11px", color: "#444", marginTop: "2px" }}>First 10 providers per city = zero commission forever</div>
            </div>
            <span style={{ fontSize: "10px", background: "#FF8FAB15", color: "#FF8FAB", border: "1px solid #FF8FAB33", borderRadius: "100px", padding: "3px 10px", fontWeight: 600 }}>LIVE</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {CITIES.map(c => <CityBar key={c.name} {...c} />)}
          </div>
        </div>

        {/* Two CTAs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
          <button onClick={() => setView("provider")} style={{ background: "linear-gradient(135deg,#FF8FAB,#FF6B6B)", border: "none", borderRadius: "12px", color: "#fff", padding: "16px", fontSize: "14px", fontWeight: 700, cursor: "pointer", textAlign: "center" as const }}>
            <div style={{ fontSize: "22px", marginBottom: "6px" }}>⚡</div>
            <div>I want to earn</div>
            <div style={{ fontSize: "11px", fontWeight: 400, opacity: 0.85, marginTop: "3px" }}>Claim founding spot</div>
          </button>
          <button onClick={() => setView("customer")} style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", color: "#fff", padding: "16px", fontSize: "14px", fontWeight: 700, cursor: "pointer", textAlign: "center" as const }}>
            <div style={{ fontSize: "22px", marginBottom: "6px" }}>🎮</div>
            <div>I want to experience</div>
            <div style={{ fontSize: "11px", fontWeight: 400, color: "#555", marginTop: "3px" }}>Join waitlist</div>
          </button>
        </div>

        <div style={{ textAlign: "center", color: "#2a2a2a", fontSize: "12px", display: "flex", gap: "20px", justifyContent: "center" }}>
          <a href="/privacy" style={{ color: "#2a2a2a", textDecoration: "none" }}>Privacy</a>
          <a href="/terms" style={{ color: "#2a2a2a", textDecoration: "none" }}>Terms</a>
          <span>© 2025 RentOut</span>
        </div>
      </div>
    </main>
  );
}
