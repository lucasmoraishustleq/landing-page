import { useEffect } from "react";

import "./App.css";

import Header from './components/Header/Header';
import Hero from "./components/Hero/Hero";
import About from "./components/About/About";
import Services from "./components/Services/Services";
import Help from "./components/Help/Help";
import WaitList from "./components/Waitlist/Waitlist";
import Culture from "./components/Culture/Culture";
import KeyChallenge from "./components/KeyChallenge/KeyChallenge";
import Founders from "./components/Founders/Founders";
import Footer from "./components/Footer/Footer";
import Contact from "./components/Contact/Contact";

function App() {

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  return (
    <>
      <Header />
      <main>
      <div className="space-header"></div>
        <Hero />
        <About />
        <Services />
        <Help />
        <Culture />
        <KeyChallenge />
        <Founders />
        <WaitList />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;
