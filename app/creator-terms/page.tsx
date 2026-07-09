import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator Program Terms — RentOut",
  description: "The full terms of the RentOut Creator referral-commission program: how you earn, when you're paid, taxes, and your responsibilities.",
};

// NOTE FOR MAINTAINER: before public launch, replace the two bracketed placeholders below —
//   [LEGAL_ENTITY] with your registered company name + address, and confirm the TDS rate
//   in §3.5 with your CA. Everything else is launch-ready.
const ENTITY = "RentOut";
const SUPPORT = "support@getrentout.me";
const EFFECTIVE = "8 July 2026";

const Section = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: 34 }}>
    <h2 style={{ fontSize: 17, fontWeight: 800, color: "#f0f0fa", marginBottom: 12, letterSpacing: "-0.01em" }}>
      <span style={{ color: "#9B6DFF", marginRight: 8 }}>{n}</span>{title}
    </h2>
    <div style={{ fontSize: 14.5, lineHeight: 1.75, color: "#a8a8c8" }}>{children}</div>
  </section>
);

const Li = ({ children }: { children: React.ReactNode }) => (
  <li style={{ marginBottom: 8, listStyle: "none", display: "flex", gap: 10 }}>
    <span style={{ color: "#9B6DFF", flexShrink: 0 }}>—</span><span>{children}</span>
  </li>
);

