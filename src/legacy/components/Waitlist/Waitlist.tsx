import { useState } from 'react';
import './Waitlist.css';
import { waitlistContent } from './WaitlistContent';

const Waitlist = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    setSubmitted(true);
    setEmail('');

    try {
      await fetch(waitlistContent.apiUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email }),
      });

      setSubmitted(true);
      setEmail('');
    } catch (error) {
      alert(waitlistContent.errorMessage);
      console.error('Error submitting email:', error);
    }
  };

  return (
    <section id="waitlist" className="waitlist">
      <h2>{ waitlistContent.title }</h2>
      <p>{ waitlistContent.description }</p>

      {!submitted ? (
        <form className="waitlist-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder={ waitlistContent.form.emailPlaceholder }
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">{ waitlistContent.form.submitButton }</button>
        </form>
      ) : (
        <p className="waitlist-thankyou">{ waitlistContent.form.thankYouMessage }</p>
      )}
    </section>
  );
};

export default Waitlist;
