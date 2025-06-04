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
// import Footer from "./components/Footer/Footer";
import Contact from "./components/Contact/Contact";

function App() {
  return (
    <>
      <Header />
      <main>
      <div style={{ height: "150px" }}></div>
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
      {/* <Footer /> */}
    </>
  );
}

export default App;
