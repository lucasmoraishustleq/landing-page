import { useState } from 'react';
import './WaitList.css';

const Waitlist = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    setSubmitted(true);
    setEmail('');

    try {
      await fetch('https://script.google.com/a/macros/hustleqai.com/s/AKfycbwp3aIFOl4s3ktPe0qr8t1DZWS5HVZq9Rm5t1Bo2zlTdoYLddaVP5_i4OpgQnCoeHb1Bw/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email }),
      });

      setSubmitted(true);
      setEmail('');
    } catch (error) {
      alert('Erro ao enviar e-mail. Tente novamente.\n');
      console.error('Error submitting email:', error);
    }
  };

  return (
    <section id="waitlist" className="waitlist">
      <h2>Join our Waitlist</h2>
      <p>Be the first to know when we launch. Sign up below:</p>

      {!submitted ? (
        <form className="waitlist-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Notify Me</button>
        </form>
      ) : (
        <p className="waitlist-thankyou">Thank you! You'll hear from us soon. 🚀</p>
      )}
    </section>
  );
};

export default Waitlist;
