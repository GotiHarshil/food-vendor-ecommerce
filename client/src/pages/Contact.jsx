import React from "react";

function Contact() {
  return (
    <main
      style={{
        textAlign: "center",
        marginTop: "80px",
        padding: "40px",
        backgroundColor: "white",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ color: "#ff7b00" }}>Contact Us</h1>
      <p style={{ color: "#555", fontSize: "18px", marginTop: "20px" }}>
        Have a question or feedback? Reach out to us at:
      </p>
      <p style={{ color: "#ff7b00", fontWeight: "bold", marginTop: "10px" }}>
        📧 contact@foodvendor.com
      </p>
      <p style={{ color: "#555" }}>📞 +64 22 123 4567</p>
    </main>
  );
}

export default Contact;
