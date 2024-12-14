// src/components/HeroSection/HeroSection.js
import React from "react";
import "./HeroSection.css"; // Pastikan untuk membuat file CSS ini

const HeroSection = () => {
  return (
    <div className="hero">
      <div className="hero-content">
        <h1 className="cta-button-title lexend-deca-bold">
          Welcome to My Final Project Page
        </h1>
        <h1 className="hero-title outfit-reguler">
          The <span className="highlight">AI notepad</span> for people in
          <br />
          back-to-back meetings
        </h1>
        <p className="hero-description lexend-deca-regular">
          Granola takes your raw meeting notes and makes them awesome
        </p>
        <button className="cta-button lexend-deca-bold">
          Join the Windows waitlist
        </button>
        <p className="note lexend-deca-regular">
          Granola is Mac-only for now. We can let you know when it's ready for
          Windows.
        </p>
      </div>

      <div className="dummy-container">
        <div className="before-ai">
          <h2>Sebelum pake AI ini 😔</h2>
          <div className="notes-transcript">
            <h2>Your notes + transcript</h2>
            <div className="transcript">
              <h3>Intro call: AllFound</h3>
              <p>3:30pm</p>
              <p>Jess +1</p>
              <ul>
                <li>100, growing</li>
                <li>Use tuesday.ai, v manual</li>
                <li>180</li>
                <li>“A priority for Q2”</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="after-ai">
          <h2>Setelah pake AI ini 🤩 </h2>
          <div className="notes-transcript">
            <h2>Your notes + transcript</h2>
            <div className="transcript">
              <h3>Intro call: AllFound</h3>
              <p>3:30pm</p>
              <p>Jess +1</p>
              <ul>
                <li>100, growing</li>
                <li>Use tuesday.ai, v manual</li>
                <li>180</li>
                <li>“A priority for Q2”</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
