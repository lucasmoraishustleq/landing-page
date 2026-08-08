import './About.css';
import { aboutContent } from './AboutContent'

const About = () => {
  return (
    <section id="about" className="about">
      <div className="about-container">
        <h2 className="about-title">{ aboutContent.title }</h2>
        <p className="about-description">{ aboutContent.description }</p>
        <p className="about-description">{ aboutContent.secondDescription }</p>
        <p className="about-description" dangerouslySetInnerHTML={{ __html: aboutContent.thirdDescription }} />
      </div>
    </section>
  );
};

export default About;
