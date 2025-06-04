import './Footer.css';
import { linksContent, footerContent } from './Footer';
import instagram from '../../assets/instagram.svg';
import linkedin from '../../assets/linkedin.svg';
import twitter from '../../assets/twitter.svg';
import youtube from '../../assets/youtube.svg';
import tiktok from '../../assets/tiktok.svg';
import facebook from '../../assets/facebook.svg';

function Footer() {
  return (
    <footer className="footer">
      <div className="social-links">
        <a href={ linksContent.instagram.href } target="_blank" rel="noopener noreferrer">
          <img src={ instagram } alt={ linksContent.instagram.alt } />
        </a>
        <a href={ linksContent.linkedin.href } target="_blank" rel="noopener noreferrer">
          <img src={ linkedin } alt={ linksContent.linkedin.alt } />
        </a>
        <a href={ linksContent.twitter.href } target="_blank" rel="noopener noreferrer">
          <img src={ twitter } alt={ linksContent.twitter.alt } />
        </a>
        <a href={ linksContent.youtube.href } target="_blank" rel="noopener noreferrer">
          <img src={ youtube } alt={ linksContent.youtube.alt } />
        </a>
        <a href={ linksContent.tiktok.href } target="_blank" rel="noopener noreferrer">
          <img src={ tiktok } alt={ linksContent.tiktok.alt } />
        </a>
        <a href={ linksContent.facebook.href } target="_blank" rel="noopener noreferrer">
          <img src={ facebook } alt={ linksContent.facebook.alt } />
        </a>
      </div>
      <p className="copyright">{ footerContent.copyright }</p>
    </footer>
  );
}

export default Footer;
