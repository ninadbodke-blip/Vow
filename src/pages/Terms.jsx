// Terms.jsx
// Drop-in route for Vow (e.g. <Route path="/terms" element={<Terms />} />)
// Matches PrivacyPolicy.jsx styling. All fields filled — ready to wire.

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
  lede: { fontSize: 17, color: palette.ink, margin: "0 0 8px" },
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
    background: "#F3E7DC",
    border: `1px solid ${palette.rule}`,
    borderRadius: 12,
    padding: "16px 18px",
    margin: "0 0 14px",
    color: palette.ink,
    fontSize: 16,
  },
  rule: { border: 0, borderTop: `1px solid ${palette.rule}`, margin: "40px 0" },
  foot: { color: palette.soft, fontSize: 14 },
};

export default function Terms() {
  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.kicker}>Vow</div>
        <h1 style={styles.h1}>Terms &amp; Conditions</h1>
        <p style={styles.meta}>Last updated: 28 May 2026</p>

        <p style={styles.lede}>
          These terms govern your use of the Vow app and website (vowapp.in), operated by
          Ninad Arun Bodke, trading as Vow Labs. By using Vow, you agree to them.
        </p>

        <h2 style={styles.h2}>1. Eligibility</h2>
        <p style={styles.p}>You must be at least 18 years old to use Vow.</p>

        <h2 style={styles.h2}>2. What Vow is &mdash; and what it isn&rsquo;t</h2>
        <p style={styles.p}>
          Vow is a recovery companion meant to support your personal sobriety journey through
          tracking, journaling, and motivational content. It is{" "}
          <span style={styles.strong}>not a medical device, not a substitute for professional
          medical, psychiatric, or addiction treatment, and not a crisis or emergency service.</span>{" "}
          Nothing in Vow is medical advice. Always seek a qualified professional for medical or
          mental-health needs.
        </p>
        <div style={styles.callout}>
          If you are in crisis or in danger, contact your local emergency services immediately.
          In India, you can also reach Tele-MANAS, the Government of India&rsquo;s free, 24/7
          mental-health helpline, on <span style={styles.strong}>14416</span> (or 1-800-891-4416).
        </div>

        <h2 style={styles.h2}>3. Your account and content</h2>
        <p style={styles.p}>
          You are responsible for the accuracy of what you enter and for keeping your account
          secure. You keep ownership of the content you create in Vow, such as your journal entries.
        </p>

        <h2 style={styles.h2}>4. Anchors</h2>
        <p style={styles.p}>
          If you add an anchor, you confirm you have that person&rsquo;s permission to store their
          contact details in Vow. You are responsible for any messages you choose to send to your
          anchors through your own device apps.
        </p>

        <h2 style={styles.h2}>5. Free tier and Vow Path</h2>
        <p style={styles.p}>
          Vow offers a free tier and a paid subscription, Vow Path. Paid subscriptions are sold and
          billed through Google Play under its terms. Auto-renewal continues until you cancel via your
          Google Play account, and refunds follow Google Play&rsquo;s policies. Current pricing is shown
          in the app before you subscribe.
        </p>

        <h2 style={styles.h2}>6. Acceptable use</h2>
        <p style={styles.p}>
          You agree not to misuse Vow, disrupt it, or use it for any unlawful purpose.
        </p>

        <h2 style={styles.h2}>7. Intellectual property</h2>
        <p style={styles.p}>
          The Vow name, content, and design are ours. You may not copy or redistribute them without
          permission. This does not affect your ownership of your own entries.
        </p>

        <h2 style={styles.h2}>8. Disclaimers and liability</h2>
        <p style={styles.p}>
          Vow is provided &ldquo;as is,&rdquo; without warranties of any kind. To the maximum extent
          permitted by law, we are not liable for indirect or consequential loss arising from your use
          of Vow, and our total liability is limited to the amount you paid us in the preceding twelve
          months. Nothing here limits liability that cannot be limited by law.
        </p>

        <h2 style={styles.h2}>9. Termination</h2>
        <p style={styles.p}>
          You may stop using Vow and delete your account at any time. We may suspend or end access if
          these terms are breached.
        </p>

        <h2 style={styles.h2}>10. Governing law</h2>
        <p style={styles.p}>
          These terms are governed by the laws of India, with disputes subject to the courts of
          Mumbai.
        </p>

        <h2 style={styles.h2}>11. Changes</h2>
        <p style={styles.p}>
          We may update these terms; the current version will always live here with its date.
        </p>

        <hr style={styles.rule} />
        <p style={styles.foot}>
          Ninad Arun Bodke, trading as Vow Labs &middot; support@vowapp.in
        </p>
      </div>
    </main>
  );
}
