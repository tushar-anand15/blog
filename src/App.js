import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';

// Lazy load components
const About = React.lazy(() => import('./components/About'));
const Articles = React.lazy(() => import('./components/Articles'));
const ArticleDetail = React.lazy(() => import('./components/ArticleDetail'));
const Blog = React.lazy(() => import('./components/Blog'));
const Research = React.lazy(() => import('./components/Research'));

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
          <Suspense fallback={<div>Loading...</div>}>
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
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;