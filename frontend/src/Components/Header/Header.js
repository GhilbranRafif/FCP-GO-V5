// src/components/Header/Header.js
import React from "react";
import "./Header.css"; // Pastikan untuk membuat file CSS ini
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="header">
      <Link to="/" className="logo">
        SmartHome
      </Link>
      <nav className="nav">
        <Link to="/service_ai">Tools AI</Link>
        <Link to="/AsistantAI">Chat AI</Link>
      </nav>
    </header>
  );
};

export default Header;
