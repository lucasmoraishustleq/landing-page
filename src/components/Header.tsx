// src/components/Header.jsx
import { useState } from 'react';
import './Header.css';
import logo from '../assets/logo-pb.png'; 

function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleToggleMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false); // Fecha o menu após clique
  };

  return (
    <header className="header">
      <div className="header-container">
        <a href="#" className="logo">
          <img src={ logo } alt="HustleQ Logo" className="logo-img" />
        </a>

        <nav className={`nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <a href="#hero" onClick={handleNavClick}>Home</a>
          <a href="#about" onClick={handleNavClick}>About</a>
          <a href="#services" onClick={handleNavClick}>Services</a>
          <a href="#culture" onClick={handleNavClick}>Culture</a>
          <a href="#contact" onClick={handleNavClick}>Contact</a>
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


// import logo from '../assets/logo-pb.png'; 
// import './Header.css';

// function Header() {
//   return (
//     <header className="header">
//       <div className="header-container">
//         <a href="#" className="logo">
//           <img src={ logo } alt="HustleQ Logo" className="logo-img" />
//         </a>
//         <nav className="nav">
//           <a href="#about">About</a>
//           <a href="#services">Services</a>
//           <a href="#culture">Culture</a>
//           <a href="#problem">Problem</a>
//           <a href="#founders">Founders</a>
//           <a href="#contact">Contact</a>
//           <a href="#waitlist" className="waitlist-btn">Join Waitlist</a>
//         </nav>
//       </div>
//     </header>
//   );
// }

// export default Header;
