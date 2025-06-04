import './Services.css';
import { servicesContent } from './Services';

function Services() {
  return (
    <section className="services" id="services">
      <h2>{ servicesContent.title }</h2>
      <div className="services-grid">
        <div className="service-card">
        <img width="54" height="54" src={ servicesContent.services[0].icon } alt="brain"/>
          <h3>{ servicesContent.services[0].title }</h3>
          <p>{ servicesContent.services[0].description }</p>
        </div>

        <div className="service-card">
        <img width="54" height="54" src={ servicesContent.services[1].icon } alt="clock--v1"/>
          <h3>{ servicesContent.services[1].title }</h3>
          <p>{ servicesContent.services[1].description }</p>
        </div>

        <div className="service-card">
        <img width="54" height="54" src={ servicesContent.services[2].icon } alt="maintenance"/>
          <h3>{ servicesContent.services[2].title }</h3>
          <p>{ servicesContent.services[2].description }</p>
        </div>
      </div>
    </section>
  );
}

export default Services;
