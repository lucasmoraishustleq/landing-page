import "./KeyChallenge.css";
import { keyChallengeContent } from "./KeyChallengeContent";

function KeyChallenge() {
  return (
    <section id="key-challenge" className="key-challenge">
      <h2>{ keyChallengeContent.title }</h2>
      <p className="key-challenge-intro">{ keyChallengeContent.intro[0] }</p>
      <p className="key-challenge-intro">{ keyChallengeContent.intro[1] }</p>
      <p className="key-challenge-intro">{ keyChallengeContent.intro[2] }</p>

      <div className="challenge-highlights">
        <div className="challenge-card">
          <h3>{ keyChallengeContent.highlights[0].title }</h3>
          <p>{ keyChallengeContent.highlights[0].description }</p>
        </div>
        <div className="challenge-card">
          <h3>{ keyChallengeContent.highlights[1].title }</h3>
          <p>{ keyChallengeContent.highlights[1].description }</p>
        </div>
        <div className="challenge-card">
          <h3>{ keyChallengeContent.highlights[2].title }</h3>
          <p>{ keyChallengeContent.highlights[2].description }</p>
        </div>
      </div>
    </section>
  );
}

export default KeyChallenge;