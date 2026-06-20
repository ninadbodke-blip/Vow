import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

export default function Contact() {
  useSeo({
    title: 'Contact Vow — We Read Everything | Vow',
    description:
      'Get in touch with Vow. Help with the app, partnerships, press, or just to say hello. A small team that reads every message — plus crisis helplines if you need someone now.',
    canonical: 'https://vowapp.in/contact',
    type: 'website',
  })

  return (
    <MarketingLayout>
      <section style={styles.hero}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Contact</p>
          <h1 style={styles.title}>We read everything.</h1>
          <p style={styles.lede}>
            Vow is built by a small team that genuinely reads every message —
            whether you're stuck, curious, frustrated, or just want to tell us
            something. There's no support-ticket maze here. Pick whichever route
            fits, and a real person will write back.
          </p>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.inner}>
          <div style={styles.cardGrid}>
            <div style={styles.card}>
              <p style={styles.cardEyebrow}>Help with the app</p>
              <p style={styles.cardBody}>
                Trouble signing in, something not working, or a question about
                your account or a purchase. This is the fastest route to a fix.
              </p>
              <a href="mailto:support@vowapp.in" style={styles.emailLink}>
                support@vowapp.in
              </a>
            </div>

            <div style={styles.card}>
              <p style={styles.cardEyebrow}>Everything else</p>
              <p style={styles.cardBody}>
                Partnerships, press, feedback on the product, an idea, or simply
                to say hello. We'd love to hear it.
              </p>
              <a href="mailto:hello@vowapp.in" style={styles.emailLink}>
                hello@vowapp.in
              </a>
            </div>
          </div>

          <p style={styles.note}>
            We try to respond within two business days. If something is urgent,
            please say so in the subject line and we'll move it up.
          </p>

          <div style={styles.crisisBlock}>
            <p style={styles.crisisHead}>If you need someone right now</p>
            <p style={styles.crisisIntro}>
              Please don't wait for us. If you or someone you know is in crisis,
              reach a helpline — they're free, confidential, and there for
              exactly this:
            </p>
            <div style={styles.crisisLines}>
              <p style={styles.crisisRow}>
                <span style={styles.region}>India</span>{' '}
                <a href="tel:+919820466726" style={styles.tel}>AASRA +91 98204 66726</a>
                <span style={styles.sep}> · </span>
                <a href="tel:+919152987821" style={styles.tel}>iCall +91 91529 87821</a>
              </p>
              <p style={styles.crisisRow}>
                <span style={styles.region}>US</span>{' '}
                <a href="tel:988" style={styles.tel}>988</a>
                <span style={styles.sep}> · </span>
                <span style={styles.region}>UK &amp; ROI</span>{' '}
                <a href="tel:116123" style={styles.tel}>Samaritans 116 123</a>
                <span style={styles.sep}> · </span>
                <span style={styles.region}>Australia</span>{' '}
                <a href="tel:131114" style={styles.tel}>Lifeline 13 11 14</a>
              </p>
              <p style={styles.crisisRow}>
                <span style={styles.region}>Anywhere else</span>{' '}
                <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" style={styles.tel}>Find a helpline in your country →</a>
              </p>
            </div>
          </div>

          <div style={styles.officeBlock}>
            <p style={styles.officeEyebrow}>Business information</p>
            <dl style={styles.legalList}>
              <div style={styles.legalRow}><dt style={styles.legalKey}>Business name</dt><dd style={styles.legalVal}>Vow Labs</dd></div>
              <div style={styles.legalRow}><dt style={styles.legalKey}>Proprietor</dt><dd style={styles.legalVal}>Ninad Arun Bodke</dd></div>
              <div style={styles.legalRow}><dt style={styles.legalKey}>Business type</dt><dd style={styles.legalVal}>Sole proprietorship · Udyam-registered MSME</dd></div>
              <div style={styles.legalRow}><dt style={styles.legalKey}>Location</dt><dd style={styles.legalVal}>Mumbai, Maharashtra, India</dd></div>
              <div style={styles.legalRow}><dt style={styles.legalKey}>Email</dt><dd style={styles.legalVal}><a href="mailto:support@vowapp.in" style={styles.legalLink}>support@vowapp.in</a> · <a href="mailto:hello@vowapp.in" style={styles.legalLink}>hello@vowapp.in</a></dd></div>
              <div style={styles.legalRow}><dt style={styles.legalKey}>Website</dt><dd style={styles.legalVal}>vowapp.in</dd></div>
            </dl>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}

