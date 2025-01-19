import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router-dom';
import '../App.css'; // Use the existing App.css for styling

const markdownFiles = require.context('../articles', false, /\.md$/);

function ArticleDetail() {
  const { id } = useParams();
  const markdownFile = markdownFiles.keys()[id];

  const [content, setContent] = React.useState('');

  React.useEffect(() => {
    if (markdownFile) {
      fetch(markdownFiles(markdownFile))
        .then((response) => response.text())
        .then((text) => setContent(text))
        .catch((error) => console.error('Error fetching markdown:', error));
    }
  }, [markdownFile]);

  return (
    <div className="article-detail">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

export default ArticleDetail;