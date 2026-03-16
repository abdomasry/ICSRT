const fs = require('fs');
const path = require('path');

// Local JSON file for articles storage
const articlesFile = path.join(__dirname, 'research-articles-data.json');

// Initialize research articles data
function initializeResearchArticlesData() {
  try {
    if (!fs.existsSync(articlesFile)) {
      console.log('📝 Creating research articles data file...');
      
      const defaultArticles = {
        articles: [
          {
            _id: "article_1",
            title: "Effective Research Methodology for Modern Academic Studies",
            subtitle: "A Comprehensive Guide to Contemporary Research Practices",
            content: `Research methodology has evolved significantly in the digital age, requiring scholars to adapt traditional approaches while embracing innovative techniques. This comprehensive guide explores the fundamental principles and cutting-edge practices that define effective research in today's academic landscape.

## Understanding Modern Research Paradigms

Contemporary research methodology extends beyond traditional quantitative and qualitative approaches, incorporating mixed-methods designs that leverage the strengths of multiple research paradigms. Researchers must now consider digital literacy, data ethics, and interdisciplinary collaboration as core components of their methodological framework.

## Data Collection in the Digital Era

The proliferation of digital tools has transformed data collection processes. From online surveys and social media analytics to IoT sensors and mobile applications, researchers have access to unprecedented volumes of real-time data. However, this abundance requires careful consideration of data quality, privacy, and ethical implications.

## Ethical Considerations and Best Practices

Modern research ethics encompass traditional concerns about participant welfare while addressing new challenges posed by digital technologies. Issues such as data ownership, algorithmic bias, and informed consent in digital environments require careful navigation and institutional review.

## Technology Integration and Analysis

Advanced statistical software, machine learning algorithms, and cloud-based collaboration platforms have become integral to research processes. Researchers must develop technological competencies while maintaining critical thinking about the limitations and assumptions inherent in these tools.`,
            excerpt: "Discover comprehensive methodologies for conducting rigorous academic research in the digital age. Learn about mixed-methods approaches, data collection strategies, and ethical considerations that form the foundation of credible scientific inquiry.",
            author: "Dr. Sarah Chen",
            authorTitle: "Director of Research Methodology, ICSRT",
            publishedDate: "2024-12-15",
            readTime: "8 min read",
            tags: ["Research Methodology", "Academic Studies", "Digital Research", "Ethics"],
            category: "Methodology",
            language: "en",
            featured: true,
            imageUrl: "/images/research-methodology.jpg",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: "article_2",
            title: "The Art of Scientific Translation: Bridging Languages in Research",
            subtitle: "Navigating Linguistic Precision in Academic Communication",
            content: `Scientific translation represents a specialized field where linguistic expertise meets domain-specific knowledge. As research becomes increasingly global, the ability to accurately convey scientific concepts across languages has become essential for knowledge dissemination and international collaboration.

## The Complexity of Scientific Language

Scientific texts present unique challenges for translators, characterized by specialized terminology, complex syntactic structures, and culture-specific conventions. Unlike general translation, scientific translation requires deep understanding of subject matter, research methodology, and disciplinary discourse conventions.

## Terminology Management and Consistency

Maintaining terminological accuracy across languages requires systematic approaches to term management. Translators must navigate evolving scientific vocabularies, standardized nomenclatures, and discipline-specific conventions while ensuring consistency throughout complex documents.

## Cultural and Contextual Considerations

Scientific communication styles vary significantly across cultures and languages. Effective translation must account for rhetorical preferences, citation practices, and cultural assumptions about knowledge construction and presentation.

## Technology and Translation Quality

Computer-assisted translation tools, terminology databases, and machine learning systems have transformed scientific translation practices. However, human expertise remains crucial for quality assurance, contextual understanding, and nuanced interpretation of complex scientific concepts.

## Best Practices for Scientific Translation

Quality scientific translation requires systematic approaches including collaborative review processes, subject matter expert consultation, and rigorous quality control measures. Establishing clear guidelines and maintaining ongoing professional development ensures translation accuracy and reliability.`,
            excerpt: "Explore the specialized field of scientific translation where precision meets linguistic expertise. Understanding terminology, cultural nuances, and maintaining scientific accuracy across language barriers in academic publications.",
            author: "Prof. Ahmed El-Rashid",
            authorTitle: "Head of Translation Studies, ICSRT",
            publishedDate: "2024-12-10",
            readTime: "10 min read",
            tags: ["Scientific Translation", "Academic Writing", "Linguistics", "International Research"],
            category: "Translation",
            language: "en",
            featured: true,
            imageUrl: "/images/scientific-translation.jpg",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: "article_3",
            title: "Digital Tools and Resources for Contemporary Research",
            subtitle: "Leveraging Technology for Enhanced Research Efficiency",
            content: `The digital revolution has fundamentally transformed research practices, providing scholars with powerful tools for data collection, analysis, collaboration, and dissemination. Understanding and effectively utilizing these technologies has become essential for conducting competitive, high-quality research.

## Research Management and Organization

Digital project management tools enable researchers to organize complex, multi-phase projects while maintaining collaboration with distributed teams. Cloud-based platforms facilitate real-time collaboration, version control, and secure data sharing across institutional boundaries.

## Data Collection and Analysis Technologies

Modern researchers have access to sophisticated data collection methods including web scraping tools, API integrations, sensor networks, and mobile applications. Advanced analytics platforms powered by artificial intelligence and machine learning enable complex pattern recognition and predictive modeling.

## Citation Management and Academic Writing

Reference management systems have evolved beyond simple citation formatting to include collaborative features, PDF annotation, research networking, and integration with academic databases. These tools streamline the writing process while ensuring bibliographic accuracy and consistency.

## Visualization and Presentation Tools

Data visualization technologies enable researchers to create compelling, interactive presentations of complex findings. From statistical plotting packages to interactive web-based dashboards, these tools enhance both analysis capabilities and communication effectiveness.

## Open Science and Reproducible Research

Digital platforms support open science initiatives through data repositories, code sharing platforms, and collaborative research environments. These tools promote transparency, reproducibility, and accelerated knowledge transfer across research communities.

## Emerging Technologies and Future Directions

Artificial intelligence, blockchain technologies, and virtual reality platforms represent emerging opportunities for research innovation. Understanding these technologies' potential applications and limitations positions researchers for future developments in their fields.`,
            excerpt: "Navigate the landscape of modern research tools including AI-powered analysis, cloud-based collaboration platforms, citation management systems, and data visualization techniques that enhance research quality and efficiency.",
            author: "Dr. Maria Rodriguez",
            authorTitle: "Digital Research Specialist, ICSRT",
            publishedDate: "2024-12-05",
            readTime: "12 min read",
            tags: ["Digital Tools", "Research Technology", "Data Analysis", "Academic Software"],
            category: "Technology",
            language: "en",
            featured: true,
            imageUrl: "/images/digital-research-tools.jpg",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: "article_4",
            title: "Grant Writing Excellence: Securing Funding for Research Projects",
            subtitle: "Strategic Approaches to Competitive Research Funding",
            content: `Successful grant writing requires strategic thinking, clear communication, and deep understanding of funding landscapes. As research funding becomes increasingly competitive, scholars must develop sophisticated approaches to proposal development and stakeholder engagement.

## Understanding Funding Ecosystems

Research funding comes from diverse sources including government agencies, private foundations, industry partnerships, and international organizations. Each funding source has specific priorities, evaluation criteria, and application requirements that must be carefully considered during proposal development.

## Proposal Structure and Narrative Development

Effective research proposals tell compelling stories that connect research questions to broader societal needs. Successful proposals demonstrate clear problem identification, innovative methodological approaches, realistic timelines, and measurable outcomes.

## Budget Development and Resource Planning

Accurate budget development requires careful consideration of personnel costs, equipment needs, indirect expenses, and contingency planning. Understanding institutional policies and funder requirements ensures budget accuracy and compliance.

## Collaboration and Team Building

Modern research increasingly requires interdisciplinary collaboration and international partnerships. Building effective research teams involves strategic partner selection, clear role definition, and robust communication frameworks.

## Review Process Navigation

Understanding peer review processes, reviewer perspectives, and evaluation criteria enhances proposal competitiveness. Successful applicants develop strategies for addressing reviewer concerns and presenting compelling cases for research significance.`,
            excerpt: "Master the art of grant writing with strategic approaches to funding applications, budget development, and stakeholder engagement that increase success rates in competitive research environments.",
            author: "Dr. James Thompson",
            authorTitle: "Research Development Director, ICSRT",
            publishedDate: "2024-11-28",
            readTime: "15 min read",
            tags: ["Grant Writing", "Research Funding", "Academic Career", "Proposal Development"],
            category: "Professional Development",
            language: "en",
            featured: false,
            imageUrl: "/images/grant-writing.jpg",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: "article_5",
            title: "Publishing Strategies for Academic Success",
            subtitle: "Navigating the Modern Academic Publishing Landscape",
            content: `Academic publishing has undergone significant transformation with the rise of open access models, digital platforms, and alternative metrics. Understanding these changes and developing strategic approaches to publication is essential for research impact and career advancement.

## Journal Selection and Impact Assessment

Choosing appropriate publication venues requires careful consideration of journal scope, audience, impact metrics, and open access policies. Understanding journal ranking systems, citation patterns, and disciplinary conventions guides strategic publication decisions.

## Manuscript Preparation and Quality Enhancement

High-quality manuscripts require systematic approaches to writing, revision, and presentation. Effective authors develop workflows that incorporate peer feedback, professional editing, and compliance with journal requirements.

## Peer Review Process and Response Strategies

Understanding peer review processes and developing effective response strategies enhances publication success rates. Successful authors view peer review as collaborative improvement rather than adversarial evaluation.

## Open Access and Digital Publishing

Open access publishing models offer increased visibility and citation potential while requiring careful consideration of costs, copyright, and repository requirements. Understanding these models enables strategic decision-making about publication pathways.

## Alternative Publication Formats

Emerging publication formats including preprints, data papers, and multimedia publications offer new opportunities for research dissemination. Understanding these alternatives expands options for sharing research findings with diverse audiences.`,
            excerpt: "Navigate the evolving academic publishing landscape with strategic approaches to journal selection, manuscript preparation, and open access considerations for maximum research impact.",
            author: "Dr. Lisa Wang",
            authorTitle: "Academic Publishing Consultant, ICSRT",
            publishedDate: "2024-11-20",
            readTime: "11 min read",
            tags: ["Academic Publishing", "Journal Selection", "Open Access", "Research Impact"],
            category: "Publishing",
            language: "en",
            featured: false,
            imageUrl: "/images/academic-publishing.jpg",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      };
      
      fs.writeFileSync(articlesFile, JSON.stringify(defaultArticles, null, 2));
      console.log('✅ Default research articles created successfully!');
    } else {
      console.log('✅ Research articles data file already exists');
    }
  } catch (error) {
    console.error('❌ Error initializing research articles data:', error);
  }
}

// Helper functions for articles operations
function readArticlesData() {
  try {
    const data = fs.readFileSync(articlesFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading articles data:', error);
    return { articles: [] };
  }
}

function writeArticlesData(data) {
  try {
    fs.writeFileSync(articlesFile, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing articles data:', error);
    return false;
  }
}

// Articles API Functions
const articlesAPI = {
  // GET all articles
  getAll: async (req, res) => {
    try {
      console.log('📡 GET /api/articles - Fetching all articles');
      
      const data = readArticlesData();
      const articles = data.articles || [];
      
      // Parse query parameters
      const limit = parseInt(req.query.limit) || null;
      const featured = req.query.featured === 'true';
      const category = req.query.category;
      const language = req.query.language || 'en';
      
      // Filter articles
      let filteredArticles = articles.filter(article => article.language === language);
      
      if (featured) {
        filteredArticles = filteredArticles.filter(article => article.featured);
      }
      
      if (category) {
        filteredArticles = filteredArticles.filter(article => 
          article.category.toLowerCase() === category.toLowerCase()
        );
      }
      
      // Sort by published date (newest first)
      filteredArticles.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
      
      // Apply limit if specified
      if (limit) {
        filteredArticles = filteredArticles.slice(0, limit);
      }
      
      console.log(`✅ Found ${filteredArticles.length} articles`);
      
      res.json({
        success: true,
        data: filteredArticles,
        count: filteredArticles.length,
        total: articles.length
      });
    } catch (error) {
      console.error('❌ Error fetching articles:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to fetch articles'
      });
    }
  },

  // GET single article
  getById: async (req, res) => {
    try {
      console.log(`📡 GET /api/articles/${req.params.id}`);
      
      const data = readArticlesData();
      const article = data.articles.find(article => article._id === req.params.id);
      
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }
      
      res.json({
        success: true,
        data: article
      });
    } catch (error) {
      console.error('❌ Error fetching article:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET featured articles for homepage
  getFeatured: async (req, res) => {
    try {
      console.log('📡 GET /api/articles/featured - Fetching featured articles');
      
      const data = readArticlesData();
      const featuredArticles = data.articles
        .filter(article => article.featured && article.language === (req.query.language || 'en'))
        .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate))
        .slice(0, 3);
      
      console.log(`✅ Found ${featuredArticles.length} featured articles`);
      
      res.json({
        success: true,
        data: featuredArticles,
        count: featuredArticles.length
      });
    } catch (error) {
      console.error('❌ Error fetching featured articles:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to fetch featured articles'
      });
    }
  }
};

// Initialize data when module loads
initializeResearchArticlesData();

module.exports = {
  articlesAPI,
  initializeResearchArticlesData
};
