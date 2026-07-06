import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — RentOut",
  description: "How RentOut collects, uses, and protects your personal data.",
};

const S = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: 36 }}>
    <h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em", color: "#f0f0fa", marginBottom: 12 }}>{title}</h2>
    <div style={{ fontSize: 14.5, color: "#a8a8c8", lineHeight: 1.8 }}>{children}</div>
  </section>
);

const UL = ({ items }: { items: React.ReactNode[] }) => (
  <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
    {items.map((it, i) => <li key={i}>{it}</li>)}
  </ul>
);

export default function PrivacyPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 99, background: "rgba(7,7,10,0.85)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "0 28px", height: 58, display: "flex", alignItems: "center", backdropFilter: "blur(16px)" }}>
        <Link href="/" style={{ fontSize: 14, fontWeight: 700, color: "#8888aa", textDecoration: "none" }}>← RentOut</Link>
      </nav>
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "72px 24px 96px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 14 }}>Legal</p>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 44px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#f8f8fa", marginBottom: 10 }}>Privacy Policy</h1>
        <p style={{ fontSize: 13.5, color: "#666688", marginBottom: 48 }}>Effective date: July 6, 2026 · Applies to the getrentout.me website and early-access waitlist</p>

        <S title="The short version">
          <p>We collect the minimum we need to run the RentOut early-access waitlist: your name, email address, and city. We use it only to manage your waitlist position and to contact you about the launch. We use no advertising or tracking cookies. We never sell your data. You can ask us to delete it at any time.</p>
        </S>

        <S title="1. Who we are">
          <p>RentOut (&quot;RentOut&quot;, &quot;we&quot;, &quot;us&quot;) operates the website at getrentout.me and is the controller of the personal data described in this policy. You can reach us about anything in this policy at <a href="mailto:support@getrentout.me" style={{ color: "var(--accent)" }}>support@getrentout.me</a>.</p>
        </S>

        <S title="2. What we collect">
          <UL items={[
            <><strong style={{ color: "#d0d0e8" }}>Name, email address, and city</strong> — the details you enter in the signup form.</>,
            <><strong style={{ color: "#d0d0e8" }}>Referral data</strong> — if you arrived through someone&apos;s referral link, we record that connection so both of you receive referral credit.</>,
            <><strong style={{ color: "#d0d0e8" }}>Basic technical data</strong> — standard server logs (such as IP address, browser type, and request time) generated automatically by our infrastructure for security, rate limiting, and reliability.</>,
          ]} />
          <p style={{ marginTop: 10 }}>We do not knowingly collect any special categories of personal data, and we ask you not to submit any.</p>
        </S>

        <S title="3. How we use your data, and why we may">
          <UL items={[
            "To create and manage your waitlist position and referral standing (performance of our agreement with you).",
            "To email you about your signup, your position, and the launch of RentOut in your region (performance of our agreement with you).",
            "To prevent abuse, duplicate signups, bots, and fraud on the waitlist (our legitimate interest in keeping the waitlist fair and secure).",
            "If you refer others using your referral link, to display your first name, city, and referral count on our public leaderboard (performance of the referral program you chose to take part in). Your email address and full name are never shown publicly.",
          ]} />
          <p style={{ marginTop: 10 }}>We do not sell, rent, or trade your personal data. We do not send third-party marketing. We do not use your data for automated decision-making that produces legal or similarly significant effects.</p>
        </S>

        <S title="4. Cookies and tracking">
          <p>The Site does not use advertising cookies, tracking cookies, or third-party analytics that profile you. If this ever changes, we will update this policy first and, where required, ask for your consent.</p>
        </S>

        <S title="5. Who processes your data">
          <p>Your data is stored and processed by infrastructure providers acting on our instructions: Vercel (hosting), Supabase (database), and Resend (email delivery). Each provider processes your data only to supply its service to us and is bound by its own data-processing commitments. We do not share your data with anyone else, except where required by law or to protect our legal rights.</p>
        </S>

        <S title="6. International transfers">
          <p>Our providers may store or process data on servers located outside your country, including in the United States and the European Union. Where such transfers occur, they take place under the providers&apos; standard safeguards, such as contractual data-protection commitments.</p>
        </S>

        <S title="7. How long we keep it">
          <p>We keep your waitlist data until RentOut launches in your region and your account is created, or until you ask us to remove you, whichever comes first. If you ask to be removed, we delete your record from the waitlist database. Server logs are retained briefly by our providers for security purposes and then deleted in the ordinary course.</p>
        </S>

        <S title="8. Security">
          <p>We protect your data with measures appropriate to a service of this kind, including encryption in transit (HTTPS), restricted access to the database, and server-side controls against automated abuse. No method of storage or transmission is completely secure, but if we become aware of a breach affecting your personal data, we will notify you as required by applicable law.</p>
        </S>

        <S title="9. Your rights">
          <p>You can ask us at any time to: access the data we hold about you, correct it, or delete it entirely. Email <a href="mailto:support@getrentout.me" style={{ color: "var(--accent)" }}>support@getrentout.me</a> from the address you signed up with and we&apos;ll take care of it promptly. Depending on where you live, you may have additional statutory rights — for example under the GDPR (EU/EEA and UK) or India&apos;s Digital Personal Data Protection Act — including the right to withdraw consent and the right to lodge a complaint with your data-protection authority. We honor those rights.</p>
        </S>

        <S title="10. Children">
          <p>The Site is not directed at children. You must be at least 18 years old, or the age of majority in your jurisdiction if higher, to join the waitlist. If we learn that we hold data about someone below that age, we will delete it.</p>
        </S>

        <S title="11. Changes to this policy">
          <p>If we change this policy, we will update the effective date at the top. For changes that significantly affect how we handle your data, we will also notify you by email before the change takes effect.</p>
        </S>

        <S title="12. Contact">
          <p>Privacy questions or requests: <a href="mailto:support@getrentout.me" style={{ color: "var(--accent)" }}>support@getrentout.me</a> · General enquiries: <a href="mailto:hello@getrentout.me" style={{ color: "var(--accent)" }}>hello@getrentout.me</a></p>
        </S>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, marginTop: 12, display: "flex", gap: 20 }}>
          <Link href="/terms" style={{ fontSize: 13.5, color: "#8888aa", textDecoration: "none" }}>Terms of Service →</Link>
          <Link href="/" style={{ fontSize: 13.5, color: "#8888aa", textDecoration: "none" }}>Back to home</Link>
        </div>
      </main>
    </div>
  );
}
