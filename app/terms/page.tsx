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

const UL = ({ items }: { items: React.ReactNode[] }) => (
  <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
    {items.map((it, i) => <li key={i}>{it}</li>)}
  </ul>
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
        <p style={{ fontSize: 13.5, color: "#666688", marginBottom: 48 }}>Effective date: July 6, 2026 · Applies to the getrentout.me website, early-access waitlist, and referral program</p>

        <S title="1. Agreement to these terms">
          <p>These Terms of Service (the &quot;Terms&quot;) are an agreement between you and RentOut (&quot;RentOut&quot;, &quot;we&quot;, &quot;us&quot;), the operator of the website at getrentout.me (the &quot;Site&quot;), which includes the early-access waitlist and the referral program (together, the &quot;Waitlist&quot;). By using the Site or joining the Waitlist, you accept these Terms. If you do not agree with them, do not use the Site.</p>
          <p style={{ marginTop: 10 }}>The RentOut marketplace application is not yet publicly available. When it launches, it will be governed by its own Terms of Service, which you will review and accept separately before creating an account. Nothing in these Terms obliges you to use the application, and nothing obliges us to provide you access to it.</p>
        </S>

        <S title="2. Eligibility and joining the Waitlist">
          <UL items={[
            "Joining is free. We never charge you to sign up, to hold a position, or to receive an invitation.",
            "You must be at least 18 years old, or the age of majority in your jurisdiction if higher, and capable of entering into a binding agreement.",
            "You must provide accurate, current information and keep it that way. One signup per person.",
            "Duplicate, automated, purchased, or otherwise fraudulent signups may be removed without notice.",
          ]} />
        </S>

        <S title="3. Waitlist positions and referrals">
          <UL items={[
            "Your position reflects the order of signups and genuine referral activity. Each genuine signup made through your referral link improves your position as described on the Site.",
            "Referral credit must be earned by real people who choose to sign up. Self-referrals, automated or incentivised signups, disposable-email registrations, and misleading or unsolicited promotion (spam) are prohibited.",
            "We may verify referral activity and may adjust, freeze, or remove positions or referral credit obtained in breach of this section.",
            "A Waitlist position grants earlier access to the application at launch in your region. It is not a guarantee of income or employment, it has no monetary value, and it may not be sold, transferred, or exchanged.",
          ]} />
        </S>

        <S title="4. What RentOut is — and what it is not">
          <p>RentOut is a marketplace platform on which independent earners will be able to list lawful skills and services that customers can book and pay for through the application. Earners are independent providers acting on their own behalf. They are not employees, workers, agents, or representatives of RentOut. Any earnings depend entirely on the listings an earner creates and the bookings they complete. We make no representation, promise, or guarantee of any level of earnings.</p>
        </S>

        <S title="5. Acceptable use">
          <p>In connection with the Site, you agree not to:</p>
          <UL items={[
            "attempt to probe, breach, or test the security of the Site or its infrastructure;",
            "scrape, harvest, or collect data about other users;",
            "interfere with the operation of the Site, including by automated traffic or excessive requests;",
            "manipulate the Waitlist or the referral program; or",
            "use the Site to promote anything unlawful, deceptive, or harmful.",
          ]} />
        </S>

        <S title="6. Suspension and removal">
          <p>We may suspend or remove your Waitlist registration, withhold or reverse referral credit, or restrict your access to the Site if we reasonably believe you have breached these Terms. Where practical, we will tell you why. You may leave the Waitlist at any time by emailing <a href="mailto:support@getrentout.me" style={{ color: "var(--accent)" }}>support@getrentout.me</a>.</p>
        </S>

        <S title="7. Communications">
          <p>By joining the Waitlist you consent to receive emails from us about your signup, your position, and the launch of RentOut. These are service communications, not third-party marketing. Every email includes a way to opt out.</p>
        </S>

        <S title="8. Privacy">
          <p>Our <Link href="/privacy" style={{ color: "var(--accent)" }}>Privacy Policy</Link> explains what personal data we collect and how we use and protect it. It forms part of these Terms.</p>
        </S>

        <S title="9. Intellectual property">
          <p>The Site and its content — including the RentOut name, logo, design, text, and graphics — are owned by or licensed to RentOut and are protected by intellectual-property laws. We grant you a limited, revocable, non-exclusive licence to access and use the Site for its intended purpose. You may not copy, modify, distribute, or create derivative works from the Site or its content without our prior written consent, except as permitted by law.</p>
        </S>

        <S title="10. Disclaimers">
          <p>The Site and the Waitlist are provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the maximum extent permitted by law, we disclaim all warranties, express or implied, including fitness for a particular purpose and non-infringement. We do not warrant that the Site will be uninterrupted or error-free, or that the application will launch on any particular date, in any particular region, or with any particular features.</p>
        </S>

        <S title="11. Limitation of liability">
          <p>To the maximum extent permitted by law, RentOut will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, revenue, data, or goodwill, arising out of or in connection with your use of the Site or the Waitlist. To the same extent, our total aggregate liability for all claims relating to the Site or the Waitlist will not exceed one hundred US dollars (US $100). Nothing in these Terms excludes or limits any liability that cannot be excluded or limited under applicable law.</p>
        </S>

        <S title="12. Changes">
          <p>We may update the Waitlist, its benefits, launch timing, regional availability, and these Terms as the product evolves. If we make a material change to these Terms, we will update the effective date above and, where the change significantly affects your rights, notify you by email. Your continued use of the Site after a change takes effect constitutes acceptance of the updated Terms.</p>
        </S>

        <S title="13. Governing law and disputes">
          <p>These Terms are governed by the laws of India, without regard to conflict-of-law principles. The courts at New Delhi, India will have exclusive jurisdiction over any dispute arising out of or relating to these Terms or the Site, subject to any mandatory consumer-protection rights available to you in your country of residence. Before starting any formal proceedings, please contact us — most concerns can be resolved quickly and informally.</p>
        </S>

        <S title="14. General">
          <UL items={[
            "If any provision of these Terms is found unenforceable, the remaining provisions remain in full force.",
            "Our failure to enforce a provision is not a waiver of our right to enforce it later.",
            "You may not assign your rights under these Terms; we may assign ours in connection with a merger, acquisition, or sale of assets.",
            "These Terms, together with the Privacy Policy, are the entire agreement between you and us regarding the Site and the Waitlist.",
          ]} />
        </S>

        <S title="15. Contact">
          <p>Questions about these Terms: <a href="mailto:hello@getrentout.me" style={{ color: "var(--accent)" }}>hello@getrentout.me</a> · Support: <a href="mailto:support@getrentout.me" style={{ color: "var(--accent)" }}>support@getrentout.me</a></p>
        </S>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, marginTop: 12, display: "flex", gap: 20 }}>
          <Link href="/privacy" style={{ fontSize: 13.5, color: "#8888aa", textDecoration: "none" }}>Privacy Policy →</Link>
          <Link href="/" style={{ fontSize: 13.5, color: "#8888aa", textDecoration: "none" }}>Back to home</Link>
        </div>
      </main>
    </div>
  );
}
