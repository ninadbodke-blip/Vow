// PrivacyPolicy.jsx
// Drop-in route for Vow (e.g. <Route path="/privacy" element={<PrivacyPolicy />} />)
// Self-contained styling that inherits your app's body font (Inter) while keeping
// Vow's Georgia-italic headings. Restyle freely.
// All fields filled — ready to wire.

import React from "react";

const palette = {
  bg: "#FAF5EE",       // warm cream
  ink: "#3A332E",      // warm near-black
  soft: "#6B6058",     // muted body
  clay: "#B0603F",     // clay accent
  rule: "#E6DBCD",     // hairline
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
  rule: { border: 0, borderTop: `1px solid ${palette.rule}`, margin: "40px 0" },
  foot: { color: palette.soft, fontSize: 14 },
};

export default function PrivacyPolicy() {
  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.kicker}>Vow</div>
        <h1 style={styles.h1}>Privacy Policy</h1>
        <p style={styles.meta}>Last updated: 28 May 2026</p>

        <p style={styles.lede}>
          The information you share with Vow is deeply personal, so this policy is
          written to be read, not skimmed. It explains what we collect, why, where it
          lives, and the control you have over it.
        </p>
        <p style={styles.p}>
          Vow (&ldquo;Vow,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) is a recovery
          companion operated by <span style={styles.strong}>Ninad Arun Bodke</span>,
          trading as Vow Labs, available through the Vow app and at vowapp.in.
        </p>

        <h2 style={styles.h2}>1. Who is responsible for your data</h2>
        <p style={styles.p}>
          Vow is operated by Ninad Arun Bodke, acting as the data fiduciary under
          India&rsquo;s Digital Personal Data Protection Act, 2023. For any privacy
          question or request, reach us at{" "}
          <span style={styles.strong}>support@vowapp.in</span>.
        </p>

        <h2 style={styles.h2}>2. Information we collect</h2>
        <ul style={styles.ul}>
          <li style={styles.li}>
            <span style={styles.strong}>Account information</span> &mdash; your email
            address (for sign-in and account management) and any display name you choose.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>Recovery information you provide</span> &mdash;
            which may include the substance or behaviour you are recovering from, your
            sobriety dates and streaks, your journal entries, your stage in the recovery
            journey, and your interactions with motivational content. This is sensitive
            personal information, and you decide what to share.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>Anchor contacts</span> &mdash; if you add an
            &ldquo;anchor&rdquo; (someone you trust to reach out to), we store the name and
            phone number you enter so you can contact them quickly from within Vow.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>Basic technical information</span> &mdash; limited
            device and app data needed to operate and secure the service.
          </li>
        </ul>
        <p style={styles.p}>
          Please never enter financial account numbers, passwords for other services, or
          government identifiers into Vow &mdash; we do not need them.
        </p>

        <h2 style={styles.h2}>3. How we use your information</h2>
        <ul style={styles.ul}>
          <li style={styles.li}>
            To provide Vow&rsquo;s core features: tracking your progress, storing your
            journal, showing stage-appropriate content, and surfacing motivational material.
          </li>
          <li style={styles.li}>
            To let you contact your anchors. When you choose to reach an anchor, Vow opens
            your own SMS or WhatsApp app with a pre-filled message. <span style={styles.strong}>
            You decide whether to press send.</span> Vow does not send messages for you,
            and we do not pass your anchor&rsquo;s number to any messaging service ourselves
            &mdash; the message travels through your device&rsquo;s own apps, subject to their
            terms and your carrier&rsquo;s usual charges.
          </li>
          <li style={styles.li}>To keep the service secure and reliable.</li>
        </ul>

        <h2 style={styles.h2}>4. Where your information is stored</h2>
        <p style={styles.p}>
          Your data is stored with Supabase, our database and authentication provider, on
          secure cloud infrastructure in the Asia-Pacific (Singapore) region.{" "}
          <span style={styles.strong}>
            Because Singapore is outside India, your personal information is transferred to
            and processed there for the purpose of providing the service.
          </span>{" "}
          Our website is served via Vercel. These providers process data only on our behalf
          and under agreement. Data is encrypted in transit and at rest.
        </p>

        <h2 style={styles.h2}>5. Sharing</h2>
        <p style={styles.p}>
          We do not sell your data and we do not share it for advertising. We rely on the
          service providers above (Supabase, Vercel) purely to run Vow, and we disclose data
          only where the law requires it. Messaging an anchor happens through your own device
          apps, at your initiation, as described in section 3.
        </p>

        <h2 style={styles.h2}>6. A note on anchor contacts</h2>
        <p style={styles.p}>
          When you add an anchor you are entering another person&rsquo;s information. By doing
          so, you confirm you have their permission to store their contact details in Vow for
          this purpose. You can remove an anchor at any time, which deletes their details from
          your account. If an anchor asks to be removed, contact us and we will help.
        </p>

        <h2 style={styles.h2}>7. AI features (planned)</h2>
        <p style={styles.p}>
          Vow intends to offer optional AI-generated reflections in a future version, which
          would process journal content through a third-party AI provider.{" "}
          <span style={styles.strong}>This feature is not active in the current version.</span>{" "}
          We will update this policy and ask for your clear consent before enabling anything
          of the kind.
        </p>

        <h2 style={styles.h2}>8. Your rights</h2>
        <p style={styles.p}>
          Under the Digital Personal Data Protection Act, 2023 you may access the data we hold
          about you, correct it, delete your account and its data, and withdraw consent at any
          time. To exercise any of these &mdash; or to raise a grievance &mdash; write to
          support@vowapp.in and we will respond within a reasonable period.
        </p>

        <h2 style={styles.h2}>9. Retention</h2>
        <p style={styles.p}>
          We keep your data while your account is active. When you delete your account, we
          delete your personal data, except anything we must retain to meet a legal obligation.
        </p>

        <h2 style={styles.h2}>10. Children</h2>
        <p style={styles.p}>Vow is intended for adults (18+) and is not directed at children.</p>

        <h2 style={styles.h2}>11. Changes to this policy</h2>
        <p style={styles.p}>
          As Vow evolves we may update this policy, posting the new version here with a fresh
          date and flagging significant changes.
        </p>

        <hr style={styles.rule} />
        <p style={styles.foot}>
          Ninad Arun Bodke, trading as Vow Labs &middot; support@vowapp.in
        </p>
      </div>
    </main>
  );
}
