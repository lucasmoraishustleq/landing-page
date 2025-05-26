import "./App.css";

import Header from './components/Header';
import Hero from "./components/Hero";
import About from "./components/About";
import Services from "./components/Services";
import Contact from "./components/Contact";
import WaitList from "./components/WaitList";
import Culture from "./components/Culture";
import KeyChallenge from "./components/KeyChallenge";
import Founders from "./components/Founders";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Contact />
        <Culture />
        <KeyChallenge />
        <Founders />
        <WaitList />
        <Footer />
      </main>
    </>
  );
}

export default App;
