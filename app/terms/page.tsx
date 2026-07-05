import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — RentOut",
  description: "The terms that govern the RentOut early-access waitlist and referral program.",
};

const S = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: 36 }}>
    <h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em", color: "#f0f0fa", marginBottom: 12 }}>{title}</h2>
    <div style={{ fontSize: 14.5, color: "#a8a8c8", lineHeight: 1.8 }}>{children}</div>
  </section>
);

export default function TermsPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 99, background: "rgba(7,7,10,0.85)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "0 28px", height: 58, display: "flex", alignItems: "center", backdropFilter: "blur(16px)" }}>
        <Link href="/" style={{ fontSize: 14, fontWeight: 700, color: "#8888aa", textDecoration: "none" }}>← RentOut</Link>
      </nav>
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "72px 24px 96px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 14 }}>Legal</p>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 44px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#f8f8fa", marginBottom: 10 }}>Terms of Service</h1>
        <p style={{ fontSize: 13.5, color: "#666688", marginBottom: 48 }}>Last updated: July 5, 2026 · Applies to the getrentout.me early-access waitlist</p>

        <S title="1. What these terms cover">
          <p>These terms govern your use of the RentOut website at getrentout.me, including the early-access waitlist and the referral program (together, the &quot;Waitlist&quot;). The RentOut marketplace app itself is not yet publicly available; when it launches, it will have its own Terms of Service that you will review and accept separately before creating an account.</p>
        </S>

        <S title="2. Joining the waitlist">
          <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <li>Joining is free. We never charge you to sign up, hold a position, or receive an invitation.</li>
            <li>You must be at least 18 years old (or the age of majority where you live) and provide accurate information.</li>
            <li>One signup per person. Duplicate, automated, or fraudulent signups may be removed without notice.</li>
          </ul>
        </S>

        <S title="3. Waitlist positions and referrals">
          <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <li>Your position reflects the order of signups and referral activity. Each genuine signup through your referral link improves your position as described on the site.</li>
            <li>Referral positions must be earned through real people genuinely signing up. Self-referrals, bot signups, disposable-email farming, or misleading promotion (spam) are prohibited and may result in removal from the Waitlist.</li>
            <li>A waitlist position grants earlier access to the app at launch. It is not a guarantee of income, employment, a contract of work, or a financial instrument, and it cannot be sold or transferred.</li>
          </ul>
        </S>

        <S title="4. What RentOut is (and isn't)">
          <p>RentOut is a marketplace platform where independent earners list legal skills and services that customers can book and pay for through the app. Earners are independent providers, not employees, agents, or workers of RentOut. Earnings depend entirely on the listings you create and the bookings you complete — we make no earnings promises or guarantees.</p>
        </S>

        <S title="5. Acceptable use">
          <p>You agree not to misuse the site — including attempting to breach its security, scrape or harvest other users&apos; data, manipulate the referral system, or use the Waitlist to promote anything unlawful.</p>
        </S>

        <S title="6. Communications">
          <p>By joining the Waitlist you agree to receive emails from us about your signup, your position, and the launch. Every email includes a way to opt out, and you can leave the Waitlist at any time by emailing <a href="mailto:support@getrentout.me" style={{ color: "var(--accent)" }}>support@getrentout.me</a>.</p>
        </S>

        <S title="7. Privacy">
          <p>Our <Link href="/privacy" style={{ color: "var(--accent)" }}>Privacy Policy</Link> explains what data we collect and how we use it. In short: name, email, and city — used only to run the Waitlist, never sold.</p>
        </S>

        <S title="8. Changes, availability, and liability">
          <p style={{ marginBottom: 10 }}>We may update launch timing, regional availability, early-access benefits, or these terms as the product evolves; material changes will be reflected on this page with an updated date. The site is provided &quot;as is&quot; — to the maximum extent permitted by law, we are not liable for indirect or consequential losses arising from your use of the Waitlist.</p>
          <p>Nothing in these terms limits liability that cannot be limited by applicable law.</p>
        </S>

        <S title="9. Contact">
          <p>Questions about these terms: <a href="mailto:hello@getrentout.me" style={{ color: "var(--accent)" }}>hello@getrentout.me</a> · Support: <a href="mailto:support@getrentout.me" style={{ color: "var(--accent)" }}>support@getrentout.me</a></p>
        </S>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, marginTop: 12, display: "flex", gap: 20 }}>
          <Link href="/privacy" style={{ fontSize: 13.5, color: "#8888aa", textDecoration: "none" }}>Privacy Policy →</Link>
          <Link href="/" style={{ fontSize: 13.5, color: "#8888aa", textDecoration: "none" }}>Back to home</Link>
        </div>
      </main>
    </div>
  );
}
