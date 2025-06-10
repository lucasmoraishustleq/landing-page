import "./Culture.css";
import { cultureContent } from "./CultureContent";
import cultureImage from "../../assets/culture.webp";

function Culture() {
  return (
    <section id="culture" className="culture-section">
      <div className="culture-text-container">
        <h2>{ cultureContent.title }</h2>
        <p>{ cultureContent.description }</p>
        <ul>
          <li><strong>{ cultureContent.values[0].key }</strong> — { cultureContent.values[0].description }</li>
          <li><strong>{ cultureContent.values[1].key }</strong> —  { cultureContent.values[1].description }</li>
          <li><strong>{ cultureContent.values[2].key }</strong> —  { cultureContent.values[2].description }</li>
        </ul>
        <p>{ cultureContent.closing }</p>
      </div>
      <div className="culture-image-container">
        <img src={cultureImage} alt="Team culture" loading="lazy"/>
      </div>
    </section>
  );
}

export default Culture;