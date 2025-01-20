const fs = require('fs');
const path = require('path');

// Directory containing markdown files
const articlesDir = path.join(__dirname, 'public/articles');

const outputFile = path.join(__dirname, 'src/articleList.json');

function generateArticleList() {
  const files = fs.readdirSync(articlesDir).filter(file => path.extname(file) === '.md');
  fs.writeFileSync(outputFile, JSON.stringify(files, null, 2));
  console.log(`Article list written to ${outputFile}`);
}

generateArticleList();