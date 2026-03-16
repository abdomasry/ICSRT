import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import FloatingContactButton from "../components/FloatingContactButton";
import { api } from "../lib/api";

const FAQ = () => {
  const { t, isRTL } = useLanguage();
  const { isDarkMode } = useTheme();
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    // Fetch FAQ data from backend
    const fetchFAQ = async () => {
      try {
        const data = await api.get('/api/faq');
        if (data) {
          // Handle both array response and object with data property
          const faqArray = Array.isArray(data) ? data : (data.data || data.faq || []);
          setFaqData(faqArray);
        } else {
          console.error("Failed to fetch FAQ data");
          // Set fallback data
          setFaqData([
            {
              _id: "1",
              question: "What is ICSRT?",
              answer: "ICSRT is the International Center for Scientific Research and Translation, providing academic services worldwide."
            },
            {
              _id: "2", 
              question: "How can I register for conferences?",
              answer: "You can register for conferences through our registration page after creating an account."
            },
            {
              _id: "3",
              question: "What services do you offer?",
              answer: "We offer research assistance, translation services, academic writing, and thesis support across all disciplines."
            },
            {
              _id: "4",
              question: "How do I contact support?",
              answer: "You can contact our support team through the contact form on our website or email us directly."
            }
          ]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching FAQ data:", err);
        setLoading(false);
        // Set fallback data
        setFaqData([
          {
            _id: "1",
            question: "What is ICSRT?",
            answer: "ICSRT is the International Center for Scientific Research and Translation, providing academic services worldwide."
          },
          {
            _id: "2",
            question: "How can I register for conferences?", 
            answer: "You can register for conferences through our registration page after creating an account."
          },
          {
            _id: "3",
            question: "What services do you offer?",
            answer: "We offer research assistance, translation services, academic writing, and thesis support across all disciplines."
          },
          {
            _id: "4",
            question: "How do I contact support?",
            answer: "You can contact our support team through the contact form on our website or email us directly."
          }
        ]);
      }
    };

    fetchFAQ();
  }, []);

  const toggleExpanded = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    } ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Navigation */}

      {/* Main Content */}
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className={`text-4xl font-bold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {t('faq.title')}
            </h1>
            <p className={`text-xl transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {t('faq.subtitle')}
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className={`text-lg transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {t('common.loading')}
              </div>
            </div>
          ) : (
            /* FAQ Items */
            <div className="space-y-4">
              {Array.isArray(faqData) && faqData.map((faq, index) => (
                <div
                  key={faq._id}
                  className={`rounded-lg border transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                      : 'bg-white border-gray-200 hover:shadow-md'
                  }`}
                >
                  <button
                    onClick={() => toggleExpanded(index)}
                    className={`w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors duration-300 ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {faq.question}
                      </h3>
                      <svg
                        className={`w-5 h-5 transition-transform duration-300 ${
                          expandedIndex === index ? 'transform rotate-180' : ''
                        } ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {expandedIndex === index && (
                    <div className={`px-6 pb-4 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <p className="leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Contact Section */}
          <div className={`mt-12 text-center p-8 rounded-lg transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-blue-50 border border-blue-100'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {t('faq.stillHaveQuestions')}
            </h2>
            <p className={`mb-6 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {t('faq.contactUs')}
            </p>
            <Link
              to="/contact"
              className={`inline-block px-6 py-3 rounded-lg font-semibold transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {t('faq.contactButton')}
            </Link>
          </div>
        </div>
      </main>
      
      {/* Floating Contact Button */}
      <FloatingContactButton />
    </div>
  );
};

export default FAQ;
