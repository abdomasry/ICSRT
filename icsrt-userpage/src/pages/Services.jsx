import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import FloatingContactButton from "../components/FloatingContactButton";
import PhoneNumberInput from "../components/PhoneNumberInput";
import { api } from "../lib/api";

const Services = () => {
  const { isLoggedIn, user } = useUser();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Service request form state
  const [requestForm, setRequestForm] = useState({
    fullName: '',
    email: '',
    phone: { code: '', number: '', full: '' },
    serviceType: '',
    projectDetails: '',
    urgency: 'normal'
  });
  const [requestMessage, setRequestMessage] = useState('');
  const [requestError, setRequestError] = useState('');

  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterError, setNewsletterError] = useState('');

  useEffect(() => {
    // Check for service parameter and pre-select it
    const selectedService = searchParams.get('service');
    if (selectedService) {
      setRequestForm(prev => ({ ...prev, serviceType: selectedService }));
      // Scroll to form after a short delay
      setTimeout(() => {
        document.getElementById('request-form')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }

  // Try to fetch services from backend, fallback to empty array to show translation-based content
  api.get('/api/services')
      .then((data) => {
        console.log('✅ Services fetched:', data);
        // Handle different response formats
        const servicesArray = Array.isArray(data) ? data : (data?.data || []);
        setServices(servicesArray);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching services:", err);
        setLoading(false);
        // Set empty array to show fallback translation-based content
        setServices([]);
      });
  }, [searchParams]);

  const handleRequestFormChange = (e) => {
    setRequestForm({ ...requestForm, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (phoneData) => {
    setRequestForm({ ...requestForm, phone: phoneData });
  };

  const handleServiceRequest = (serviceKey) => {
    setRequestForm(prev => ({ ...prev, serviceType: serviceKey }));
    document.getElementById('request-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!isLoggedIn) {
      navigate('/login?returnUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setRequestMessage('');
    setRequestError('');

    try {
      const requestData = {
        ...requestForm,
        phone: requestForm.phone.full || `${requestForm.phone.code}${requestForm.phone.number}`, // Ensure we send the full phone number
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };

      // Add user data if logged in
      if (user && user._id) {
        requestData.userId = user._id;
        requestData.userEmail = user.email;
      }

  const result = await api.post('/api/service-orders', requestData);
  if (result && (result.success !== false)) {
        console.log('Request submitted successfully:', result);
        setRequestMessage(
          isRTL 
            ? 'تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً.' 
            : 'Your request has been submitted successfully! We will contact you soon.'
        );
        setRequestForm({
          fullName: '',
          email: '',
          phone: { code: '', number: '', full: '' },
          serviceType: '',
          projectDetails: '',
          urgency: 'normal'
        });
      } else {
        const errorMsg = result?.error || 'Server error';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Request submission error:', error);
      setRequestError(
        isRTL 
          ? `حدث خطأ أثناء إرسال الطلب: ${error.message}` 
          : `An error occurred while submitting your request: ${error.message}`
      );
    }
  };

  // Newsletter subscription handler
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
      const data = await api.post('/api/newsletter/subscribe', {
        email: newsletterEmail,
        preferences: ['services'],
        source: 'services_page'
      });
      
      if (data && (data.success !== false)) {
        setNewsletterMessage(
          isRTL 
            ? 'تم الاشتراك بنجاح! ستتلقى إشعارات عن الخدمات الجديدة.'
            : 'Successfully subscribed! You\'ll receive notifications about new services.'
        );
        setNewsletterEmail('');
      } else {
        setNewsletterError(
          data?.error || 
          (isRTL ? 'فشل في الاشتراك، يرجى المحاولة مرة أخرى' : 'Subscription failed, please try again')
        );
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

  // Normalize service features regardless of type
  const parseFeatures = (features) => {
    if (!features) return [];
    if (Array.isArray(features)) return features.map(String).filter(Boolean);
    if (typeof features === 'string') {
      const text = features.replace(/\r\n/g, '\n');
      return text.split(/[\n,•]+/).map(s => s.trim()).filter(Boolean).slice(0, 20);
    }
    return [String(features)];
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Navigation */}

      {/* Header */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold text-blue-800 dark:text-blue-400 mb-6">{t('services.title')}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Services Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {services.length > 0 ? services.map((service, index) => (
              <div key={service._id || index} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {/* Service Image */}
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={service.image || service.imageUrl || "https://via.placeholder.com/400x250/3B82F6/FFFFFF?text=Service"} 
                    alt={service.title || service.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x250/3B82F6/FFFFFF?text=Service";
                    }}
                  />
                  {/* Price and Duration Badges */}
                  {service.price && (
                    <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      {service.price}
                    </div>
                  )}
                  {service.duration && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      {service.duration}
                    </div>
                  )}
                </div>
                
                {/* Service Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-blue-800 dark:text-blue-400 mb-3 text-center">
                    {isRTL ? service.titleAr || service.title || service.name : service.title || service.name}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-center leading-relaxed text-sm">
                    {isRTL ? service.descriptionAr || service.description : service.description}
                  </p>
                  
                  {/* Service Features */}
          {service.features && (
                    <div className="space-y-2 mb-4">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-sm">
                        {isRTL ? 'الميزات الرئيسية:' : 'Key Features:'}
                      </h4>
                      <div className="space-y-1">
            {parseFeatures(service.features).slice(0, 3).map((feature, i) => (
                          <div key={i} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-1.5 h-1.5 bg-blue-600 rounded-full ${isRTL ? 'ml-2' : 'mr-2'}`}></div>
              <span className="text-gray-700 dark:text-gray-300 text-xs">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => handleServiceRequest(service.title || service._id || service.key || 'consultation')}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-500 transition-all transform hover:scale-105 text-sm"
                  >
                    {service.buttonText || t('services.request') || 'Request Service'}
                  </button>
                </div>
              </div>
            )) : (
              // Fallback to translation-based static content when no services loaded
              <div className="col-span-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Research & Assignments Service */}
                  <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className="text-6xl mb-6 text-center">📝</div>
                    <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-400 mb-4 text-center">
                      {t('services.research.title')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                      {t('services.research.desc')}
                    </p>
                    <div className="space-y-3 mb-6">
                      {[
                        isRTL ? 'كتابة مهنية' : 'Professional Writing',
                        isRTL ? 'جميع التخصصات' : 'All Specializations', 
                        isRTL ? 'أسس علمية' : 'Scientific Foundation',
                        isRTL ? 'جودة مضمونة' : 'Quality Assured'
                      ].map((feature, i) => (
                        <div key={i} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full ${isRTL ? 'ml-3' : 'mr-3'}`}></div>
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleServiceRequest('research')}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-700 dark:to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-500 dark:hover:from-blue-600 dark:hover:to-blue-400 transition"
                    >
                      {t('services.request')}
                    </button>
                  </div>

                  {/* Translation Services */}
                  <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className="text-6xl mb-6 text-center">🌐</div>
                    <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-400 mb-4 text-center">
                      {t('services.translation.title')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                      {t('services.translation.desc')}
                    </p>
                    <div className="space-y-3 mb-6">
                      {[
                        isRTL ? 'جميع اللغات' : 'All Languages',
                        isRTL ? 'مترجمون محترفون' : 'Professional Translators',
                        isRTL ? 'تركيز أكاديمي' : 'Academic Focus',
                        isRTL ? 'تسليم سريع' : 'Quick Delivery'
                      ].map((feature, i) => (
                        <div key={i} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full ${isRTL ? 'ml-3' : 'mr-3'}`}></div>
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleServiceRequest('translation')}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-700 dark:to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-500 dark:hover:from-blue-600 dark:hover:to-blue-400 transition"
                    >
                      {t('services.request')}
                    </button>
                  </div>

                  {/* Graduation Projects */}
                  <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className="text-6xl mb-6 text-center">🎓</div>
                    <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-400 mb-4 text-center">
                      {t('services.graduation.title')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                      {t('services.graduation.desc')}
                    </p>
                    <div className="space-y-3 mb-6">
                      {[
                        isRTL ? 'دعم شامل' : 'Complete Support',
                        isRTL ? 'من الفكرة للتنفيذ' : 'Idea to Implementation',
                        isRTL ? 'جميع التخصصات' : 'All Disciplines',
                        isRTL ? 'ترتيبات عالية' : 'Top Rankings'
                      ].map((feature, i) => (
                        <div key={i} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full ${isRTL ? 'ml-3' : 'mr-3'}`}></div>
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleServiceRequest('graduation')}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-700 dark:to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-500 dark:hover:from-blue-600 dark:hover:to-blue-400 transition"
                    >
                      {t('services.request')}
                    </button>
                  </div>

                  {/* Research Planning Service (From Articles) */}
                  <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className="text-6xl mb-6 text-center">📋</div>
                    <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-400 mb-4 text-center">
                      {isRTL ? 'خطة البحث العلمي' : 'Research Plan Development'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                      {isRTL ? 'خطة بحث احترافية تشمل جميع العناصر الأساسية مع المنهج المناسب للبحث' : 'Professional research plan including all essential elements with appropriate research methodology'}
                    </p>
                    <div className="space-y-3 mb-6">
                      {[
                        isRTL ? 'صياغة المشكلة' : 'Problem Formulation',
                        isRTL ? 'تحديد المنهجية' : 'Methodology Selection',
                        isRTL ? 'مراجعة الأدبيات' : 'Literature Review',
                        isRTL ? 'جدولة زمنية' : 'Timeline Planning'
                      ].map((feature, i) => (
                        <div key={i} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full ${isRTL ? 'ml-3' : 'mr-3'}`}></div>
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleServiceRequest('research-plan')}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-700 dark:to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-500 dark:hover:from-blue-600 dark:hover:to-blue-400 transition"
                    >
                      {t('services.request')}
                    </button>
                  </div>

                  {/* Research Guidance Service (From Articles) */}
                  <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className="text-6xl mb-6 text-center">🔍</div>
                    <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-400 mb-4 text-center">
                      {isRTL ? 'إرشادات البحث العلمي' : 'Research Guidance & Support'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                      {isRTL ? 'مساعدة في استخدام المواقع العلمية والموارد المناسبة لرحلة البحث العلمي' : 'Assistance with scientific websites and appropriate resources for your research journey'}
                    </p>
                    <div className="space-y-3 mb-6">
                      {[
                        isRTL ? 'المصادر العلمية' : 'Scientific Sources',
                        isRTL ? 'قواعد البيانات' : 'Academic Databases',
                        isRTL ? 'أدوات البحث' : 'Research Tools',
                        isRTL ? 'مراجع موثوقة' : 'Reliable References'
                      ].map((feature, i) => (
                        <div key={i} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full ${isRTL ? 'ml-3' : 'mr-3'}`}></div>
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleServiceRequest('research-guidance')}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-700 dark:to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-500 dark:hover:from-blue-600 dark:hover:to-blue-400 transition"
                    >
                      {t('services.request')}
                    </button>
                  </div>

                  {/* Professional Writing Service (From Articles) */}
                  <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className="text-6xl mb-6 text-center">✍️</div>
                    <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-400 mb-4 text-center">
                      {isRTL ? 'كتابة الأوراق البحثية' : 'Professional Research Papers'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                      {isRTL ? 'كتابة أوراق بحثية احترافية وفقاً للمعايير الأكاديمية العالمية' : 'Professional research paper writing according to international academic standards'}
                    </p>
                    <div className="space-y-3 mb-6">
                      {[
                        isRTL ? 'هيكل منظم' : 'Structured Format',
                        isRTL ? 'توثيق دقيق' : 'Accurate Citations',
                        isRTL ? 'أسلوب أكاديمي' : 'Academic Style',
                        isRTL ? 'مراجعة شاملة' : 'Comprehensive Review'
                      ].map((feature, i) => (
                        <div key={i} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full ${isRTL ? 'ml-3' : 'mr-3'}`}></div>
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleServiceRequest('research-paper')}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-700 dark:to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-500 dark:hover:from-blue-600 dark:hover:to-blue-400 transition"
                    >
                      {t('services.request')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 dark:bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">{t('services.cta.title')}</h2>
          <p className="text-xl mb-8">{t('services.cta.description')}</p>
          <button
            onClick={() => {
              document.getElementById('request-form').scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white text-blue-600 dark:bg-gray-200 dark:text-blue-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-300 transition mr-4"
          >
            {isRTL ? 'طلب خدمة الآن' : 'Request Service Now'}
          </button>
          <Link 
            to="/dashboard" 
            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
          >
            {t('services.cta.button')}
          </Link>
        </div>
      </section>

      {/* Service Request Form - Always Visible */}
      <section id="request-form" className="py-16 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-800 dark:text-blue-400 mb-4">
              {isRTL ? 'طلب خدمة أكاديمية' : 'Request Academic Service'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {isRTL ? 'احصل على خدماتنا المتخصصة بجودة عالية' : 'Get our specialized services with high quality'}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {requestMessage && (
              <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
                {requestMessage}
              </div>
            )}
            
            {requestError && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                {requestError}
              </div>
            )}
            
            {!isLoggedIn && (
              <div className="mb-6 p-4 bg-yellow-100 text-yellow-700 rounded-lg text-center">
                <p className="mb-2">
                  {isRTL 
                    ? 'يجب عليك تسجيل الدخول أولاً لتتمكن من طلب الخدمات' 
                    : 'You must be logged in to submit service requests'
                  }
                </p>
                <Link 
                  to="/login" 
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {isRTL ? 'تسجيل الدخول' : 'Login'}
                </Link>
              </div>
            )}
            
            <form onSubmit={handleRequestSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'الاسم الكامل' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={requestForm.fullName}
                    onChange={handleRequestFormChange}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={isRTL ? 'ادخل اسمك الكامل' : 'Enter your full name'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'البريد الإلكتروني' : 'Email Address'} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={requestForm.email}
                    onChange={handleRequestFormChange}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={isRTL ? 'ادخل بريدك الإلكتروني' : 'Enter your email address'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'رقم الهاتف' : 'Phone Number'} *
                  </label>
                  <PhoneNumberInput
                    value={requestForm.phone}
                    onChange={handlePhoneChange}
                    required
                    placeholder={isRTL ? 'ادخل رقم هاتفك' : 'Enter your phone number'}
                    name="phone"
                    id="phone"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'نوع الخدمة' : 'Service Type'} *
                  </label>
                  <select
                    name="serviceType"
                    value={requestForm.serviceType}
                    onChange={handleRequestFormChange}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">{isRTL ? 'اختر نوع الخدمة' : 'Select Service Type'}</option>
                    {services.length > 0 ? (
                      services.map((service) => (
                        <option key={service._id} value={service.title}>
                          {service.title}
                        </option>
                      ))
                    ) : (
                      // Fallback options when no services loaded from database
                      <>
                        <option value="research">{isRTL ? 'بحوث ومهام' : 'Research & Assignments'}</option>
                        <option value="translation">{isRTL ? 'خدمات الترجمة' : 'Translation Services'}</option>
                        <option value="graduation">{isRTL ? 'مشاريع التخرج' : 'Graduation Projects'}</option>
                        <option value="research-plan">{isRTL ? 'خطة البحث العلمي' : 'Research Plan Development'}</option>
                        <option value="research-guidance">{isRTL ? 'إرشادات البحث العلمي' : 'Research Guidance & Support'}</option>
                        <option value="research-paper">{isRTL ? 'كتابة الأوراق البحثية' : 'Professional Research Papers'}</option>
                        <option value="thesis">{isRTL ? 'رسائل الماجستير والدكتوراه' : 'Master\'s & PhD Thesis'}</option>
                        <option value="editing">{isRTL ? 'تحرير ومراجعة' : 'Editing & Proofreading'}</option>
                        <option value="consultation">{isRTL ? 'استشارات أكاديمية' : 'Academic Consultation'}</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'درجة الأولوية' : 'Urgency Level'}
                  </label>
                  <select 
                    name="urgency"
                    value={requestForm.urgency}
                    onChange={handleRequestFormChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="normal">{isRTL ? 'عادي' : 'Normal'}</option>
                    <option value="urgent">{isRTL ? 'عاجل' : 'Urgent'}</option>
                    <option value="very-urgent">{isRTL ? 'عاجل جداً' : 'Very Urgent'}</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'تفاصيل المشروع' : 'Project Details'} *
                </label>
                <textarea
                  name="projectDetails"
                  value={requestForm.projectDetails}
                  onChange={handleRequestFormChange}
                  required
                  rows={5}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:bg-gray-700 dark:text-white"
                  placeholder={isRTL ? 'اشرح تفاصيل المشروع أو الخدمة التي تحتاجها...' : 'Describe the project or service you need...'}
                ></textarea>
              </div>
              
              {requestMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {requestMessage}
                </div>
              )}
              
              {requestError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {requestError}
                </div>
              )}
              
              <div className="text-center">
                <button
                  type="submit"
                  disabled={!isLoggedIn}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    isLoggedIn 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isRTL ? 'إرسال طلب الخدمة' : 'Submit Service Request'}
                </button>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  {isRTL ? 'سيتم التواصل معك خلال 24 ساعة' : 'We will contact you within 24 hours'}
                </p>
              </div>
            </form>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {isRTL ? 'استجابة سريعة' : 'Quick Response'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {isRTL ? 'نرد خلال 24 ساعة' : 'We respond within 24 hours'}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {isRTL ? 'جودة عالية' : 'High Quality'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {isRTL ? 'معايير أكاديمية عالمية' : 'International academic standards'}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {isRTL ? 'خصوصية تامة' : 'Full Privacy'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {isRTL ? 'حماية كاملة لبياناتك' : 'Complete protection of your data'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className={`text-3xl lg:text-4xl font-bold mb-6 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'كن أول من يعلم' : 'Be the First to Know'}
          </h2>
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${isRTL ? 'font-arabic leading-relaxed' : ''}`}>
            {isRTL 
              ? 'اشترك في نشرتنا البريدية واحصل على تحديثات فورية عند إضافة خدمات جديدة أو محتوى علمي مفيد' 
              : 'Subscribe to our newsletter and get instant updates when we add new services or publish valuable scientific content'
            }
          </p>
          
          <form 
            onSubmit={handleNewsletterSubscribe}
            className={`max-w-md mx-auto ${isRTL ? 'rtl' : 'ltr'}`}
          >
            <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <input 
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={isRTL ? 'بريدك الإلكتروني' : 'Your Email Address'}
                className={`flex-1 px-4 py-3 rounded-lg text-gray-800 placeholder-gray-500 border-none focus:ring-2 focus:ring-white focus:outline-none ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
                required
              />
              <button 
                type="submit"
                disabled={newsletterLoading}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {newsletterLoading 
                  ? (isRTL ? 'جاري الإرسال...' : 'Subscribing...') 
                  : (isRTL ? 'اشترك الآن' : 'Subscribe Now')
                }
              </button>
            </div>
          </form>
          
          {/* Success/Error Messages */}
          {newsletterMessage && (
            <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg max-w-lg mx-auto">
              <div className={`font-semibold ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                {newsletterMessage}
              </div>
            </div>
          )}
          
          {newsletterError && (
            <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg max-w-lg mx-auto">
              <div className={`font-semibold ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                {newsletterError}
              </div>
            </div>
          )}
          
          <p className={`text-sm mt-6 opacity-90 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL 
              ? '✨ احصل على إشعارات فورية للخدمات الجديدة والمقالات العلمية المتميزة'
              : '✨ Get instant notifications for new services and featured scientific articles'
            }
          </p>
        </div>
      </section>
      
      {/* Floating Contact Button */}
      <FloatingContactButton />
    </div>
  );
};

export default Services;
