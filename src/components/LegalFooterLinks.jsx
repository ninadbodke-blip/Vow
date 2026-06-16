// LegalFooterLinks.jsx
// Persistent Privacy / Terms link group for the Settings or Profile screen.
//
// Usage: import and drop into your settings page, typically near the bottom.

import React from "react";
import { Link } from "react-router-dom";

const styles = {
  nav: {
    display: "flex",
    gap: 16,
    marginTop: 24,
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontStyle: "italic",
    fontSize: 14,
  },
  link: {
    color: "#B0603F",
    textDecoration: "none",
  },
  dot: {
    color: "#E6DBCD",
  },
};

export default function LegalFooterLinks() {
  return (
    <nav style={styles.nav}>
      <Link to="/privacy" style={styles.link}>
        Privacy Policy
      </Link>
      <span style={styles.dot}>·</span>
      <Link to="/terms" style={styles.link}>
        Terms
      </Link>
      <span style={styles.dot}>·</span>
      <Link to="/refund" style={styles.link}>
        Refunds
      </Link>
    </nav>
  );
}