// Footer.js
import React from 'react';
import { FaInstagram, FaPhone } from 'react-icons/fa';
import '../css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="contact-info">
        <p className="contact-text">Contact Us</p>
      </div>

      <div className="social-media">
        {/* Instagram logo */}
        <a href="https://www.instagram.com/daliaccessories/?hl=en" target="_blank" rel="noopener noreferrer">
          <FaInstagram className="instagram-icon" />
        </a>
        {/* Phone icon and number */}
        <div className="phone-container">
          <FaPhone className="phone-icon" />
          <p className="phone-number">+961 71 028885</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
