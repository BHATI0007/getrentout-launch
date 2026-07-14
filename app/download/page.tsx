import type { Metadata } from "next";
import Image from "next/image";

const APK_URL =
  "https://github.com/BHATI0007/getrentout-launch/releases/download/v1.1.1-android-arm64-b3/app-arm64-v8a-prod-release.apk";

export const metadata: Metadata = {
  title: "Download RentOut — Android Beta",
  description: "Download the RentOut Android beta app.",
};

// Every APK swap needs this page to be re-fetched, never served stale from
// a browser or CDN cache — a phone with this tab already open from a prior
// test would otherwise silently keep pointing at the old build.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const Logo = () => (
  <a href="https://getrentout.me" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
    <div style={{ width: 32, height: 32, borderRadius: 9, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg, #1a1228, #120d1e)", border: "1px solid rgba(155,109,255,0.25)" }}>
      <Image src="/logo.png" alt="RentOut" width={32} height={32} style={{ borderRadius: 8 }} />
    </div>
    <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.03em", color: "#f0f0fa" }}>RentOut</span>
  </a>
);

const steps = [
  { n: 1, text: "Tap Download below. The app file (.apk) saves to your phone." },
  { n: 2, text: "Open the downloaded file from your notifications or Downloads folder." },
  { n: 3, text: "Android will warn about installing outside the Play Store — tap Settings, then allow \"Install unknown apps\" for this app just once." },
  { n: 4, text: "Go back and tap Install. Open RentOut and sign in with the email you used to join the waitlist." },
];

export default function DownloadPage() {
  return (
    <div style={{ background: "#07070a", minHeight: "100vh", color: "#f0f0fa", fontFamily: "Inter, sans-serif" }}>
      <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: 700, height: 400, background: "radial-gradient(ellipse at top, rgba(155,109,255,0.08), transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

      <nav style={{ position: "sticky", top: 0, zIndex: 99, background: "rgba(7,7,10,0.85)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(16px)" }}>
        <Logo />
        <a href="https://getrentout.me" style={{ fontSize: 13, fontWeight: 600, color: "#8888aa", textDecoration: "none" }}>← Back</a>
      </nav>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "56px 24px 80px", position: "relative" }}>

        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", color: "#9B6DFF", textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>
          Early access
        </p>
        <h1 style={{ fontSize: "clamp(32px, 7vw, 48px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, textAlign: "center", marginBottom: 12 }}>
          You&apos;re in.<br />Get the app.
        </h1>
        <p style={{ fontSize: 15, color: "#8888aa", textAlign: "center", marginBottom: 36, lineHeight: 1.6 }}>
          You&apos;re one of the first people to get RentOut. It&apos;s a beta build for Android, installed directly (not through the Play Store yet).
        </p>

        <a
          href={APK_URL}
          style={{
            display: "block", background: "linear-gradient(110deg,#9B6DFF,#F28B82)", color: "#fff",
            textDecoration: "none", textAlign: "center", padding: "18px 24px", borderRadius: 14,
            fontWeight: 800, fontSize: 16, letterSpacing: "-0.2px", marginBottom: 10,
            boxShadow: "0 8px 32px rgba(155,109,255,0.25)",
          }}
        >
          Download for Android →
        </a>
        <p style={{ fontSize: 12, color: "#555577", textAlign: "center", marginBottom: 40 }}>
          v1.1.1 · Android 8.0+ · ~114MB
        </p>

        <div style={{ background: "#0f0f14", border: "1px solid #1a1a24", borderRadius: 16, padding: "24px 22px", marginBottom: 28 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "#9B6DFF", textTransform: "uppercase", marginBottom: 16 }}>
            How to install
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {steps.map((s) => (
              <div key={s.n} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(155,109,255,0.15)", color: "#c0a0ff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  {s.n}
                </div>
                <p style={{ fontSize: 14, color: "#b0b0c0", lineHeight: 1.6, margin: 0 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 13, color: "#555577", textAlign: "center", lineHeight: 1.7 }}>
          iOS isn&apos;t ready yet — we&apos;ll email you the moment it is.<br />
          Trouble installing? Reply to your invite email or write to{" "}
          <a href="mailto:support@getrentout.me" style={{ color: "#9B6DFF" }}>support@getrentout.me</a>.
        </p>
      </div>
    </div>
  );
}
