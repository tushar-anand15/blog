import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import About from './components/About';
import Articles from './components/Articles';
import ArticleDetail from './components/ArticleDetail';
import Blog from './components/Blog';
import Research from './components/Research';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="banner">
          <div className="banner-content">
            <h1 className="banner-title">Tushar Anand</h1>
            <nav className="banner-nav">
              <Link to="/">About</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/research">Research</Link>
            </nav>
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={
              <div>
                <div className="about-section">
                  <div className="about-image">
                    <img src={`${process.env.PUBLIC_URL}/profilepic.jpg`} alt="Tushar Anand" />
                  </div>
                  <div className="about-text">
                    <About />
                  </div>
                </div>
                <Articles />
              </div>
            } />
            <Route path="/blog" element={<Blog />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/research" element={<Research />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;