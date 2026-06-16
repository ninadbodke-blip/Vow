// Terms.jsx
// Public route: <Route path="/terms" element={<Terms />} />
// Self-contained legal page (also linked from signup, profile, and the footer).
// Mirrors the canonical Terms of Service doc. Last updated 3 June 2026.

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

export default function Terms() {
  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.kicker}>Vow</div>
        <h1 style={styles.h1}>Terms of Service</h1>
        <p style={styles.meta}>Last updated: 15 June 2026</p>

        <p style={styles.lede}>
          These Terms of Service (“Terms”) govern your access to and use of Vow™ — our
          sobriety and recovery companion, available as a web app, a Progressive Web App,
          and an Android application — together with our website at vowapp.in and any
          related services (the “Service”).
        </p>
        <p style={styles.p}>
          The Service is operated by <span style={styles.strong}>Vow Labs</span>, a
          micro-enterprise registered in India under the Udyam (MSME) framework, based in
          Mumbai, Maharashtra, India, and operated by its proprietor, Ninad Arun Bodke.
          These Terms, with our Privacy Policy, form a legal agreement between you and Vow
          Labs. <span style={styles.strong}>By creating an account or using the Service,
          you confirm that you have read and agree to these Terms, that you meet the
          eligibility requirements below, and that you have the legal capacity to enter
          into this agreement.</span> If you do not agree, please do not use the Service.
        </p>

        <h2 style={styles.h2}>1. Please read first — Vow is not medical care</h2>
        <div style={styles.callout}>
          <p style={styles.calloutTitle}>This is the most important section.</p>
          <p style={{ ...styles.p, margin: "0 0 10px" }}>
            Vow is a self-guided wellbeing and recovery support tool. It is{" "}
            <span style={styles.strong}>not a medical device, and it does not provide
            medical, clinical, psychiatric, or psychological advice, diagnosis, or
            treatment.</span> Content and features are for general informational and
            supportive purposes only, and using Vow does not create any
            professional–client relationship.
          </p>
          <p style={{ ...styles.p, margin: "0 0 10px" }}>
            Vow is <span style={styles.strong}>not a substitute</span> for professional
            advice. Always seek a qualified professional for questions about your health.{" "}
            <span style={styles.strong}>Do not disregard, avoid, or delay seeking
            professional advice because of anything in the Service.</span>
          </p>
          <p style={{ ...styles.p, margin: "0 0 10px" }}>
            <span style={styles.strong}>Withdrawal from certain substances — including
            alcohol and benzodiazepines — can be medically dangerous and may require
            professional supervision.</span> If you are considering stopping or reducing
            such substances, please consult a qualified medical professional first.
          </p>
          <p style={{ ...styles.p, margin: 0 }}>
            <span style={styles.strong}>Vow is not for emergencies.</span> If you are in
            crisis, thinking about harming yourself, or may be experiencing a medical
            emergency, contact your local emergency services immediately, or a crisis
            helpline such as{" "}
            <a href="tel:+919820466726" style={styles.link}>AASRA (+91 98204 66726)</a> or{" "}
            <a href="tel:+919152987821" style={styles.link}>iCall (+91 91529 87821)</a> in
            India, or the appropriate service in your country.
          </p>
        </div>
        <p style={styles.p}>
          You are responsible for your own decisions and actions. Vow Labs does not warrant
          or guarantee any particular outcome, recovery, or result.
        </p>

        <h2 style={styles.h2}>2. Who can use Vow</h2>
        <p style={styles.p}>
          You must be <span style={styles.strong}>at least 18 years old</span> (or the age
          of majority where you live, if higher) and legally able to enter into a contract.
          The Service is not intended for, and may not be used by, anyone under 18.
        </p>

        <h2 style={styles.h2}>3. What Vow provides</h2>
        <p style={styles.p}>
          Vow offers a structured, stage-based recovery journey with a free tier and one or
          more paid offerings. Features may include daily check-ins, journaling, a
          replacement-activity engine, progress tracking, the Anchors support feature, and
          guided content. We may add, change, or remove features over time and do not
          guarantee that any particular feature will always be available.
        </p>

        <h2 style={styles.h2}>4. Your account</h2>
        <p style={styles.p}>
          You are responsible for activity under your account and for keeping your login
          credentials confidential. Please provide accurate information, keep it current,
          and notify us at support@vowapp.in if you believe your account has been accessed
          without authorisation. Do not share your account or create one by automated means
          or under false pretences.
        </p>

        <h2 style={styles.h2}>5. Purchases, paid features, and refunds</h2>
        <ul style={styles.ul}>
          <li style={styles.li}>
            <span style={styles.strong}>Paid offerings.</span> Certain features may require
            a purchase; the price, currency, and inclusions are shown before you buy.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>How purchases are processed.</span> Android-app
            purchases are handled by Google Play and subject to its terms. Web purchases are
            processed by our payment partners: <span style={styles.strong}>Razorpay</span>{" "}
            for customers in India, and <span style={styles.strong}>PayPal</span> for
            customers outside India. We do not receive or store your full payment details.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>Refunds.</span> Because the Service provides digital
            content made available promptly after purchase, purchases are generally
            non-refundable, except where required by applicable law (including India’s
            consumer-protection laws) or where we choose to provide a refund. Google Play
            purchases are also subject to Google Play’s refund process. Contact
            support@vowapp.in for refund questions.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>Pricing changes.</span> We may change prices; a
            change will not affect access you have already purchased on a one-time, lifetime
            basis. Prices may be exclusive of applicable taxes.
          </li>
        </ul>

        <h2 style={styles.h2}>6. Your content</h2>
        <p style={styles.p}>
          You own the content you create in the Service — your journal entries, reflections,
          and logs (“Your Content”). We do not claim ownership. To operate the Service for
          you, you grant Vow Labs a limited, worldwide, non-exclusive, royalty-free licence
          to host, store, process, back up, and display Your Content to you and as needed to
          provide and maintain the Service (including AI-assisted features, where you use
          them). This licence exists only to run the Service; we do not publish Your Content
          publicly or use it for advertising, and it ends when you delete Your Content or
          account, subject to normal backup cycles. You are responsible for Your Content and
          confirm you have the right to provide it.
        </p>

        <h2 style={styles.h2}>7. Anchors</h2>
        <p style={styles.p}>
          If you use the Anchors feature, you confirm you have a lawful basis and any
          necessary permission to share an Anchor’s contact information with us, and that the
          person is comfortable being contacted through the Service. Anchors do not receive
          your journal or detailed history; they can send you supportive reactions or
          messages. We handle Anchors’ information as described in our Privacy Policy.
        </p>

        <h2 style={styles.h2}>8. Acceptable use</h2>
        <p style={styles.p}>You agree to use the Service lawfully and only for its intended purpose. You agree not to:</p>
        <ul style={styles.ul}>
          <li style={styles.li}>damage, disable, overburden, or impair the Service, or interfere with anyone else’s use;</li>
          <li style={styles.li}>attempt to gain unauthorised access to the Service, other users’ accounts, or our systems;</li>
          <li style={styles.li}>copy, modify, reverse engineer, decompile, or attempt to extract the source code, except where this restriction is prohibited by law;</li>
          <li style={styles.li}>use any bot, scraper, or automated means to access or collect data from the Service;</li>
          <li style={styles.li}>rent, lease, sell, sublicense, or otherwise make the Service available to a third party; or</li>
          <li style={styles.li}>use the Service to violate any law or the rights of others.</li>
        </ul>

        <h2 style={styles.h2}>9. Intellectual property</h2>
        <p style={styles.p}>
          The Service — including the Vow name and the Vow™ mark, the flame logo, the
          software, design, and other materials we provide (excluding Your Content) — is
          owned by Vow Labs or our licensors and protected by intellectual-property laws.{" "}
          <span style={styles.strong}>Vow™ is a trademark of Vow Labs; a trademark
          application has been filed in India.</span> We grant you a limited, personal,
          non-exclusive, non-transferable, revocable licence to use the Service for your own
          personal, non-commercial recovery journey, subject to these Terms. We reserve all
          rights not expressly granted.
        </p>

        <h2 style={styles.h2}>10. Third-party services and links</h2>
        <p style={styles.p}>
          The Service relies on third-party providers (such as those in our Privacy Policy)
          and may link to third-party websites or services. We do not control and are not
          responsible for them. Your use of any third-party service is at your own risk and
          subject to that third party’s terms.
        </p>

        <h2 style={styles.h2}>11. Updates and availability</h2>
        <p style={styles.p}>
          We may provide updates that add, change, or remove features, and updates may
          install automatically depending on your device settings. We may also modify,
          suspend, or discontinue the Service at any time, and are not obligated to keep any
          feature available, except as required by law.
        </p>

        <h2 style={styles.h2}>12. Disclaimers</h2>
        <p style={styles.p}>
          To the maximum extent permitted by law, and without limiting Section 1, the
          Service is provided <span style={styles.strong}>“as is” and “as available,”
          without warranties of any kind</span>, whether express or implied, including
          implied warranties of merchantability, fitness for a particular purpose, title,
          and non-infringement. We do not warrant that the Service will meet your
          requirements, be uninterrupted, secure, or error-free, or that content is
          accurate, complete, or current. Some jurisdictions do not allow certain
          exclusions, so some may not apply to you.
        </p>

        <h2 style={styles.h2}>13. Limitation of liability</h2>
        <p style={styles.p}>
          To the maximum extent permitted by applicable law, Vow Labs will not be liable for
          any indirect, incidental, special, consequential, or punitive damages, or for loss
          of data, goodwill, or profits, arising out of or relating to your use of (or
          inability to use) the Service. To the maximum extent permitted by law, Vow Labs’
          total liability for all claims relating to the Service will not exceed the greater
          of (a) the total amount you paid us for the Service in the twelve (12) months
          before the event giving rise to the liability, or (b) ₹5,000. Nothing in these
          Terms excludes liability that cannot be excluded under applicable law, including
          under India’s consumer-protection laws.
        </p>

        <h2 style={styles.h2}>14. Indemnification</h2>
        <p style={styles.p}>
          To the extent permitted by law, you agree to indemnify and hold harmless Vow Labs
          and its proprietor, contractors, and service providers from any claims,
          liabilities, damages, losses, and reasonable expenses (including legal fees)
          arising out of your misuse of the Service, Your Content, or your breach of these
          Terms or of any law or third-party right.
        </p>

        <h2 style={styles.h2}>15. Suspension and termination</h2>
        <p style={styles.p}>
          You may stop using the Service and delete your account at any time. We may suspend
          or terminate your access if you breach these Terms, if required by law, or if we
          discontinue the Service. On termination, your right to use the Service ends.
          Sections that by their nature should survive (including Sections 1, 6, 9, 12, 13,
          14, and 16) will survive.
        </p>

        <h2 style={styles.h2}>16. Governing law and disputes</h2>
        <p style={styles.p}>
          These Terms are governed by the laws of India, without regard to conflict-of-laws
          principles. Subject to any non-waivable rights you have under applicable
          consumer-protection law (which may let you bring proceedings where you live), you
          agree that the <span style={styles.strong}>courts at Mumbai, Maharashtra, India</span>{" "}
          will have exclusive jurisdiction over any dispute relating to these Terms or the
          Service.
        </p>

        <h2 style={styles.h2}>17. App store terms</h2>
        <p style={styles.p}>
          If you obtain the Vow app through a distribution platform (such as Google Play),
          your use is also subject to that platform’s terms. If we make Vow available through
          the Apple App Store in future, the additional terms Apple requires will apply, and
          Apple will not be responsible for the app or its support; claims about the app must
          be directed to us, except as Apple’s terms require.
        </p>

        <h2 style={styles.h2}>18. Changes to these Terms</h2>
        <p style={styles.p}>
          We may update these Terms from time to time. When we make material changes, we will
          update the date above and, where appropriate, notify you through the Service.
          Changes take effect when posted, and your continued use indicates acceptance. The
          updated Terms supersede previous versions.
        </p>

        <h2 style={styles.h2}>19. General</h2>
        <ul style={styles.ul}>
          <li style={styles.li}>
            <span style={styles.strong}>Electronic communications.</span> You consent to
            receive communications electronically, and agree they satisfy any legal
            requirement that communications be in writing.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>Severability.</span> If any provision is
            unenforceable, the rest remain in effect.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>No waiver.</span> Failure to enforce a provision is
            not a waiver.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>Assignment.</span> You may not assign these Terms
            without our consent; we may assign them in a merger, acquisition, or sale of
            assets.
          </li>
          <li style={styles.li}>
            <span style={styles.strong}>Entire agreement.</span> These Terms and the Privacy
            Policy are the entire agreement between you and Vow Labs regarding the Service.
          </li>
        </ul>

        <h2 style={styles.h2}>20. Contact us</h2>
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