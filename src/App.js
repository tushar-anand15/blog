import React from 'react';
import About from './components/About';
import Articles from './components/Articles';
import './App.css';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Tushar Anand</h1>
      </header>
      <main>
        <div className="about-section">
          <div className="about-image">
            <img src={`${process.env.PUBLIC_URL}/profilepic.jpg`} alt="Your Name" />
          </div>
          <div className="about-text">
            <About />
          </div>
        </div>
        <Articles /> {/* Articles component will handle its own header */}
      </main>
    </div>
  );
}

export default App;