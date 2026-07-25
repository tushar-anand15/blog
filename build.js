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

// Copy CV assets (PDF download)
if (fs.existsSync('./public/cv')) {
    fs.cpSync('./public/cv', path.join(outputDir, 'cv'), { recursive: true });
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

function extractKeywords(content, title) {
    // Common stop words to filter out
    const stopWords = new Set([
        'a', 'an', 'and', 'the', 'is', 'it', 'you', 'that', 'this', 'to', 'for',
        'of', 'on', 'in', 'with', 'as', 'at', 'by', 'from', 'up', 'about', 'into',
        'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'must', 'can', 'could', 'what', 'which', 'who',
        'when', 'where', 'why', 'how', 'all', 'each', 'every', 'some', 'few', 'more',
        'most', 'other', 'such', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
        'just', 'but', 'or', 'if', 'then', 'else', 'are', 'was', 'were', 'been'
    ]);
    
    // Clean content
    let text = content.toLowerCase();
    text = text.replace(/^#\s+.+/gm, ''); // Remove headers
    text = text.replace(/!\[.*?\]\(.*?\)/g, ''); // Remove images
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Extract link text
    text = text.replace(/[^a-z0-9\s-]/g, ' '); // Remove special chars
    
    // Extract words
    const words = text.split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));
    
    // Count word frequency
    const wordFreq = {};
    words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    // Sort by frequency and get top keywords
    const keywords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);
    
    // Add important words from title
    const titleWords = title.toLowerCase().split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));
    
    // Combine and deduplicate
    const finalKeywords = [...new Set([...titleWords, ...keywords])].slice(0, 12);
    
    return finalKeywords.join(', ');
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
    <meta name="description" content="{{excerpt}}">
    <meta name="author" content="Tushar Anand">
    <meta name="keywords" content="{{keywords}}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="{{title}}">
    <meta property="og:description" content="{{excerpt}}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://tusharanand.com/{{slug}}.html">
    <meta property="og:image" content="https://tusharanand.com/profilepic.jpg">
    <meta property="og:site_name" content="Tushar's Blog">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{title}}">
    <meta name="twitter:description" content="{{excerpt}}">
    <meta name="twitter:image" content="https://tusharanand.com/profilepic.jpg">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://tusharanand.com/{{slug}}.html">
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="alternate icon" href="/favicon.ico">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "{{title}}",
        "description": "{{excerpt}}",
        "author": {
            "@type": "Person",
            "name": "Tushar Anand",
            "url": "https://tusharanand.com/",
            "jobTitle": "Data & AI Engineer",
            "worksFor": {
                "@type": "Organization",
                "name": "Vidhi Centre for Legal Policy"
            }
        },
        "datePublished": "{{publishDate}}",
        "dateModified": "{{modifiedDate}}",
        "publisher": {
            "@type": "Person",
            "name": "Tushar Anand"
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://tusharanand.com/{{slug}}.html"
        },
        "keywords": "{{keywords}}"
    }
    </script>
    
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
        .article-meta { color: #666; margin-bottom: 30px; font-size: 0.9em; display: flex; gap: 20px; align-items: center; }
        .article-meta span { display: flex; align-items: center; gap: 5px; }
        .cv-header { margin-bottom: 30px; }
        .cv-tagline { font-size: 1.15em; color: #333; margin: 0 0 10px 0; }
        .cv-contact { color: #666; font-size: 0.95em; margin: 0 0 15px 0; }
        .cv-contact a { color: #FF8C00; text-decoration: none; }
        .cv-contact a:hover { text-decoration: underline; }
        .cv-download { display: inline-block; background-color: #FF8C00; color: #fff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; }
        .cv-download:hover { background-color: #e67e00; }
        .cv-role { margin-bottom: 24px; }
        .cv-role h3 { margin: 0 0 2px 0; color: #333; }
        .cv-meta { color: #999; font-size: 0.9em; margin: 0 0 8px 0; }
        .article-content ul { padding-left: 22px; }
        .article-content li { margin-bottom: 6px; }
        .cv-skills li { margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Tushar Anand</h1>
        <nav class="nav">
            <a href="index.html">Home</a>
            <a href="blog.html">Blog</a>
            <a href="cv.html">CV</a>
            <a href="research.html">Research</a>
        </nav>
    </div>
    <a href="blog.html" class="back-link">← Back to Blog</a>
    <div class="article-content">
        <h1>{{title}}</h1>
        <div class="article-meta">
            <span>📅 {{publishDateFormatted}}</span>
            <span>✍️ Tushar Anand</span>
        </div>
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
    <title>Tushar Anand — Public Data, Civic Tech & Applied AI</title>
    <meta name="description" content="Tushar Anand — I turn India's messy public data into usable datasets, APIs, and tools. Writing on open public data, civic tech, and applied AI.">
    <meta name="author" content="Tushar Anand">
    <meta name="keywords" content="AI research, machine learning, data engineering, web scraping, research, public policy, data analysis, Tushar Anand">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="Tushar Anand — Public Data, Civic Tech & Applied AI">
    <meta property="og:description" content="Tushar Anand — I turn India's messy public data into usable datasets, APIs, and tools. Writing on open public data, civic tech, and applied AI.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://tusharanand.com/">
    <meta property="og:image" content="https://tusharanand.com/profilepic.jpg">
    <meta property="og:site_name" content="Tushar's Blog">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Tushar Anand — Public Data, Civic Tech & Applied AI">
    <meta name="twitter:description" content="Tushar Anand — I turn India's messy public data into usable datasets, APIs, and tools. Writing on open public data, civic tech, and applied AI.">
    <meta name="twitter:image" content="https://tusharanand.com/profilepic.jpg">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://tusharanand.com/">
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="alternate icon" href="/favicon.ico">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Tushar's Blog",
        "description": "Tushar Anand — I turn India's messy public data into usable datasets, APIs, and tools.",
        "url": "https://tusharanand.com/",
        "author": {
            "@type": "Person",
            "name": "Tushar Anand",
            "jobTitle": "Data & AI Engineer",
            "worksFor": {
                "@type": "Organization",
                "name": "Vidhi Centre for Legal Policy"
            }
        }
    }
    </script>
    
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
        .article-meta-preview { color: #999; font-size: 0.85em; margin: 5px 0 10px 0; }
        .article-excerpt { color: #666; margin: 10px 0; }
        .read-more { color: #FF8C00; font-weight: bold; text-decoration: none; }
        .read-more:hover { text-decoration: underline; }
        .section-intro { color: #666; margin: 5px 0 20px 0; }
        .project-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .project-card { background-color: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
        .project-card h3 { margin: 0 0 10px 0; color: #333; }
        .project-card p { color: #555; margin: 0 0 12px 0; }
        .project-links { display: flex; flex-wrap: wrap; gap: 6px 16px; }
        .project-links a { color: #FF8C00; font-weight: bold; text-decoration: none; white-space: nowrap; }
        .project-links a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Tushar Anand</h1>
        <nav class="nav">
            <a href="index.html">Home</a>
            <a href="blog.html">Blog</a>
            <a href="cv.html">CV</a>
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
                <h2>Hi, I'm Tushar</h2>
                <p>
                    I make India's public data <em>usable</em>. Most of it is technically public but locked inside messy PDFs, unreliable portals, and un-queryable government websites. I build the scrapers, pipelines, databases, and APIs that turn that raw mess into structured, searchable data &mdash; and increasingly, applied-AI layers on top so people can actually ask questions of it.
                </p>
                <p>
                    Right now I'm a Senior Technical Consultant at the <strong>Vidhi Centre for Legal Policy</strong>, making India's primary legal sources structured, searchable, and machine-readable &mdash; a bilingual pipeline normalizing ~15,000 Tamil Nadu Gazette issues, a legislation tracker consolidating 970 acts with their amendment histories, and a retrieval layer (local embeddings + reciprocal rank fusion, exposed over an MCP server) across a corpus of 15M+ documents. Earlier I worked on data and legal-policy research at the National Institute of Public Finance and Policy (NIPFP) and XKDR Forum.
                </p>
                <p>
                    I hold a master's in Urban Policy and Governance from the Tata Institute of Social Sciences, Mumbai, and a bachelor's in Economics, Political Science, and Sociology from Christ University, Bangalore. My <a href="cv.html">full CV is here</a>, and my code is on <a href="https://github.com/tushar-anand15" target="_blank" rel="noopener noreferrer">GitHub</a>.
                </p>
            </div>
        </div>

        <h2>Selected work</h2>
        <p class="section-intro">Open-source projects turning India's public data into something you can actually use. More on <a href="https://github.com/tushar-anand15" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
        <div class="project-grid">
            <div class="project-card">
                <h3>Parliament data — database &amp; API</h3>
                <p>A REST API over Indian parliamentary proceedings (questions, debates, sessions) scraped from sansad.in, plus a web frontend. The full data &rarr; API &rarr; UI stack.</p>
                <p class="project-links">
                    <a href="https://github.com/tushar-anand15/parliament_proceedings" target="_blank" rel="noopener noreferrer">parliament_proceedings ↗</a>
                    <a href="https://github.com/tushar-anand15/open_sansad" target="_blank" rel="noopener noreferrer">open_sansad ↗</a>
                </p>
            </div>
            <div class="project-card">
                <h3>GramSAMBANDH — local-governance search</h3>
                <p>Search and conversational Q&amp;A over Kerala municipal &amp; panchayat project records &mdash; bilingual (Malayalam + English) hybrid retrieval with page-level citations over documents that are public but unreadable at scale.</p>
                <p class="project-links">
                    <a href="https://github.com/tushar-anand15/sambandh-app" target="_blank" rel="noopener noreferrer">sambandh-app ↗</a>
                    <a href="https://github.com/tushar-anand15/sambandh-preprocessing" target="_blank" rel="noopener noreferrer">sambandh-preprocessing ↗</a>
                </p>
            </div>
            <div class="project-card">
                <h3>Court &amp; public-data scrapers</h3>
                <p>A toolkit of scrapers that build structured datasets from Indian legal and public sources &mdash; the tribunals, high courts, and the Constitution. One powered a published study on court vacations at the Bombay High Court.</p>
                <p class="project-links">
                    <a href="https://github.com/tushar-anand15/nclt-scraper" target="_blank" rel="noopener noreferrer">NCLT ↗</a>
                    <a href="https://github.com/tushar-anand15/nclat" target="_blank" rel="noopener noreferrer">NCLAT ↗</a>
                    <a href="https://github.com/tushar-anand15/itat" target="_blank" rel="noopener noreferrer">ITAT ↗</a>
                    <a href="https://github.com/tushar-anand15/bombay_hc" target="_blank" rel="noopener noreferrer">Bombay HC ↗</a>
                    <a href="https://github.com/tushar-anand15/constitution_parser" target="_blank" rel="noopener noreferrer">Constitution ↗</a>
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

function getProfileContent() {
    return `
        <div class="cv-header">
            <p class="cv-tagline">I make India's public data usable — data engineering, ETL pipelines, and applied AI over messy public sources.</p>
            <p class="cv-contact">
                <a href="https://github.com/tushar-anand15" target="_blank" rel="noopener noreferrer">GitHub</a> ·
                <a href="https://www.linkedin.com/in/tushar-anand1594" target="_blank" rel="noopener noreferrer">LinkedIn</a> ·
                <a href="mailto:tusharanand1594@gmail.com">tusharanand1594@gmail.com</a> ·
                Bengaluru, India
            </p>
            <p><a class="cv-download" href="cv/CV_TusharAnand.pdf" download>⬇ Download CV (PDF)</a></p>
        </div>

        <h2>Summary</h2>
        <p>
            Engineer with 7+ years turning India's fragmented public data into structured, queryable systems — building scrapers, ETL pipelines, databases, and APIs, and layering production-scale LLM and machine-learning systems on top. I've shipped retrieval over 15M+ documents, cut inference costs by 75%, and compressed expert workflows from weeks to hours, blending backend and ML engineering with an applied-research background in quantitative methods.
        </p>

        <h2>Career highlights</h2>
        <ul>
            <li>Built AI systems processing 15M+ documents</li>
            <li>Reduced token costs by 75%</li>
            <li>Improved validation turnaround from one month to five hours</li>
            <li>Built multilingual AI for 8 Indian languages</li>
            <li>Winner — Agami Data for Justice Challenge 2019</li>
            <li>Publication in the Indian Law Review</li>
            <li>AI platform in demo at the Karnataka High Court</li>
        </ul>

        <h2>Experience</h2>

        <div class="cv-role">
            <h3>Senior Technical Consultant — Vidhi Centre for Legal Policy</h3>
            <p class="cv-meta">June 2026 – Present · Remote</p>
            <p>Applying AI and data engineering to make India's primary legal sources structured, searchable, and machine-readable.</p>
            <ul>
                <li>Designed and deployed a bilingual Tamil–English scraper and ingestion pipeline normalizing ~15,000 Tamil Nadu Gazette issues since 2008.</li>
                <li>Built a legislation tracker consolidating 970 acts with their full amendment histories into a machine-readable format.</li>
                <li>Built a RAG query layer over the normalized corpus using local embeddings and reciprocal rank fusion, exposed via an MCP server for structured querying by LLM agents.</li>
            </ul>
        </div>

        <div class="cv-role">
            <h3>Founding AI Engineer — Superjoin.AI</h3>
            <p class="cv-meta">Jan – June 2026 · Bangalore</p>
            <p>Founding engineer on the AI team, building the agentic harness and agent workflows across the platform.</p>
            <ul>
                <li><strong>DRHP Validation Platform</strong> — automated validation of Draft Red Herring Prospectuses (preliminary IPO filings to SEBI), cross-verifying financial figures against CA certificates and restated statements; analyst-grade first drafts at 88% accuracy, cutting turnaround from a month to five hours.</li>
                <li><strong>Agent memory</strong> — a two-tier system (persistent user profiles + task-level memories) exposed as a tool with relevance-judged retrieval, cutting tool calls on long-running tasks by 10%.</li>
                <li><strong>Evaluation</strong> — 15 handcrafted test cases with LLM-as-judge plus precision/recall, cutting new-model validation from three days to one.</li>
            </ul>
        </div>

        <div class="cv-role">
            <h3>AI Research Scientist — Jhana.ai</h3>
            <p class="cv-meta">Oct 2024 – Dec 2025 · Bangalore</p>
            <p>AI research and product across legal tech, courtroom automation, and multilingual transcription.</p>
            <ul>
                <li><strong>Paralegal</strong> — an agentic legal chatbot with hybrid retrieval (BM25 + vector + knowledge graphs) over 15M+ documents; cut token costs 75% and quadrupled multimodal throughput; React/TypeScript frontend with click-through citations.</li>
                <li><strong>Courtroom</strong> — an AI courtroom-automation platform now in demo at the Karnataka High Court; ingestion for 2,000+ daily case dockets and automated headnote generation preferred 80% of the time in a 200-participant study.</li>
                <li><strong>National judicial data pipeline</strong> — ingestion backend scraping all judicial sources at 15M+ scale, with daily-refreshed Elasticsearch and FAISS indices serving 5,000+ users.</li>
                <li><strong>Steno</strong> — a transcription tool tuning STT/ASR for 8 Indian languages and legal vocabulary on noisy courtroom audio.</li>
            </ul>
        </div>

        <div class="cv-role">
            <h3>Research Consultant, Legal Systems — XKDR Forum</h3>
            <p class="cv-meta">Jan 2022 – Oct 2025 · Mumbai</p>
            <ul>
                <li>Built an ETL pipeline extracting and structuring commercial case data from the Bombay High Court.</li>
                <li>Scraped and processed 5,000+ PDF orders from the Bombay High Court and Debt Recovery Tribunals into a research dataset.</li>
                <li>Classified case orders as substantive/non-substantive with deep learning at 85% accuracy; ran survival analysis on case-disposal and hearing timelines.</li>
            </ul>
        </div>

        <div class="cv-role">
            <h3>Research Fellow — National Institute of Public Finance and Policy (NIPFP)</h3>
            <p class="cv-meta">Mar 2019 – Nov 2021 · New Delhi</p>
            <ul>
                <li>Won the Agami Data for Justice Challenge 2019 by building and openly releasing a 1M-case district-courts dataset (hosted at The Justice Hub); findings presented to the Delhi High Court e-Courts Committee.</li>
                <li>Extracted and processed 6,731 ITAT orders for a transfer-pricing study using NLP and regex-based text mining.</li>
                <li>Analyzed NASA VIIRS nightlights and forest-fire satellite data as remote-sensing proxies for economic activity in fiscal-policy research.</li>
            </ul>
        </div>

        <h2>Skills</h2>
        <ul class="cv-skills">
            <li><strong>Languages:</strong> Python, JavaScript/TypeScript, SQL</li>
            <li><strong>Backend &amp; infra:</strong> Django, Flask, FastAPI, REST, async, Celery, SQS, Docker, Kubernetes, Nginx, pytest, CI/CD, Git</li>
            <li><strong>Data &amp; storage:</strong> PostgreSQL, Neo4j, Redis, Elasticsearch, ETL pipelines, Selenium, BeautifulSoup</li>
            <li><strong>ML &amp; NLP:</strong> PyTorch, TensorFlow, multilingual NLP, ASR/STT, VLMs, RAG, BM25, FAISS, agent evaluation, LangChain, Langfuse</li>
            <li><strong>Cloud:</strong> AWS (EC2, S3, Lambda), GCP, Linux</li>
        </ul>

        <h2>Selected publications</h2>
        <p>See the <a href="research.html">research page</a> for abstracts and links.</p>
        <ul>
            <li>Inheritance Rights of Transgender Persons in India — <em>Indian Law Review</em>, 2022</li>
            <li>Problems with eCourts Data — <em>NIPFP Working Paper</em>, 2020 (data-quality issues across 1M+ cases)</li>
            <li>Gender Discrimination in Property Devolution under the Hindu Succession Act — <em>NIPFP Working Paper</em>, 2020</li>
            <li>The Unrealized Potential of Judicial Data in India — <em>Indian Express</em>, 2020</li>
        </ul>

        <h2>Education</h2>
        <ul>
            <li><strong>MA, Urban Policy and Governance</strong> — Tata Institute of Social Sciences, Mumbai (2017–2019)</li>
            <li><strong>BA, Economics, Political Science &amp; Sociology</strong> — Christ University, Bangalore (2014–2017)</li>
        </ul>

        <h2>Certifications</h2>
        <ul>
            <li>TensorFlow Developer Professional, NLP, and Deep Learning Specializations — DeepLearning.AI</li>
            <li>Machine Learning Specialization — Stanford</li>
        </ul>
    `;
}

// Generate a clean static content page (Research, CV) from the article template,
// fully substituting/removing all placeholders so none leak into the output.
function generateStaticPage(slug, title, contentHtml, description) {
    const buildDate = new Date().toISOString();
    let pageHtml = getTemplate('article');
    pageHtml = pageHtml
        .replace(/\{\{title\}\}/g, title)
        .replace(/\{\{excerpt\}\}/g, description)
        .replace(/\{\{keywords\}\}/g, `Tushar Anand, ${title}, public data, civic tech`)
        .replace(/\{\{slug\}\}/g, slug)
        .replace(/\{\{publishDate\}\}/g, buildDate)
        .replace(/\{\{modifiedDate\}\}/g, buildDate)
        // Remove the article date/author meta block — not meaningful on static pages
        .replace(/<div class="article-meta">[\s\S]*?<\/div>/, '')
        .replace('{{content}}', contentHtml)
        .replace('<a href="blog.html" class="back-link">← Back to Blog</a>', '');
    fs.writeFileSync(path.join(outputDir, `${slug}.html`), pageHtml);
    console.log(`Generated ${slug}.html`);
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
            lastModified: fs.statSync(filePath).mtime,

            publishDate: fs.statSync(filePath).birthtime
        };
        articles.push(article);
        
        // Generate article HTML file
        const articleTemplate = getTemplate('article');
        const keywords = extractKeywords(content, title);

        const publishDate = new Date(fs.statSync(filePath).birthtime);
        const modifiedDate = new Date(fs.statSync(filePath).mtime);
        
        // Remove the title from the HTML content since we're displaying it separately
        const htmlWithoutTitle = html.replace(/<h1[^>]*>.*?<\/h1>/, '');
        
        const articleHtml = articleTemplate
            .replace(/{{title}}/g, title)
            .replace(/{{excerpt}}/g, excerpt)
            .replace(/{{keywords}}/g, keywords)
            .replace(/{{slug}}/g, slug)
            .replace('{{content}}', htmlWithoutTitle)
            .replace('{{publishDate}}', publishDate.toISOString())
            .replace('{{modifiedDate}}', modifiedDate.toISOString())
            .replace('{{publishDateFormatted}}', publishDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
;
        
        fs.writeFileSync(path.join(outputDir, `${slug}.html`), articleHtml);
        console.log(`Generated ${slug}.html`);
    });
    
    // Sort articles by date (newest first)
    articles.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    
    // Generate articles list HTML
    const articlesHtml = articles.map(article => {
        const publishDate = new Date(article.publishDate);
        const dateFormatted = publishDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        
        return `
        <div class="article-card">
            <h3 class="article-title"><a href="${article.slug}.html" style="text-decoration: none; color: inherit;">${article.title}</a></h3>
            <div class="article-meta-preview">
                <span>${dateFormatted}</span>
            </div>
            <p class="article-excerpt">${article.excerpt}</p>
            <a href="${article.slug}.html" class="read-more">Read More →</a>
        </div>
    `;
    }).join('');
    
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
    
    // Generate research.html (clean static page — no leftover placeholders)
    generateStaticPage('research', 'Research', getResearchContent(),
        'Publications and research by Tushar Anand on judicial data, court reform, and public policy.');

    // Generate cv.html (native profile page)
    generateStaticPage('cv', 'CV', getProfileContent(),
        "Tushar Anand's CV — data engineering, ETL pipelines, and applied AI over India's public data.");
    
    // Generate sitemap.xml
    generateSitemap(articles);
    
    // Update robots.txt
    updateRobotsTxt();
    
    console.log(`\nBuild complete! Generated ${articles.length} articles.`);
    console.log('Files created:');
    console.log('  - index.html (home page with about content)');
    console.log('  - about.html (standalone about page)');
    console.log('  - blog.html (blog listing)');
    console.log('  - research.html (research page)');
    console.log('  - sitemap.xml (for search engines)');
    console.log('  - robots.txt (updated with sitemap)');
    articles.forEach(article => {
        console.log(`  - ${article.slug}.html (${article.title})`);
    });
    console.log('\nTo serve locally: npx serve dist');
}

function generateSitemap(articles) {
    const baseUrl = 'https://tusharanand.com'; // TODO: Replace with your actual domain
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add main pages
    const mainPages = [
        { loc: '/', priority: '1.0', changefreq: 'weekly' },
        { loc: '/blog.html', priority: '0.9', changefreq: 'weekly' },
        { loc: '/cv.html', priority: '0.9', changefreq: 'monthly' },
        { loc: '/research.html', priority: '0.8', changefreq: 'monthly' },
        { loc: '/about.html', priority: '0.7', changefreq: 'monthly' }
    ];
    
    mainPages.forEach(page => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}${page.loc}</loc>\n`;
        sitemap += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
        sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
        sitemap += `    <priority>${page.priority}</priority>\n`;
        sitemap += '  </url>\n';
    });
    
    // Add article pages
    articles.forEach(article => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}/${article.slug}.html</loc>\n`;
        sitemap += `    <lastmod>${new Date(article.lastModified).toISOString().split('T')[0]}</lastmod>\n`;
        sitemap += `    <changefreq>monthly</changefreq>\n`;
        sitemap += `    <priority>0.6</priority>\n`;
        sitemap += '  </url>\n';
    });
    
    sitemap += '</urlset>';
    
    fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemap);
    console.log('Generated sitemap.xml');
}

function updateRobotsTxt() {
    const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

Sitemap: https://tusharanand.com/sitemap.xml
`;
    
    fs.writeFileSync(path.join(outputDir, 'robots.txt'), robotsTxt);
    console.log('Updated robots.txt');
}

buildSite(); 