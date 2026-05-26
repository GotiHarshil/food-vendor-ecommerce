import React from "react";
import "./About.css";

export default function About() {
  return (
    <div className="about-page">
      {/* Header */}
      <div className="about-header">
        <h1>About MANU</h1>
        <p>Authentic street food, crafted with passion</p>
      </div>

      {/* Story Section */}
      <section className="about-section">
        <div className="section-content">
          <h2>Our Story</h2>
          <p>
            MANU started with a simple vision: to bring authentic, delicious street food to your doorstep.
            What began as a small food truck has grown into a beloved local institution, serving hundreds of
            happy customers every day.
          </p>
          <p>
            We believe in quality ingredients, traditional recipes, and the art of cooking with care.
            Every dish is prepared fresh, using locally sourced ingredients whenever possible, ensuring
            you get the best taste and nutrition in every bite.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-section alternate">
        <div className="section-content">
          <h2>Our Mission</h2>
          <p>
            To serve exceptional street food that brings people together, using fresh ingredients and
            traditional cooking methods that honor culinary heritage while embracing modern convenience.
          </p>
          <div className="mission-values">
            <div className="value-card">
              <i className="fa-solid fa-leaf"></i>
              <h3>Fresh & Quality</h3>
              <p>Only the finest ingredients in every dish</p>
            </div>
            <div className="value-card">
              <i className="fa-solid fa-heart"></i>
              <h3>Made with Love</h3>
              <p>Prepared with passion by experienced chefs</p>
            </div>
            <div className="value-card">
              <i className="fa-solid fa-bolt"></i>
              <h3>Quick & Convenient</h3>
              <p>Order online, pick up fresh from our kitchen</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-section">
        <div className="section-content">
          <h2>Our Team</h2>
          <p>
            Behind every delicious meal is a team of passionate cooks, food enthusiasts, and customer
            service experts who are dedicated to making your experience exceptional.
          </p>
          <div className="team-info">
            <p>
              Our head chef brings 15+ years of experience in traditional and fusion cuisine, creating
              unique flavor combinations that keep customers coming back. Our support team ensures every
              order is prepared with precision and delivered with a smile.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="about-section alternate">
        <div className="section-content">
          <h2>Get in Touch</h2>
          <p>We'd love to hear from you! Whether you have a question, suggestion, or just want to say hello.</p>
          <div className="contact-info">
            <div className="info-item">
              <i className="fa-solid fa-location-dot"></i>
              <div>
                <strong>Location</strong>
                <p>42W 46th Street, New York, NY 10036</p>
              </div>
            </div>
            <div className="info-item">
              <i className="fa-solid fa-phone"></i>
              <div>
                <strong>Phone</strong>
                <p>(212) 555-0123</p>
              </div>
            </div>
            <div className="info-item">
              <i className="fa-solid fa-envelope"></i>
              <div>
                <strong>Email</strong>
                <p>maundabeli2708@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <h2>Ready to taste the difference?</h2>
        <p>Explore our menu and order your favorite dishes today</p>
        <a href="/menu" className="btn-cta">Browse Menu</a>
      </section>
    </div>
  );
}
