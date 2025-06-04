import React, { useState } from "react";
import { contactContent } from "./ContactContent"
import emailjs from '@emailjs/browser';

import "./Contact.css";

function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    emailjs.sendForm('service_z0bdtdq', 'template_ho0mg4v', e.currentTarget, 'Y0E0EW3h2P_3smucV')
    .then(() => {
      setSubmitted(true);
    })
    .catch((error: string) => {
      console.error('FAILED...', error);
      alert('Failed to send. Please try again.');
    });
  };


  return (
    <section className="contact-section">
      <h2 className="contact-title">{ contactContent.title }</h2>
      {!submitted ? (
        <form onSubmit={handleSubmit} className="contact-form">
          <input type="text" name="name" placeholder={ contactContent.placeholders.name } required />
          <input type="email" name="email" placeholder={contactContent.placeholders.email } required />
          <input type="tel" name="phone" placeholder={contactContent.placeholders.phone } required />
          <textarea name="message" placeholder={contactContent.placeholders.message } required />
          <button type="submit">{ contactContent.button }</button>
        </form>
      ) : (
        <div className="contact-thank-you-container">
        <p>{ contactContent.successMessage }</p>
        </div>
      )}
    </section>
  );
}

export default Contact;
