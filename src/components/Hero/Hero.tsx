import "./Hero.css";
import { heroContent } from "./HeroContent";

function Hero() {
  return (
    <section id="hero" className="hero-container">
      <h1 className="hero-phrase-1">{ heroContent.phrase1 }</h1>
      <h1 className="hero-phrase-2">{ heroContent.phrase2 }</h1>
      <h1 className="hero-phrase-3">{ heroContent.phrase3 }</h1>
    </section>
  );
}

export default Hero;