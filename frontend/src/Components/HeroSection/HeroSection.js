// src/components/HeroSection/HeroSection.js
import React from "react";
import "./HeroSection.css"; // Pastikan untuk membuat file CSS ini
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="hero">
      <div className="hero-content">
        <h1 className="cta-button-title lexend-deca-bold">
          Welcome to My Final Project Page
        </h1>
        <h1 className="hero-title outfit-reguler">
          The <span className="highlight">AI Assistant</span> for your
          <br />
          Smart Home
        </h1>
        <p className="hero-description lexend-deca-regular">
          Asisten AI mu yang dapat mengoptimalkan pengalaman <br></br> rumah
          pintar Anda dengan teknologi canggih.
        </p>
        <button className="cta-button lexend-deca-bold">
          <Link
            to="/service_ai"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            Cobain Sekarang !!
          </Link>
        </button>
      </div>

      <div className="dummy-container">
        <div className="before-ai">
          <h2>Sebelum pake AI ini 😔</h2>
          {/* <div className="notes-transcript">
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
          </div> */}
        </div>

        <div className="after-ai">
          <h2>Setelah pake AI ini 🤩 </h2>
          {/* <div className="notes-transcript">
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
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
