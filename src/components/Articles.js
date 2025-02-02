import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import articleList from '../articleList.json'; // Import the generated JSON file
import './Articles.css';

function Articles() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    // Fetch each markdown file listed in articleList.json
    Promise.all(articleList.map(file => fetch(`${process.env.PUBLIC_URL}/articles/${file}`).then(res => res.text())))
      .then(texts => {
        const articlesData = texts.map((content, index) => {
          const file = articleList[index]; // Define 'file' here using the index

          // Extract the title from the first header or front matter
          const titleMatch = content.match(/^#\s(.+)/);
          const title = titleMatch ? titleMatch[1] : `Article ${index + 1}`;

          // Remove the first header from the content
          const contentWithoutTitle = content.replace(/^#\s.+\n/, '');

          // Extract the introduction part before "## Read More"
          const intro = contentWithoutTitle.split('## Read More')[0];

          return {
            title,
            intro,
            slug: file.replace('.md', '') // Use the filename as the slug
          };
        });
        setArticles(articlesData);
      });
  }, []);

  return (
    <section className="articles-section">
      <h2>Recent Posts</h2>
      <div className="articles-container">
        {articles.map((article, index) => (
          <div key={index} className="article-card">
            <h2>{article.title}</h2>
            <ReactMarkdown>{article.intro}</ReactMarkdown>
            <Link to={`/blog/${article.slug}`} className="read-more-link">Read More</Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Articles;