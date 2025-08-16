import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';
import FloatingContactButton from '../components/FloatingContactButton';

export default function ArticleDetails() {
  const { id } = useParams();
  const { isRTL } = useLanguage();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    api.get(`/api/news/${encodeURIComponent(id)}`)
      .then((data) => { if (mounted) { setArticle(data); } })
      .catch((e) => { if (mounted) { setError(e.message || 'Failed to load article'); } })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  const title = isRTL ? (article?.titleAr || article?.title) : (article?.title);
  const subtitle = isRTL
    ? (article?.excerptAr || article?.descriptionAr || article?.subtitleAr || '')
    : (article?.excerpt || article?.description || article?.subtitle || '');
  const image = article?.image || article?.imageUrl;
  const content = isRTL
    ? (article?.contentAr || article?.bodyAr || article?.fullTextAr || '')
    : (article?.content || article?.body || article?.fullText || '');

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Hero header */}
      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link to="/articles" className="text-blue-600 hover:text-blue-800 font-semibold">{isRTL ? '← رجوع' : '← Back'}</Link>
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
              {error}
            </div>
          ) : (
            <>
              <h1 className={`text-3xl md:text-5xl font-extrabold text-blue-800 dark:text-blue-400 mb-3 ${isRTL ? 'font-arabic' : ''}`}>{title}</h1>
              {subtitle && (
                <p className={`text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-6 ${isRTL ? 'font-arabic leading-relaxed' : ''} break-words`}>{subtitle}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                {article?.author && (
                  <span>👤 {article.author}</span>
                )}
                {(article?.publishedAt || article?.createdAt) && (
                  <span>📅 {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                )}
                {article?.readTime && (<span>⏱️ {article.readTime}</span>)}
                {Array.isArray(article?.tags) && article.tags.length > 0 && (
                  <span>🏷️ {article.tags.slice(0,5).join(', ')}</span>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Cover image */}
      {!loading && !error && image && (
        <div className="px-4">
          <div className="max-w-5xl mx-auto mb-8">
            <img src={image} alt={title || 'Article image'} className="w-full h-auto rounded-2xl shadow-xl object-cover" onError={(e)=>{ e.target.style.display='none'; }} />
          </div>
        </div>
      )}

      {/* Content */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
              <div className="h-4 bg-gray-200 rounded w-3/6" />
            </div>
          ) : error ? null : (
            <article className={`prose max-w-none prose-blue dark:prose-invert ${isRTL ? 'prose-p:text-right prose-li:text-right' : ''}`}>
              {content ? (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700 whitespace-pre-line break-words leading-7 text-base">
                  {content}
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  {isRTL ? 'لا يوجد محتوى مفصل متاح لهذا المقال حالياً.' : 'No detailed content is available for this article yet.'}
                </p>
              )}
            </article>
          )}

          {/* Back CTA */}
          {!loading && !error && (
            <div className="mt-10">
              <Link to="/articles" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold">{isRTL ? 'عودة للمقالات' : 'Back to articles'}</Link>
            </div>
          )}
        </div>
      </section>

      <FloatingContactButton />
    </div>
  );
}
