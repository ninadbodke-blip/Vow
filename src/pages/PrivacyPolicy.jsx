// PrivacyPolicy.jsx
// Public route: <Route path="/privacy" element={<PrivacyPolicy />} />
// Self-contained legal page (also linked from signup, profile, and the footer).
// Mirrors the canonical Privacy Policy doc. Last updated 3 June 2026.

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
  note: {
    background: "#F3E7DD",
    border: `1px solid ${palette.rule}`,
    borderRadius: 10,
    padding: "12px 16px",
    margin: "0 0 14px",
    color: palette.ink,
    fontSize: 15,
  },
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

export default function PrivacyPolicy() {
  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.kicker}>Vow</div>
        <h1 style={styles.h1}>Privacy Policy</h1>
        <p style={styles.meta}>Last updated: 3 June 2026</p>

        <p style={styles.lede}>
          This Privacy Policy explains how Vow Labs (“Vow Labs,” “we,” “us,” or “our”)
          collects, uses, shares, and protects your information when you use Vow™ — our
          sobriety and recovery companion, available as a web app, a Progressive Web App,
          and an Android application — together with our website at vowapp.in and any
          related services (the “Service”).
        </p>
        <p style={styles.p}>
          Vow Labs is a micro-enterprise registered in India under the Udyam (MSME)
          framework, based in Mumbai, Maharashtra, India, and operated by its proprietor,{" "}
          <span style={styles.strong}>Ninad Arun Bodke</span>. For the purposes of India’s
          Digital Personal Data Protection Act, 2023 (the “DPDP Act”), Vow Labs is the
          Data Fiduciary and you are the Data Principal. For users in the EEA or UK, Vow
          Labs is the data controller under the GDPR / UK GDPR.
        </p>
        <p style={styles.p}>
          Please read this Policy together with our Terms of Service. By creating an
          account or using the Service, you agree to the collection and use of information
          as described here. If you do not agree, please do not use the Service.
        </p>

        <h2 style={styles.h2}>1. A note about sensitive information</h2>
        <p style={styles.p}>
          Vow is a recovery tool, so some of what you choose to record relates to your
          health and wellbeing. Under the DPDP Act and the GDPR this is treated as
          sensitive personal data and deserves extra care. Three things up front:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>
            <span style={styles.strong}>We do not sell your personal data</span> — not to
            advertisers, data brokers, or anyone.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>We do not show third-party advertising</span> in
            Vow, and we do not use advertising identifiers.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>You control what you write</span> — you decide what
            to record, and you can edit or delete your entries and your account.
          </li>
        </ul>

        <h2 style={styles.h2}>2. Information we collect</h2>
        <p style={styles.p}>
          <span style={styles.strong}>Information you give us:</span>
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>
            <span style={styles.strong}>Account and identity</span> — your email address,
            an optional display name, and authentication details. If you choose a
            third-party sign-in option, that provider shares basic profile information
            (such as your name and email) per the permissions you grant.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>Recovery profile</span> — the substance or
            behaviour you are addressing, the dates you track, your current stage, and
            goals you set.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>Your entries and activity</span> — journal
            entries, check-ins, reflections, logged urges and slips, replacement-activity
            choices, lifestyle “balance” inputs, the supports you record, milestones, and
            similar content (your “Recovery Data”).
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>Anchors information</span> — if you invite a
            supporter, the information you provide (for example, a name and a way to reach
            them, such as a phone number or a shareable invite link) and any reactions or
            messages they send you.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>Purchases</span> — handled by the relevant app
            store (for the Android app) or our payment processor (for web purchases). We do
            not receive or store your full card or bank details.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>Communications</span> — emails you send us and our
            replies.
          </li>
        </ul>
        <p style={styles.p}>
          <span style={styles.strong}>Information collected automatically:</span> device
          and technical data (device model, OS and app version, language, approximate
          region from IP, diagnostic and crash logs), usage data (features used and when),
          and on-device storage needed for the app to work. We do not use advertising
          trackers; if we adopt privacy-respecting analytics later, we will update this
          Policy.
        </p>
        <div style={styles.note}>
          <span style={styles.strong}>Please do not enter</span> financial account numbers,
          payment-card details, passwords for other services, or government identifiers
          into the Service — we do not need them and do not ask for them.
        </div>

        <h2 style={styles.h2}>3. How we use your information</h2>
        <ul style={styles.ul}>
          <li style={styles.li}>To create and maintain your account and provide the Service.</li>
          <li style={styles.li}>
            To store and display your Recovery Data back to you, and power features such as
            stage guidance, check-ins, the replacement-activity engine, and Anchors.
          </li>
          <li style={styles.li}>To personalise your experience based on your stage and what you record.</li>
          <li style={styles.li}>To process purchases and manage access to paid features.</li>
          <li style={styles.li}>To respond to your messages and provide support.</li>
          <li style={styles.li}>To keep the Service secure, prevent abuse, and troubleshoot.</li>
          <li style={styles.li}>To improve the Service and develop new features.</li>
          <li style={styles.li}>To comply with legal obligations and enforce our Terms.</li>
        </ul>

        <h2 style={styles.h2}>4. Legal bases for processing</h2>
        <ul style={styles.ul}>
          <li style={styles.li}>
            <span style={styles.strong}>Consent</span> — for your sensitive Recovery Data
            and, where required, other processing. You may withdraw consent at any time;
            this does not affect processing before withdrawal, and may limit the Service.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>Performance of a contract</span> — to provide the
            Service you signed up for.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>Legitimate interests</span> — to secure, maintain,
            and improve the Service, balanced against your rights.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>Legal obligation</span> — to comply with applicable law.
          </li>
        </ul>

        <h2 style={styles.h2}>5. AI-assisted features</h2>
        <p style={styles.p}>
          We are developing optional features that use artificial intelligence to summarise
          or reflect back patterns in your entries (for example, weekly reflections). Where
          offered, only the information needed for that insight is processed, by a trusted
          AI service provider under data-protection terms, and is not used to build
          advertising profiles. The output is supportive reflection —{" "}
          <span style={styles.strong}>not medical advice</span> and not an automated
          decision with legal or similarly significant effects. We will make their
          operation clear in the app when they launch.
        </p>

        <h2 style={styles.h2}>6. How we share information</h2>
        <p style={styles.p}>
          We share information only as described below. <span style={styles.strong}>We do
          not sell your personal data.</span> We use trusted third-party providers
          (sub-processors) to operate the Service, including:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>cloud database, authentication, hosting, and infrastructure providers, which store your account and Recovery Data;</li>
          <li style={styles.li}>payment processors, which handle purchases (we do not receive or store your full card or bank details);</li>
          <li style={styles.li}>app-distribution and in-app billing platforms, for the Android app; and</li>
          <li style={styles.li}>an AI service provider that powers AI-assisted reflection features, where you use them.</li>
        </ul>
        <p style={styles.p}>
          These providers process information only on our behalf and under appropriate
          data-protection terms.
        </p>
        <p style={styles.p}>
          We also share information at your direction (for example, the Anchors feature),
          where required by law or to protect rights and safety, and in connection with a
          business transfer. We may use aggregated or de-identified information that does
          not identify you without restriction.
        </p>

        <h2 style={styles.h2}>7. The Anchors feature</h2>
        <ul style={styles.ul}>
          <li style={styles.li}>An Anchor does not get your journal, full history, or detailed progress.</li>
          <li style={styles.li}>
            You provide an Anchor’s contact information yourself, and confirm you have a
            lawful basis to share it and that the person is comfortable being contacted.
          </li>
          <li style={styles.li}>Anchors can send you reactions or short messages of support, which we deliver to you.</li>
          <li style={styles.li}>
            If Vow helps you reach an Anchor directly, it does so by opening your own
            device’s messaging app (such as SMS or WhatsApp) with a message you can choose
            whether to send. Vow does not send messages on your behalf; any such message
            travels through your device’s own apps, subject to their terms and your
            carrier’s charges.
          </li>
          <li style={styles.li}>
            If you remove an Anchor, we stop using their information for that purpose,
            subject to our normal retention and backup cycles.
          </li>
        </ul>

        <h2 style={styles.h2}>8. International data transfers</h2>
        <p style={styles.p}>
          Vow Labs is based in India, but your account and Recovery Data are stored on
          cloud infrastructure located in the Asia-Pacific{" "}
          (<span style={styles.strong}>Singapore</span>) region. Because Singapore is
          outside India, your personal data is transferred to and processed there to
          provide the Service. Some providers may process limited data in other countries,
          where data-protection laws may differ. Where required by law, we take steps to
          ensure appropriate safeguards are in place for such transfers.
        </p>

        <h2 style={styles.h2}>9. Data retention</h2>
        <p style={styles.p}>
          We keep your personal data for as long as your account is active or as needed to
          provide the Service. When you delete your account, or when we no longer need your
          data, we delete or anonymise it within a reasonable period, except where we must
          retain certain records to comply with law, resolve disputes, or enforce our
          agreements. Residual copies may persist briefly in routine backups before being
          overwritten.
        </p>

        <h2 style={styles.h2}>10. How we protect your information</h2>
        <p style={styles.p}>
          We use technical and organisational measures designed to protect your information
          — including encryption in transit, access controls, and authentication
          safeguards. No method of transmission or storage is perfectly secure, so we
          cannot guarantee absolute security. Please keep your login credentials
          confidential and contact us promptly if you believe your account has been
          compromised.
        </p>

        <h2 style={styles.h2}>11. Your rights and choices</h2>
        <p style={styles.p}>
          <span style={styles.strong}>Under India’s DPDP Act,</span> you may obtain a
          summary of the data we process and the processing activities; request correction,
          completion, updating, or erasure; nominate another individual to exercise your
          rights in the event of death or incapacity; withdraw consent; and raise a
          grievance with us (Section 12).
        </p>
        <p style={styles.p}>
          <span style={styles.strong}>Under the GDPR / UK GDPR,</span> you may access,
          rectify, or erase your data; restrict or object to certain processing; request
          portability; withdraw consent; and lodge a complaint with your local supervisory
          authority.
        </p>
        <p style={styles.p}>
          <span style={styles.strong}>To exercise your rights,</span> you can edit much of
          your information in the app and delete your account from within the app, or email
          us at support@vowapp.in. We may need to verify your identity, and we respond
          within the timeframes required by law. You can also opt out of non-essential
          emails at any time; we may still send essential account messages.
        </p>

        <h2 style={styles.h2}>12. Grievance redressal (India)</h2>
        <p style={styles.p}>
          If you have a concern about how we handle your personal data, you may contact our
          Grievance Officer, designated under the DPDP Act and applicable IT rules:
        </p>
        <p style={styles.block}>
          <span style={styles.strong}>Grievance Officer:</span> Ninad Arun Bodke<br />
          Vow Labs, Mumbai, Maharashtra, India<br />
          Email: support@vowapp.in
        </p>
        <p style={styles.p}>
          We will acknowledge and address grievances within the timeframes required by law.
          If you are not satisfied with our response, you may have the right to approach the
          Data Protection Board of India or another competent authority.
        </p>

        <h2 style={styles.h2}>13. Children</h2>
        <p style={styles.p}>
          Vow is intended for adults and is not directed to anyone under the age of 18. We
          do not knowingly collect personal data from minors. If you are under 18, please
          do not use the Service. If we learn we have collected a minor’s data without
          appropriate consent, we will take steps to delete it.
        </p>

        <h2 style={styles.h2}>14. Cookies and local storage</h2>
        <p style={styles.p}>
          On the web, we use only the cookies and local storage necessary for the Service
          to function and to keep you signed in. We do not use advertising cookies. You can
          control or clear these through your browser or device settings, though doing so
          may affect how the Service works.
        </p>

        <h2 style={styles.h2}>15. Changes to this Policy</h2>
        <p style={styles.p}>
          We may update this Policy from time to time. When we make material changes, we
          will update the date above and, where appropriate, notify you through the Service.
          Your continued use after the changes take effect indicates acceptance.
        </p>

        <h2 style={styles.h2}>16. Contact us</h2>
        <p style={styles.block}>
          <span style={styles.strong}>Vow Labs</span> (Udyam-registered MSME)<br />
          Mumbai, Maharashtra, India<br />
          Privacy and data requests: support@vowapp.in<br />
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