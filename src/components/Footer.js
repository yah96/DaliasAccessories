import React from 'react';
import { FaInstagram, FaPhone, FaWhatsapp } from 'react-icons/fa';
import '../css/Footer.css';

const Footer = () => {
  // Function to open WhatsApp with the provided phone number
  const openWhatsApp = () => {
    const phoneNumber = "+96171028885"; // Replace with your phone number
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
  };

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
        {/* WhatsApp icon and phone number */}
        <div className="phone-container" onClick={openWhatsApp}>
          <FaWhatsapp className="whatsapp-icon" />
          <p className="phone-number">+961 71 028885</p>
        </div>
      </div>
    </footer>

  );
};

export default Footer;
