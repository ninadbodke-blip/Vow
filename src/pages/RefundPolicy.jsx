// RefundPolicy.jsx
// Public route: <Route path="/refund" element={<RefundPolicy />} />
// Self-contained legal page (linked from the footer, signup, and profile).
// Required for payment-aggregator (BillDesk) and Google Play compliance.
// Consistent with the refund clause in Terms of Service §5. Last updated 15 June 2026.

import React from "react";

const palette = {
  bg: "#FAF5EE",
  ink: "#3A332E",
  soft: "#6B6058",
  clay: "#B0603F",
  rule: "#E6DBCD",
};

const styles = {
  page: {
    background: palette.bg,
    color: palette.ink,
    minHeight: "100vh",
    padding: "clamp(24px, 6vw, 72px) clamp(20px, 6vw, 40px)",
    lineHeight: 1.65,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  wrap: { maxWidth: 720, margin: "0 auto" },
  kicker: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontStyle: "italic",
    color: palette.clay,
    fontSize: 15,
    letterSpacing: "0.02em",
    marginBottom: 6,
  },
  h1: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontStyle: "italic",
    fontWeight: 400,
    fontSize: "clamp(30px, 6vw, 42px)",
    margin: "0 0 4px",
    letterSpacing: "-0.01em",
  },
  meta: { color: palette.soft, fontSize: 14, margin: "0 0 32px" },
  lede: { fontSize: 17, color: palette.ink, margin: "0 0 14px" },
  h2: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontStyle: "italic",
    fontWeight: 400,
    fontSize: 22,
    margin: "36px 0 10px",
  },
  p: { margin: "0 0 14px", color: palette.soft, fontSize: 16 },
  li: { margin: "0 0 10px", color: palette.soft, fontSize: 16 },
  ul: { paddingLeft: 20, margin: "0 0 14px" },
  strong: { color: palette.ink, fontWeight: 600 },
  callout: {
    background: "#F6E9E2",
    border: "1px solid #E3C4B5",
    borderRadius: 12,
    padding: "16px 20px",
    margin: "0 0 16px",
  },
  calloutTitle: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontStyle: "italic",
    fontSize: 19,
    color: palette.clay,
    margin: "0 0 8px",
  },
  link: { color: palette.clay, textDecoration: "underline", textUnderlineOffset: 2 },
  block: {
    color: palette.soft,
    fontSize: 15,
    lineHeight: 1.8,
    margin: "0 0 14px",
    paddingLeft: 14,
    borderLeft: `2px solid ${palette.rule}`,
  },
  rule: { border: 0, borderTop: `1px solid ${palette.rule}`, margin: "40px 0" },
  foot: { color: palette.soft, fontSize: 14 },
};

