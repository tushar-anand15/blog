const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const articlesDir = './public/articles';
const outputDir = './dist';
const templatesDir = './templates';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Copy articles directory to output
if (fs.existsSync(path.join(outputDir, 'articles'))) {
    fs.rmSync(path.join(outputDir, 'articles'), { recursive: true });
}
fs.cpSync(articlesDir, path.join(outputDir, 'articles'), { recursive: true });

// Copy profile picture
if (fs.existsSync('./public/profilepic.jpg')) {
    fs.cpSync('./public/profilepic.jpg', path.join(outputDir, 'profilepic.jpg'));
}

function extractTitle(content) {
    const titleMatch = content.match(/^#\s+(.+)/m);
    return titleMatch ? titleMatch[1].trim() : 'Untitled';
}

function extractExcerpt(content, maxLength = 200) {
    let text = content.replace(/^#\s+.+/m, '').trim();
    text = text.replace(/#{1,6}\s+/g, '');
    text = text.replace(/!\[.*?\]\(.*?\)/g, '');
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    text = text.replace(/\*\*(.*?)\*\*/g, '$1');
    text = text.replace(/\*(.*?)\*/g, '$1');
    text = text.replace(/`([^`]+)`/g, '$1');
    text = text.replace(/```[\s\S]*?```/g, '');
    
    const firstParagraph = text.split('\n\n')[0];
    
    if (firstParagraph.length <= maxLength) {
        return firstParagraph;
    }
    
    return firstParagraph.substring(0, maxLength).trim() + '...';
}

function getTemplate(templateName) {
    const templatePath = path.join(templatesDir, `${templateName}.html`);
    if (fs.existsSync(templatePath)) {
        return fs.readFileSync(templatePath, 'utf8');
    }
    return getDefaultTemplate(templateName);
}

function getDefaultTemplate(templateName) {
    if (templateName === 'article') {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - Tushar's Blog</title>
    <style>
        body { max-width: 800px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #f8f8f8; padding: 20px; margin: -20px -20px 40px -20px; border-bottom: 3px solid #FF8C00; }
        .header h1 { margin: 0; color: #333; font-size: 2.5em; }
        .nav a { color: #FF8C00; text-decoration: none; font-weight: bold; margin-right: 20px; }
        .nav a:hover { text-decoration: underline; }
        .back-link { display: inline-block; margin-bottom: 20px; color: #FF8C00; text-decoration: none; font-weight: bold; }
        .back-link:hover { text-decoration: underline; }
        .article-content h1, .article-content h2 { color: #333; border-bottom: 3px solid #FF8C00; display: inline-block; padding-bottom: 5px; }
        .article-content h2 { font-size: 1.8em; }
        .article-content img { max-width: 600px; width: 100%; height: auto; display: block; margin: 20px auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
        .article-content pre { background-color: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .article-content code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: 'Courier New', monospace; }
        .article-content blockquote { border-left: 4px solid #FF8C00; margin: 20px 0; padding: 10px 20px; background-color: #f9f9f9; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Tushar Anand</h1>
        <nav class="nav">
            <a href="index.html">Home</a>
            <a href="blog.html">Blog</a>
            <a href="research.html">Research</a>
        </nav>
    </div>
    <a href="blog.html" class="back-link">← Back to Blog</a>
    <div class="article-content">
        {{content}}
    </div>
</body>
</html>`;
    }
    
    if (templateName === 'index') {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tushar's Blog</title>
    <style>
        body { max-width: 800px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #f8f8f8; padding: 20px; margin: -20px -20px 40px -20px; border-bottom: 3px solid #FF8C00; }
        .header h1 { margin: 0; color: #333; font-size: 2.5em; }
        .nav a { color: #FF8C00; text-decoration: none; font-weight: bold; margin-right: 20px; }
        .nav a:hover { text-decoration: underline; }
        .about-section { display: flex; margin-bottom: 40px; }
        .about-image { flex: 1; margin-right: 20px; }
        .about-image img { width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
        .about-text { flex: 2; }
        .article-list { display: grid; gap: 20px; }
        .article-card { background-color: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); transition: transform 0.2s; }
        .article-card:hover { transform: translateY(-5px); }
        .article-title { color: #333; margin: 0 0 10px 0; font-size: 1.5em; }
        .article-excerpt { color: #666; margin: 10px 0; }
        .read-more { color: #FF8C00; font-weight: bold; text-decoration: none; }
        .read-more:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Tushar Anand</h1>
        <nav class="nav">
            <a href="index.html">Home</a>
            <a href="blog.html">Blog</a>
            <a href="research.html">Research</a>
        </nav>
    </div>
    <div>
        {{content}}
        
        <h2>Recent Posts</h2>
        <div class="article-list">
            {{articles}}
        </div>
    </div>
</body>
</html>`;
    }
    
    return templateName === 'blog' ? getDefaultTemplate('index').replace('Recent Posts', 'Blog Posts').replace('{{content}}', '') : '';
}

function getAboutContent() {
    return `
        <div class="about-section">
            <div class="about-image">
                <img src="profilepic.jpg" alt="Tushar Anand" />
            </div>
            <div class="about-text">
                <h2>About</h2>
                <p>
                    I like to tinker around with code and work with data. Although I do not have a formal background in computer science, I've always had an interest in computers and code. This blog is where I share the interesting things I learn about data - from the perspective of a non-engineer.
                </p>
                <p>
                    Currently, I'm working at Jhana.ai as a data engineer where my work involves web scraping and maintaining the post-processing pipeline for our AI products. Previously, I have held research positions at the National Institute of Public Finance and Policy, and XKDR Forum where I worked with data as well as legal-policy analysis.
                </p>
                <p>
                    I hold a master's in Urban Policy and Governance from Tata Institute of Social Sciences, Mumbai, and a bachelor's in Economics, Political Science, and Sociology from Christ University, Bangalore.
                </p>
            </div>
        </div>
    `;
}

function getResearchContent() {
    return `
        <h2>Research</h2>
        <h3>Publications:</h3>
        <ul>
            <li>
                <strong>Do court vacations matter: evidence from the Bombay High Court</strong>, 
                <a href="https://blog.theleapjournal.org/2024/09/do-court-vacations-matter-evidence-from.html#gsc.tab=0" target="_blank" rel="noopener noreferrer">
                    The Leap Blog, 2024
                </a>
                <p>
                    Court vacations are often invoked as a problematic feature of the Indian judiciary. The discourse on this includes blaming court vacations for case delays, petitions to reduce the length of court vacations, and substituting them with staggered leave for judges. This discourse is characterised by the classic divide that cuts across most Indian discourse on court reforms. Lawyers and judges emphasize the importance of court vacations for overall judge productivity. Often, they perceive the criticism of court vacations as being politically motivated or as an attack on judicial integrity. Other stakeholders underscore the problems of delays and pendency, and compare the courts' calendar with that of other public organisations. In the event, neither side is able to support their argument by demonstrating the extent of delays attributable to court vacations. The puzzle on how much do court vacations actually affect case durations and disposal continues to remain unanswered. This article presents some first estimates on the impact of court vacations on these outputs.
                </p>
            </li>
            <li>
                <strong>Inheritance Rights of Transgender Persons in India</strong>, 
                <a href="https://www.tandfonline.com/doi/full/10.1080/24730580.2022.2139584#:~:text=It%20provides%20detailed%20rules%20regarding%20succession.&text=However%2C%20the%20Act%20does%20not,a%20binary%20notion%20of%20gender." target="_blank" rel="noopener noreferrer">
                    Indian Law Review, 2022
                </a>
                <p>
                    This paper studies the inheritance rights of transgender persons in India. It examines the legal framework for inheritance and provides an overview of all court decisions between 1950 and 2021 that mention the term transgender (and its analogous terms, i.e., aravani, kinner, etc.). Though the Indian Constitution bars discrimination based on sex or gender, inheritance laws do not envisage transgender persons or a change in gender identity. They are based on a binary notion of gender. Individuals must choose between conforming to their assigned gender or not availing their rights. Moreover, successors are often difficult to identify as individuals may lack documentation, could not marry, or cannot prove adoption. While courts attempt to address these challenges, they leave it to their subjective satisfaction on when to secure the rights of transgender persons. These are important issues that must be addressed through changes in the law.
                </p>
            </li>
            <li>
                <strong>Problems with ecourts data</strong>, 
                <a href="https://www.nipfp.org.in/media/medialibrary/2020/07/WP_314__2020.pdf" target="_blank" rel="noopener noreferrer">
                    NIPFP Working Paper, 2020
                </a>
                <p>
                    The creation of the e-Courts platform for disseminating data from the subordinate judiciary was an important step in making Indian courts more transparent. This platform has also prompted an interest in data-driven research on courts. While the e-Courts platform is a major reform in itself, there are numerous obstacles in successfully using this data for research. Previous work has pointed out that the data has standardisation issues, particularly in case-type nomenclature. It has also been shown that other fields, such as statute names and section numbers, are missing in some cases. In this paper, we quantify these error rates, which have so far only been known to exist anecdotally. We also identify new issues with the data, notably issues with wrong data being entered in certain fields. We report and quantify problems with mismatches between case-types and statute names, missing and malformed data in the statute name, section number, and date-time fields. We also show variations in error rates across states. The Indian Supreme Court eCommittee has taken cognisance of and initiated interventions to address some of these issues. However, the fundamental cause of bad quality data, viz. the lack of systematic data quality reviews and capacity building for the same does not seem to be part of the committee's plans. Until these quality issues are addressed, the use of this data for research will be limited.
                </p>
            </li>
            <li>
                <strong>Gender discrimination in devolution of property under Hindu Succession Act, 1956</strong>, 
                <a href="https://www.nipfp.org.in/media/medialibrary/2020/05/WP_305_2020.pdf" target="_blank" rel="noopener noreferrer">
                    NIPFP Working Paper, 2020
                </a>
                <p>
                    In India, statutes governing individuals on matters of personal law (marriage, divorce, inheritance, adoption) differ as per the religion of the individual. In this framework, matters of inheritance of property amongst Hindus, Buddhists, Jains and Sikhs are governed by the Hindu Succession Act, 1956 (HSA). This legislation applies to the transmission of all assets owned by Hindus. The provisions of the HSA discriminate against Hindu women by prescribing different rules for devolution of property held by men and women. These provisions have the effect of excessively, and unfairly prioritising the husband's family in the scheme of devolution as compared to the woman's own family, even when the property belongs to the woman. The legislation is a product of an era when it was inconceivable for Indian women to own and acquire property. However, these biases continue to be perpetrated upon Hindu women in India today. This discrimination is ultra vires of Articles 14 and 15 of the Constitution of India, it violates India's commitments under the United Nations Convention on the Elimination of All Forms of Discrimination Against Women, and leads to several undesirable consequences especially in cases where the property in question is acquired by the woman through her own skill or effort. Indian legislation such as the Goa Succession, Special Notaries and Inventory Proceeding Act, 2012 (GSSNIP) and Indian Succession Act, 1925 (ISA), and succession laws of developed countries are far more gender-equitable, and can serve as an inspiration for eliminating the gender-discrimination in the HSA. The efforts, so far, to reform the HSA on this particular matter have been myopic at best. We provide a principles-based approach to comprehensively amend the HSA, to remove the gender discrimination in devolution of property. We propose a draft amendment to the HSA to effect this reform.
                </p>
            </li>
            <li>
                <strong>Co-author, The Unrealized Potential of Judicial Data in India</strong>, 
                <a href="https://indianexpress.com/article/opinion/the-unrealised-potential-of-judicial-data-7110258/" target="_blank" rel="noopener noreferrer">
                    Indian Express, 2020
                </a>
            </li>
        </ul>
    `;
}

function buildSite() {
    console.log('Building static site...');
    
    // Get all markdown files
    const files = fs.readdirSync(articlesDir).filter(file => path.extname(file) === '.md');
    const articles = [];
    
    // Process each article
    files.forEach(file => {
        const filePath = path.join(articlesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const slug = path.basename(file, '.md');
        
        // Fix image paths in markdown
        const fixedContent = content.replace(/!\[([^\]]*)\]\(\.\/articles\/([^)]+)\)/g, '![$1](articles/$2)');
        
        const title = extractTitle(content);
        const excerpt = extractExcerpt(content);
        const html = marked.parse(fixedContent);
        
        // Create article data
        const article = {
            slug,
            title,
            excerpt,
            filename: file,
            lastModified: fs.statSync(filePath).mtime
        };
        articles.push(article);
        
        // Generate article HTML file
        const articleTemplate = getTemplate('article');
        const articleHtml = articleTemplate
            .replace('{{title}}', title)
            .replace('{{content}}', html);
        
        fs.writeFileSync(path.join(outputDir, `${slug}.html`), articleHtml);
        console.log(`Generated ${slug}.html`);
    });
    
    // Sort articles by date (newest first)
    articles.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    
    // Generate articles list HTML
    const articlesHtml = articles.map(article => `
        <div class="article-card">
            <h3 class="article-title"><a href="${article.slug}.html" style="text-decoration: none; color: inherit;">${article.title}</a></h3>
            <p class="article-excerpt">${article.excerpt}</p>
            <a href="${article.slug}.html" class="read-more">Read More →</a>
        </div>
    `).join('');
    
    // Generate index.html with About content
    const indexTemplate = getTemplate('index');
    const indexHtml = indexTemplate
        .replace('{{content}}', getAboutContent())
        .replace('{{articles}}', articlesHtml);
    fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml);
    
    // Generate blog.html (same as index but different title)
    const blogTemplate = getTemplate('blog');
    const blogHtml = blogTemplate.replace('{{articles}}', articlesHtml);
    fs.writeFileSync(path.join(outputDir, 'blog.html'), blogHtml);
    
    // Generate about.html (same as index)
    fs.writeFileSync(path.join(outputDir, 'about.html'), indexHtml);
    
    // Generate research.html
    const researchTemplate = getTemplate('article');
    const researchHtml = researchTemplate
        .replace('{{title}}', 'Research')
        .replace('{{content}}', getResearchContent())
        .replace('<a href="blog.html" class="back-link">← Back to Blog</a>', '');
    fs.writeFileSync(path.join(outputDir, 'research.html'), researchHtml);
    
    console.log(`\nBuild complete! Generated ${articles.length} articles.`);
    console.log('Files created:');
    console.log('  - index.html (home page with about content)');
    console.log('  - about.html (standalone about page)');
    console.log('  - blog.html (blog listing)');
    console.log('  - research.html (research page)');
    articles.forEach(article => {
        console.log(`  - ${article.slug}.html (${article.title})`);
    });
    console.log('\nTo serve locally: npx serve dist');
}

buildSite(); 