import './Footer.css';
import instagram from '../assets/instagram.svg';
import linkedin from '../assets/linkedin.svg';
import twitter from '../assets/twitter.svg';
import youtube from '../assets/youtube.svg';
import tiktok from '../assets/tiktok.svg';
import facebook from '../assets/facebook.svg';

function Footer() {
  return (
    <footer className="footer">
      <div className="social-links">
        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
          <img src={ instagram } alt="Instagram" />
        </a>
        <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
          <img src={ linkedin } alt="LinkedIn" />
        </a>
        <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
          <img src={ twitter } alt="Twitter" />
        </a>
        <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
          <img src={ youtube } alt="Youtube" />
        </a>
        <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer">
          <img src={ tiktok } alt="Tiktok" />
        </a>
        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
          <img src={ facebook } alt="Facebook" />
        </a>
      </div>
      <p className="copyright">
        &copy; {new Date().getFullYear()} HustleQ. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
