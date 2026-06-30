import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "RentOut — Sell anything. Keep everything.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#07070a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Purple glow top */}
        <div style={{
          position: "absolute", top: -150, left: "50%", transform: "translateX(-50%)",
          width: 900, height: 700,
          background: "radial-gradient(ellipse at center, rgba(155,109,255,0.28), transparent 65%)",
          borderRadius: "50%",
        }} />
        {/* Coral glow bottom-right */}
        <div style={{
          position: "absolute", bottom: -100, right: -50,
          width: 600, height: 500,
          background: "radial-gradient(ellipse at center, rgba(242,139,130,0.14), transparent 65%)",
          borderRadius: "50%",
        }} />

        {/* Content */}
        <div style={{ position: "relative", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Logo pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(155,109,255,0.3)",
            borderRadius: 16, padding: "12px 24px", marginBottom: 52,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg, #9B6DFF, #7c44ff)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 900, color: "#fff",
            }}>R</div>
            <span style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>RentOut</span>
          </div>

          {/* Headline */}
          <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 0.92, letterSpacing: "-4px", color: "#f8f8fa", marginBottom: 16 }}>
            Sell anything.
          </div>
          <div style={{
            fontSize: 96, fontWeight: 900, lineHeight: 0.92, letterSpacing: "-4px",
            background: "linear-gradient(110deg, #9B6DFF 0%, #c87dff 45%, #F28B82 100%)",
            backgroundClip: "text", color: "transparent",
            WebkitBackgroundClip: "text",
          }}>
            Keep everything.
          </div>

          {/* Subtext */}
          <p style={{ fontSize: 22, color: "#8f8fa0", marginTop: 40, marginBottom: 0, letterSpacing: "-0.2px" }}>
            Sign up now — first 100,000 earners get early access.
          </p>
        </div>
      </div>
    ),
    { ...size }
  );
}
