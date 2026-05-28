// SignupConsentLine.jsx
// The "By creating an account, you agree to our Terms and Privacy Policy" line
// for the bottom of the signup screen.
//
// Usage: import and place directly below your "Create account" button.

import React from "react";
import { Link } from "react-router-dom";

const styles = {
  wrap: {
    marginTop: 20,
    fontSize: 13,
    color: "#6B6058",
    textAlign: "center",
    lineHeight: 1.5,
  },
  link: {
    color: "#B0603F",
    textDecoration: "underline",
  },
};

export default function SignupConsentLine() {
  return (
    <p style={styles.wrap}>
      By creating an account, you agree to our{" "}
      <Link to="/terms" style={styles.link}>
        Terms
      </Link>
      {" "}and{" "}
      <Link to="/privacy" style={styles.link}>
        Privacy Policy
      </Link>
      .
    </p>
  );
}
