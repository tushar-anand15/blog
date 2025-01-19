import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './Articles.css';

// Function to import all markdown files from the articles directory
function importAll(r) {
  return r.keys().map(r);
}

const markdownFiles = importAll(require.context('../articles', false, /\.md$/));

function Articles() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    // Fetch and read all markdown files
    Promise.all(markdownFiles.map(file => fetch(file).then(res => res.text())))
      .then(texts => setArticles(texts));
  }, []);

  return (
    <section className="articles-section">
      <h2>Recent Posts</h2>
      <div className="articles-container">
        {articles.map((content, index) => {
          const intro = content.split('## Read More')[0];
          return (
            <div key={index} className="article-card">
              <ReactMarkdown>{intro}</ReactMarkdown>
              <a href={`/article${index + 1}`} className="read-more-link">Read More</a>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Articles;