export default function RefundPolicy() {
  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.kicker}>Vow</div>
        <h1 style={styles.h1}>Refund &amp; Cancellation Policy</h1>
        <p style={styles.meta}>Last updated: 15 June 2026</p>

        <p style={styles.lede}>
          This Refund &amp; Cancellation Policy explains how purchases work on Vow™ — our
          recovery companion, available as a web app, a Progressive Web App, and an Android
          application — together with our website at vowapp.in (the “Service”). It forms part
          of, and should be read with, our{" "}
          <a href="/terms" style={styles.link}>Terms of Service</a> and{" "}
          <a href="/privacy" style={styles.link}>Privacy Policy</a>.
        </p>
        <p style={styles.p}>
          The Service is operated by <span style={styles.strong}>Vow Labs</span>, a
          micro-enterprise registered in India under the Udyam (MSME) framework, based in
          Mumbai, Maharashtra, India.
        </p>

        <h2 style={styles.h2}>1. What you’re purchasing</h2>
        <p style={styles.p}>
          Vow offers a free tier and one or more paid offerings. A paid offering unlocks
          additional guided content and features as a{" "}
          <span style={styles.strong}>one-time purchase granting lifetime access</span> —
          there is no recurring subscription, and nothing renews automatically. The exact
          price, currency, and inclusions are always shown to you before you confirm a
          purchase. Because there is no subscription, there is nothing to cancel after a
          purchase — your access simply remains available to you.
        </p>

        <h2 style={styles.h2}>2. Digital content delivered immediately</h2>
        <div style={styles.callout}>
          <p style={styles.calloutTitle}>Please read before you buy.</p>
          <p style={{ ...styles.p, margin: 0 }}>
            Vow’s paid offering is <span style={styles.strong}>digital content that is made
            available to you immediately after a successful payment.</span> Because access is
            granted right away, purchases are{" "}
            <span style={styles.strong}>generally non-refundable</span>, except in the limited
            circumstances described below or where a refund is required by applicable law. By
            completing a purchase, you acknowledge that access begins at once.
          </p>
        </div>

        <h2 style={styles.h2}>3. When we will consider a refund</h2>
        <p style={styles.p}>
          We want the Service to work for you. We will review a refund request in good faith
          in situations such as:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>
            <span style={styles.strong}>Technical failure.</span> You paid but were not given
            access to what you purchased, and we are unable to resolve it for you within a
            reasonable time.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>Duplicate or accidental charge.</span> You were
            charged more than once for the same purchase, or charged in error.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>Where the law requires it.</span> Any refund or
            cancellation right you have under applicable law — including India’s
            consumer-protection laws — always applies, regardless of anything else in this
            policy.
          </li>
        </ul>
        <p style={styles.p}>
          Outside these situations, and because the content is delivered immediately,
          purchases are not ordinarily refundable. We may still choose to offer a refund or
          credit at our discretion as a gesture of goodwill.
        </p>

        <h2 style={styles.h2}>4. How purchases are processed</h2>
        <p style={styles.p}>
          Purchases made through the <span style={styles.strong}>Android app</span> are
          handled by Google Play and are also subject to{" "}
          <a
            href="https://support.google.com/googleplay/answer/2479637"
            style={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Play’s refund policy and process
          </a>
          . For Google Play purchases, you may need to request a refund through Google Play
          directly, and Google’s timelines and rules will apply. Purchases made on the{" "}
          <span style={styles.strong}>web</span> are processed by our payment partners; we do
          not receive or store your full card or payment details.
        </p>

        <h2 style={styles.h2}>5. How to request a refund</h2>
        <p style={styles.p}>
          For web purchases, or for any refund question, email us at{" "}
          <a href="mailto:support@vowapp.in" style={styles.link}>support@vowapp.in</a> with
          the email address used for your account and, if you have it, your order or payment
          reference. Please reach out within a reasonable time of the purchase so we can look
          into it. For Android-app purchases, please use Google Play’s refund process; if you
          have trouble, contact us and we’ll help where we can.
        </p>

        <h2 style={styles.h2}>6. How approved refunds are issued</h2>
        <p style={styles.p}>
          Where we approve a refund, it is issued to the original payment method through the
          relevant payment provider (Google Play or our web payment partner). Once we or the
          provider initiate it, the time for the amount to reach you depends on the provider
          and your bank — typically within a few business days, though it can take longer.
          Any applicable taxes are handled in line with the provider’s process and applicable
          law.
        </p>

        <h2 style={styles.h2}>7. Free tier</h2>
        <p style={styles.p}>
          Vow’s free tier involves no payment, so no refund or cancellation applies to it.
          You can stop using the Service, and delete your account, at any time.
        </p>

        <h2 style={styles.h2}>8. Changes to this policy</h2>
        <p style={styles.p}>
          We may update this policy from time to time. When we make material changes, we will
          update the date above and, where appropriate, notify you through the Service.
          Changes take effect when posted, and the version in effect at the time of your
          purchase applies to that purchase.
        </p>

        <h2 style={styles.h2}>9. Contact us</h2>
        <p style={styles.block}>
          <span style={styles.strong}>Vow Labs</span> (Udyam-registered MSME)<br />
          Mumbai, Maharashtra, India<br />
          Support: support@vowapp.in<br />
          General enquiries: hello@vowapp.in
        </p>

        <hr style={styles.rule} />
        <p style={styles.foot}>
          Vow™ is a trademark of Vow Labs (application filed). Vow Labs, proprietor Ninad
          Arun Bodke · support@vowapp.in
        </p>
      </div>
    </main>
  );
}