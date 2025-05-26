import "./Services.css";

export default function Services() {
  return (
    <section id="services" className="services">
      <h2>Our Services</h2>
      <div className="service-list">
        <div className="service-item">
          <h3>Digital Strategy</h3>
          <p>Tailored plans based on your goals, audience, and market.</p>
        </div>
        <div className="service-item">
          <h3>Performance Marketing</h3>
          <p>Maximize ROI with targeted ad campaigns and optimization.</p>
        </div>
        <div className="service-item">
          <h3>Creative Production</h3>
          <p>High-impact visuals and content to elevate your brand.</p>
        </div>
      </div>
    </section>
  );
}