export default function CreatorTerms() {
  return (
    <div style={{ background: "#07070a", minHeight: "100vh", color: "#f0f0fa", fontFamily: "Inter, sans-serif" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 99, background: "rgba(7,7,10,0.85)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "0 28px", height: 58, display: "flex", alignItems: "center", backdropFilter: "blur(16px)" }}>
        <a href="https://getrentout.me" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, overflow: "hidden", background: "linear-gradient(135deg, #1a1228, #120d1e)", border: "1px solid rgba(155,109,255,0.25)" }}>
            <Image src="/logo.png" alt="RentOut" width={32} height={32} style={{ borderRadius: 8 }} />
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.03em", color: "#f0f0fa" }}>RentOut</span>
        </a>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 90px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", color: "#9B6DFF", textTransform: "uppercase", marginBottom: 12 }}>Creator Program</p>
        <h1 style={{ fontSize: "clamp(30px,6vw,42px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 10 }}>Program Terms</h1>
        <p style={{ fontSize: 13.5, color: "#7070a0", marginBottom: 8 }}>Effective {EFFECTIVE} · These terms form an agreement between you (&ldquo;Creator&rdquo;) and {ENTITY}.</p>
        <p style={{ fontSize: 13.5, color: "#7070a0", marginBottom: 40 }}>The RentOut Creator Program is <strong style={{ color: "#c0c0e0" }}>invite-only</strong>. By sharing your referral link, you accept these terms.</p>

        <Section n="1." title="Eligibility">
          <ul style={{ padding: 0, margin: 0 }}>
            <Li>You must be at least 18 and of the age of majority in your country, and joining on your own behalf.</Li>
            <Li>Participation is by invitation only. {ENTITY} may approve or remove any Creator at its discretion.</Li>
            <Li>The program is open in most countries where our payout partner operates. It is <strong style={{ color: "#c0c0e0" }}>not available where prohibited by law</strong>, and you may not participate if you are located in, or a resident of, a country or region subject to applicable sanctions, or if you are on any restricted-persons list.</Li>
          </ul>
        </Section>

        <Section n="2." title="How you earn">
          <ul style={{ padding: 0, margin: 0 }}>
            <Li>You earn a commission of <strong style={{ color: "#c0c0e0" }}>5% of the service price</strong> a person you referred pays for a booking — calculated on the pre-tax service price the customer pays, <em>excluding</em> platform fees, taxes, tips, and any surcharges.</Li>
            <Li>Commission is earned <strong style={{ color: "#c0c0e0" }}>only on bookings that are completed and paid in full</strong>. Sign-ups alone earn nothing.</Li>
            <Li>A person counts as &ldquo;your referral&rdquo; only if they sign up using your referral link or code and provide a valid phone/WhatsApp number, and they were not already a RentOut user.</Li>
            <Li>You keep earning from each referred user for <strong style={{ color: "#c0c0e0" }}>3 months from their first booking</strong>. After that, their bookings no longer earn commission.</Li>
            <Li>Referrals only apply within RentOut&rsquo;s first <strong style={{ color: "#c0c0e0" }}>100,000 early-access sign-ups</strong>. Once that cap is reached, new sign-ups no longer earn referral commission.</Li>
          </ul>
        </Section>

        <Section n="3." title="When and how you're paid">
          <ul style={{ padding: 0, margin: 0 }}>
            <Li><strong style={{ color: "#c0c0e0" }}>Pending → Confirmed.</strong> Each commission stays &ldquo;pending&rdquo; for 14 days after the booking completes, to allow for refunds, cancellations, or disputes. After that it becomes &ldquo;confirmed&rdquo; and payable.</Li>
            <Li><strong style={{ color: "#c0c0e0" }}>Payout schedule & method.</strong> Confirmed earnings are paid <strong style={{ color: "#c0c0e0" }}>once a month, by the 10th</strong>, for the previous month, provided your confirmed balance is at least <strong style={{ color: "#c0c0e0" }}>US$10</strong> (or local equivalent). Balances below the minimum roll over. Payouts are made via <strong style={{ color: "#c0c0e0" }}>PayPal</strong> (and, for Creators in India, UPI as an option).</Li>
            <Li><strong style={{ color: "#c0c0e0" }}>Currency & fees.</strong> Commission is tracked and paid in <strong style={{ color: "#c0c0e0" }}>US dollars</strong>. Currency-conversion and payment-processor fees may apply and are your responsibility.</Li>
            <Li><strong style={{ color: "#c0c0e0" }}>Verification.</strong> Before your first payout you must complete identity verification (KYC) and provide an accurate payout account. You are responsible for the accuracy of your payout details; {ENTITY} is not liable for payments sent to details you provided incorrectly.</Li>
            <Li><strong style={{ color: "#c0c0e0" }}>Taxes.</strong> You are responsible for all taxes on your earnings in your own country. Where the law requires, {ENTITY} will withhold and/or report tax and collect the tax information it must from you — for example, TDS and PAN in India, or W-8/W-9 forms in the United States. Commission amounts shown are before applicable taxes.</Li>
          </ul>
        </Section>

        <Section n="4." title="Your responsibilities">
          <ul style={{ padding: 0, margin: 0 }}>
            <Li><strong style={{ color: "#c0c0e0" }}>Genuine referrals only.</strong> Refer real people who choose to join. No spam, no bots, no purchased sign-ups, no misleading or false claims about RentOut, its earnings, or its services.</Li>
            <Li><strong style={{ color: "#c0c0e0" }}>Disclose your commission.</strong> When you promote RentOut, you must clearly disclose that you earn a commission (for example, &ldquo;#ad&rdquo; or &ldquo;I earn a commission&rdquo;), as required by the advertising and consumer-protection rules that apply to you — such as the FTC (US), ASCI (India), or ASA (UK).</Li>
            <Li><strong style={{ color: "#c0c0e0" }}>No self-referral.</strong> You may not refer yourself or accounts you control. This is checked using phone, payment, and identity signals.</Li>
            <Li><strong style={{ color: "#c0c0e0" }}>Respect privacy & the law.</strong> Only share a person&rsquo;s details through the referral flow with their knowledge, and comply with the data-protection and anti-spam laws that apply to you (such as GDPR, DPDP, CCPA, CAN-SPAM). Do not collect or misuse others&rsquo; personal data.</Li>
          </ul>
        </Section>

        <Section n="5." title="No guaranteed earnings">
          <p>Your earnings depend entirely on real, completed bookings made by people you refer. {ENTITY} does <strong style={{ color: "#c0c0e0" }}>not guarantee any income</strong> and makes no promise about how much, if anything, you will earn. This program is not employment and does not create an employment, agency, partnership, or franchise relationship — you participate as an independent individual.</p>
        </Section>

        <Section n="6." title="Fraud, reversal & set-off">
          <ul style={{ padding: 0, margin: 0 }}>
            <Li>If a booking is refunded, cancelled, or disputed, the related commission is reversed. If it was already paid, {ENTITY} may deduct (set off) that amount from your future payouts.</Li>
            <Li>Fraud, fake sign-ups, self-referral, or breach of these terms may result in <strong style={{ color: "#c0c0e0" }}>forfeiture of all pending and unpaid earnings</strong> and removal from the program.</Li>
            <Li>{ENTITY} may withhold payouts while investigating suspected abuse. {ENTITY}&rsquo;s determination of whether a referral or booking is valid is final.</Li>
          </ul>
        </Section>

        <Section n="7." title="Changes & ending the program">
          <ul style={{ padding: 0, margin: 0 }}>
            <Li>{ENTITY} may change the commission rate or these terms with <strong style={{ color: "#c0c0e0" }}>30 days&rsquo; notice</strong>. Commission already confirmed under the prior terms will be honoured.</Li>
            <Li>Either you or {ENTITY} may end your participation at any time. On ending, confirmed earnings that are not subject to reversal or investigation remain payable.</Li>
          </ul>
        </Section>

        <Section n="8." title="Governing law & contact">
          <p style={{ marginBottom: 12 }}>These terms are governed by the laws of India, and disputes are subject to the courts at New Delhi — without limiting any mandatory consumer-protection rights you have under the laws of your own country.</p>
          <p style={{ marginBottom: 12 }}>These program terms apply alongside our <a href="/terms" style={{ color: "#b090ff", fontWeight: 600 }}>Terms of Service</a> and <a href="/privacy" style={{ color: "#b090ff", fontWeight: 600 }}>Privacy Policy</a>. If they conflict on a Creator Program matter, these program terms prevail.</p>
          <p>Questions about the program or your earnings? Contact us at <a href={`mailto:${SUPPORT}`} style={{ color: "#b090ff", fontWeight: 600 }}>{SUPPORT}</a> — we reply within 2 business days. This program is operated by {ENTITY}.</p>
        </Section>

        <div style={{ marginTop: 20, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <a href="https://getrentout.me" style={{ fontSize: 14, fontWeight: 700, color: "#8888aa", textDecoration: "none" }}>← Back to RentOut</a>
          <p style={{ fontSize: 12, color: "#555577", margin: 0 }}>Version 1.0 · Last updated {EFFECTIVE}</p>
        </div>
      </div>
    </div>
  );
}
