import "./Help.css";
import { helpContent } from "./Help"
import logoImage from "../../assets/logo-branca.png";

export default function Help() {
  return (
    <section id="help" className="help">
      <h2 className="help-title">
        { helpContent.title }{" "}
        <img src={ logoImage } alt="HustleQ Logo" className="inline-logo" />
      </h2>
      <p>{ helpContent.description }</p>
      <a href={ helpContent.buttonLink } className="help-button" target="_blank" rel="noopener noreferrer">
        { helpContent.buttonText }
      </a>
    </section>
  );
}
