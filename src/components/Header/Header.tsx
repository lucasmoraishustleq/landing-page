import { useState } from 'react';
import './Header.css';
import { headerContent } from "./Header";
import logo from '../../assets/logo-pb.png'; 

function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleToggleMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <a href="#" className="logo">
          <img src={ logo } alt="HustleQ Logo" className="logo-img" />
        </a>

        <nav className={`nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <a href="#hero" onClick={handleNavClick}>{ headerContent.home }</a>
          <a href="#about" onClick={handleNavClick}>{ headerContent.about }</a>
          <a href="#services" onClick={handleNavClick}>{ headerContent.services }</a>
          <a href="#contact" onClick={handleNavClick}>{ headerContent.helpUs } </a>
          <a href="#culture" onClick={handleNavClick}>{ headerContent.culture }</a>
          <a href="#key-challenge" onClick={handleNavClick}>{ headerContent.keyChallenge }</a>
          <a href="#founders" onClick={handleNavClick}>{ headerContent.founders }</a>
          <a href="#waitlist" onClick={handleNavClick}>{ headerContent.waitlist }</a>

        </nav>

        <div className="hamburger" onClick={handleToggleMenu}>
          <div className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></div>
        </div>
      </div>
    </header>
  );
}

export default Header;