const styles = {
  hero: { padding: '80px 32px 32px' },
  section: { padding: '24px 32px 80px' },
  inner: { maxWidth: '720px', margin: '0 auto' },
  eyebrow: { fontSize: '12px', color: '#A07A3C', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 16px' },
  title: { fontSize: 'clamp(34px, 5vw, 50px)', fontWeight: 400, color: '#2A1F15', lineHeight: 1.15, margin: '0 0 24px', fontFamily: 'Georgia, serif' },
  lede: { fontSize: '20px', color: '#3A2A1C', lineHeight: 1.6, margin: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', margin: '0 0 24px' },
  card: { background: '#FBF7EE', border: '0.5px solid #E5D9C2', borderRadius: '18px', padding: '28px 26px' },
  cardEyebrow: { fontSize: '12px', color: '#A07A3C', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 12px' },
  cardBody: { fontSize: '16px', color: '#5B4F3F', lineHeight: 1.6, margin: '0 0 16px', fontFamily: 'Georgia, serif' },
  emailLink: { fontSize: '20px', color: '#854F0B', textDecoration: 'underline', textUnderlineOffset: '4px', fontFamily: 'Georgia, serif', display: 'inline-block' },
  note: { fontSize: '14.5px', color: '#9C8C78', margin: '0 0 8px', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6 },
  crisisBlock: { marginTop: '48px', padding: '24px 26px', background: '#FBF1ED', border: '0.5px solid #E8B59B', borderRadius: '16px' },
  crisisHead: { fontSize: '13px', color: '#B5663F', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 600, fontFamily: 'Georgia, serif', margin: '0 0 12px' },
  crisisIntro: { fontSize: '16px', color: '#7A4A33', lineHeight: 1.6, margin: '0 0 16px', fontFamily: 'Georgia, serif' },
  crisisLines: { display: 'flex', flexDirection: 'column', gap: '6px' },
  crisisRow: { fontSize: '15.5px', color: '#7A4A33', lineHeight: 1.6, margin: 0, fontFamily: 'Georgia, serif' },
  region: { color: '#9A5A3C', fontWeight: 600 },
  tel: { color: '#854F0B', textDecoration: 'underline', textUnderlineOffset: '3px' },
  sep: { color: '#C9A088' },
  officeBlock: { marginTop: '40px', paddingTop: '28px', borderTop: '0.5px solid #E5D9C2' },
  officeEyebrow: { fontSize: '12px', color: '#A07A3C', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 10px' },
  officeBody: { fontSize: '15px', color: '#9C8C78', lineHeight: 1.6, margin: 0, fontFamily: 'Georgia, serif' },
  legalList: { margin: 0, padding: 0 },
  legalRow: { display: 'flex', flexWrap: 'wrap', gap: '6px 18px', padding: '10px 0', borderTop: '0.5px solid #EDE4D3' },
  legalKey: { flex: '0 0 130px', fontSize: '13px', color: '#9C8C78', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Georgia, serif', margin: 0 },
  legalVal: { flex: '1 1 220px', fontSize: '16px', color: '#3A2A1C', lineHeight: 1.5, fontFamily: 'Georgia, serif', margin: 0 },
  legalLink: { color: '#854F0B', textDecoration: 'underline', textUnderlineOffset: '3px' },
}