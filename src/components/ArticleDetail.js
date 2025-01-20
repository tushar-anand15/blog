import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router-dom';

function ArticleDetail() {
  const { slug } = useParams();
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/articles/${slug}.md`)
      .then((response) => response.text())
      .then((text) => setContent(text))
      .catch((error) => console.error(`Error loading markdown file: ${slug}.md`, error));
  }, [slug]);

  return (
    <div className="article-detail">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

export default ArticleDetail;