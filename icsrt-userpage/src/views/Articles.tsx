'use client';
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import FloatingContactButton from "../components/FloatingContactButton";
import { api } from "../lib/api";

const Articles = () => {
  const { t, isRTL } = useLanguage();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterError, setNewsletterError] = useState('');

  // Helper function to safely extract articles from API response
  const extractArticlesFromResponse = (response) => {
    if (Array.isArray(response)) {
      return response;
    }
    if (response && typeof response === 'object') {
      return response.data || response.articles || response.news || [];
    }
    return [];
  };

  useEffect(() => {
    // Fetch articles/news from backend
    setLoading(true);
    setError(null);
    
    api.get('/news')
      .then((data) => {
        const articlesData = extractArticlesFromResponse(data);
        setArticles(articlesData);
        setLoading(false);
  setPage(1);
      })
      .catch((err) => {
        console.error("Error fetching articles:", err);
        setError(err.message);
        setLoading(false);
        setArticles([
          {
            title: "5 Tips for Excellence in Research Plan",
            titleAr: "5 نصائح للتميز في خطة البحث",
            excerpt: "The research plan is a brief summary of the research presented in a structural form that includes a set of elements such as the research problem and its dimensions and the approach followed in the research...",
            excerptAr: "خطة البحث هي ملخص موجز للبحث المقدم في شكل هيكلي يتضمن مجموعة من العناصر مثل مشكلة البحث وأبعادها والمنهج المتبع في البحث...",
            image: "/api/placeholder/400/250",
            date: "March 15, 2025",
            dateAr: "15 مارس 2025",
            readTime: "5 min read",
            readTimeAr: "5 دقائق قراءة"
          },
          {
            title: "6 Websites to Help You in Scientific Research Journey",
            titleAr: "6 مواقع لمساعدتك في رحلة البحث العلمي",
            excerpt: "Graduate, master's and doctoral students need guidance and support during the scientific research journey to complete it in the best way, so we present to you a group of websites that help you in that...",
            excerptAr: "يحتاج طلاب الدراسات العليا والماجستير والدكتوراه إلى التوجيه والدعم خلال رحلة البحث العلمي لإكمالها بأفضل طريقة، لذلك نقدم لكم مجموعة من المواقع التي تساعدكم في ذلك...",
            image: "/api/placeholder/400/250",
            date: "March 10, 2025",
            dateAr: "10 مارس 2025",
            readTime: "7 min read",
            readTimeAr: "7 دقائق قراءة"
          },
          {
            title: "How to Write a Research Paper Professionally",
            titleAr: "كيفية كتابة ورقة بحثية بشكل مهني",
            excerpt: "The research paper is a brief summary of the research presented in a structural form that includes a set of elements such as the research problem and its dimensions and the approach followed in the research...",
            excerptAr: "الورقة البحثية هي ملخص موجز للبحث المقدم في شكل هيكلي يتضمن مجموعة من العناصر مثل مشكلة البحث وأبعادها والمنهج المتبع في البحث...",
            image: "/api/placeholder/400/250",
            date: "March 5, 2025",
            dateAr: "5 مارس 2025",
            readTime: "8 min read",
            readTimeAr: "8 دقائق قراءة"
          }
        ]);
      });
  }, []);

  // Newsletter subscription function
  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    setNewsletterLoading(true);
    setNewsletterMessage('');
    setNewsletterError('');
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      setNewsletterError(isRTL ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
      setNewsletterLoading(false);
      return;
    }
    
    try {
      const data = await api.post('/newsletter/subscribe', {
        email: newsletterEmail,
        name: newsletterName,
        preferences: ['services', 'articles'],
        source: 'articles_page'
      });

      if (!data || data.error) {
        setNewsletterError(
          data?.error || 
          (isRTL ? 'فشل في الاشتراك، يرجى المحاولة مرة أخرى' : 'Subscription failed, please try again')
        );
      } else {
        setNewsletterMessage(
          isRTL 
            ? 'تم الاشتراك بنجاح! ستتلقى تحديثات حول الخدمات الجديدة والمقالات.'
            : 'Successfully subscribed! You\'ll receive updates about new services and articles.'
        );
        setNewsletterEmail('');
        setNewsletterName('');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setNewsletterError(
        isRTL 
          ? 'خطأ في الشبكة، يرجى المحاولة مرة أخرى' 
          : 'Network error, please try again'
      );
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Navigation */}

      {/* Header */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold text-blue-800 dark:text-blue-400 mb-6">{t('articles.title')}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t('articles.subtitle')}
          </p>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('msg.loading')}</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 dark:text-red-400">
                <h3 className="font-semibold">
                  {isRTL ? 'خطأ في تحميل المقالات' : 'Error loading articles'}
                </h3>
                <p className="text-sm mt-1">
                  {isRTL ? 'يتم عرض مقالات تجريبية بدلاً من ذلك' : 'Showing fallback articles instead'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Top meta + simple pager */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {isRTL ? 'إجمالي المقالات' : 'Total articles'}: <span className="font-semibold text-blue-600 dark:text-blue-400">{Array.isArray(articles) ? articles.length : 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg disabled:opacity-50"
                disabled={page <= 1}
              >
                {isRTL ? 'السابق' : 'Prev'}
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-200">
                {page} / {Math.max(1, Math.ceil((Array.isArray(articles) ? articles.length : 0) / pageSize))}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(Math.max(1, Math.ceil((Array.isArray(articles) ? articles.length : 0) / pageSize)), p + 1))}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg disabled:opacity-50"
                disabled={page >= Math.max(1, Math.ceil((Array.isArray(articles) ? articles.length : 0) / pageSize))}
              >
                {isRTL ? 'التالي' : 'Next'}
              </button>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }}
                className="ml-2 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              >
                {[6,9,12,18].map(s => (
                  <option key={s} value={s}>{s} / {isRTL ? 'صفحة' : 'page'}</option>
                ))}
              </select>
            </div>
          </div>

          {(() => {
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const list = (Array.isArray(articles) ? articles : []).slice(startIndex, endIndex);
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {list.map((article, index) => (
                  <div key={article._id || `${startIndex}-${index}` } className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {/* Article Image */}
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={article.image || article.imageUrl || "/api/placeholder/400/250"} 
                        alt={isRTL ? article.titleAr || article.title : article.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                      {article.category && (
                        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {article.category}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className={`flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {article.date || new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                        </span>
                        {article.author && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                              {article.author}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <Link to={`/articles/${article._id || article.id || index}`}>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3 line-clamp-2 break-words hover:text-blue-600 transition-colors">
                          {isRTL ? article.titleAr || article.title : article.title}
                        </h3>
                      </Link>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed break-words overflow-x-hidden">
                        {isRTL ? article.excerptAr || article.excerpt || article.descriptionAr || article.description || article.abstract 
                               : article.excerpt || article.description || article.abstract}
                      </p>
                      
                      {(article.tags && article.tags.length > 0) && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(Array.isArray(article.tags) ? article.tags : article.tags.split(',')).slice(0, 3).map((tag, i) => (
                            <span key={i} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <Link to={`/articles/${article._id || article.id || index}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors">
                          {t('articles.read.more')} {isRTL ? '←' : '→'}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Show message when no articles are available */}
                {(!Array.isArray(articles) || articles.length === 0) && !loading && (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      <h3 className="text-xl font-semibold mb-2">
                        {isRTL ? 'لا توجد مقالات متاحة حالياً' : 'No articles available at the moment'}
                      </h3>
                      <p>{isRTL ? 'يرجى المحاولة مرة أخرى لاحقاً' : 'Please try again later'}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-blue-600 dark:bg-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className={`text-4xl font-bold mb-6 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'ابقى على اطلاع' : 'Stay Updated'}
          </h2>
          <p className={`text-xl mb-8 ${isRTL ? 'font-arabic leading-relaxed' : ''}`}>
            {isRTL 
              ? 'احصل على أحدث التحديثات حول خدماتنا الجديدة والمقالات والمؤتمرات' 
              : 'Get the latest updates about our new services, articles, and conferences'
            }
          </p>
          
          <form 
            onSubmit={handleNewsletterSubscribe} 
            className={`space-y-4 max-w-lg mx-auto ${isRTL ? 'rtl' : 'ltr'}`}
          >
            <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <input 
                type="text"
                value={newsletterName}
                onChange={(e) => setNewsletterName(e.target.value)}
                placeholder={isRTL ? 'اسمك (اختياري)' : 'Your Name (optional)'}
                className={`flex-1 px-4 py-3 rounded-lg text-gray-800 placeholder-gray-500 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <input 
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={isRTL ? 'بريدك الإلكتروني *' : 'Your Email Address *'}
                required
                className={`flex-1 px-4 py-3 rounded-lg text-gray-800 placeholder-gray-500 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            
            <button 
              type="submit"
              disabled={newsletterLoading}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {newsletterLoading 
                ? (isRTL ? 'جاري الإرسال...' : 'Subscribing...') 
                : (isRTL ? 'اشترك في النشرة' : 'Subscribe to Newsletter')
              }
            </button>
          </form>
          
          {/* Success Message */}
          {newsletterMessage && (
            <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-lg max-w-lg mx-auto">
              <div className={`font-semibold ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                {newsletterMessage}
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {newsletterError && (
            <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-lg max-w-lg mx-auto">
              <div className={`font-semibold ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                {newsletterError}
              </div>
            </div>
          )}
          
          <p className={`text-sm mt-6 opacity-90 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL 
              ? 'سنرسل لك تحديثات حول الخدمات الجديدة والمقالات. يمكنك إلغاء الاشتراك في أي وقت.'
              : 'We\'ll send you updates about new services and articles. You can unsubscribe at any time.'
            }
          </p>
        </div>
      </section>
      
      {/* Floating Contact Button */}
      <FloatingContactButton />
    </div>
  );
};

export default Articles;
