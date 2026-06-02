import MarketingLayout from './MarketingLayout'

export default function Contact() {
  return (
    <MarketingLayout>
      <section style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Contact</p>
          <h1 style={styles.title}>Write to us.</h1>
          <p style={styles.body}>
            For product questions, partnership ideas, press, or anything else —
            email is the best way to reach us. We're a small team and we read
            everything.
          </p>

          <a href="mailto:hello@vowapp.in" style={styles.emailLink}>
            hello@vowapp.in
          </a>

          <p style={styles.note}>
            We try to respond within two business days. If your message is
            urgent and time-sensitive, please mark it clearly in the subject.
          </p>

          <p style={styles.eyebrowSecond}>Registered office</p>
          <p style={styles.body}>
            Vow Labs<br />
            Mumbai, India<br />
            Udyam-registered MSME
          </p>

          <p style={styles.eyebrowSecond}>In crisis</p>
          <p style={styles.body}>
            If you or someone you know is in immediate crisis, please don't wait
            for us — reach a helpline now:
          </p>
          <p style={styles.body}>
            <a href="tel:+919820466726" style={styles.tel}>AASRA · +91 98204 66726</a><br />
            <a href="tel:+919152987821" style={styles.tel}>iCall · +91 91529 87821</a>
          </p>
        </div>
      </section>
    </MarketingLayout>
  )
}

const styles = {
  section: {
    padding: '80px 32px',
  },
  inner: {
    maxWidth: '680px',
    margin: '0 auto',
  },
  eyebrow: {
    fontSize: '12px',
    color: '#A07A3C',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 16px',
  },
  eyebrowSecond: {
    fontSize: '12px',
    color: '#A07A3C',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '56px 0 16px',
  },
  title: {
    fontSize: 'clamp(34px, 5vw, 50px)',
    fontWeight: 400,
    color: '#2A1F15',
    lineHeight: 1.15,
    margin: '0 0 28px',
    fontFamily: 'Georgia, serif',
  },
  body: {
    fontSize: '17px',
    color: '#5B4F3F',
    lineHeight: 1.7,
    margin: '0 0 16px',
    fontFamily: 'Georgia, serif',
  },
  emailLink: {
    fontSize: '24px',
    color: '#2A1F15',
    textDecoration: 'underline',
    textUnderlineOffset: '4px',
    fontFamily: 'Georgia, serif',
    display: 'inline-block',
    margin: '8px 0 8px',
  },
  note: {
    fontSize: '14px',
    color: '#9C8C78',
    margin: '8px 0 0',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },
  tel: {
    color: '#5B4F3F',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  },
}
