import "./Founders.css";
import { foundersContent } from "./FoundersContent";
import izaImage from "../../assets/iza.webp";
import lucasImage from "../../assets/lucas.webp";

function Founders() {
  return (
    <section id="founders" className="founders">
      <h2 className="founders-title">{ foundersContent.title }</h2>

      <div className="founders-container">
        <div className="founder-card">
          <img src={ izaImage } alt={ foundersContent.founders[0].name } className="founder-image" loading="lazy"/>
          <h3>{ foundersContent.founders[0].name }</h3>
          <p>{ foundersContent.founders[0].description }</p>
        </div>

        <div className="founder-card">
          <img src={ lucasImage } alt={ foundersContent.founders[1].name } className="founder-image" loading="lazy"/>
          <h3>{ foundersContent.founders[1].name }</h3>
          <p>{ foundersContent.founders[1].description }</p>
        </div>
      </div>
    </section>
  );
}

export default Founders;