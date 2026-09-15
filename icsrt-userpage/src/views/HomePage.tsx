'use client';

import styles from "./HomePage.module.css";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import PhoneNumberInput from "../components/PhoneNumberInput";
import { api } from "../lib/api";
import { FaBolt, FaBullseye, FaCompass, FaGraduationCap, FaLanguage, FaLock } from 'react-icons/fa';

const HomePage = () => {
  const { isLoggedIn, user } = useUser();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  
  // Order form state
  const [orderForm, setOrderForm] = useState({
    fullName: '',
    email: '',
    phone: { code: '', number: '', full: '' },
    serviceType: '',
    projectDetails: '',
    urgency: 'normal'
  });
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [orderMessage, setOrderMessage] = useState('');
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    // Fetch featured articles (limit 3)
  api.get('/articles/featured')
      .then((data) => {
        if (data.success) {
          setArticles(data.data.slice(0, 3));
        }
      })
      .catch(() => {});

  // Fetch services for the service type dropdown
  api.get('/services')
      .then((data) => {
        console.log('✅ Services fetched for HomePage:', data);
        // Handle different response formats
        const servicesArray = Array.isArray(data) ? data : (data?.data || []);
        setServices(servicesArray);
      })
      .catch((err) => {
        console.error("❌ Error fetching services for HomePage:", err);
        // Set empty array to show fallback translation-based content
        setServices([]);
      });
  }, []);

  // Update document title
  useEffect(() => {
    document.title = isRTL 
      ? 'المكتب الدولي للأبحاث العلمية والترجمة'
      : 'ICSRT - International Center for Scientific Research & Translation';
  }, [isRTL]);

  const handleOrderFormChange = (e) => {
    setOrderForm({ ...orderForm, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (phoneData) => {
    setOrderForm({ ...orderForm, phone: phoneData });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB per file
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    const validFiles: any[] = [];
    const errors: string[] = [];

    files.forEach((file: any) => {
      if (file.size > maxSize) {
        errors.push(`${file.name}: ${isRTL ? 'الحجم أكبر من 10MB' : 'Size exceeds 10MB'}`);
      } else if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: ${isRTL ? 'نوع الملف غير مدعوم' : 'Unsupported file type'}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setOrderError(errors.join(', '));
      setTimeout(() => setOrderError(''), 5000);
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!isLoggedIn) {
      navigate('/login?returnUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setOrderMessage('');
    setOrderError('');

    try {
      // Create FormData for file upload (matching Services page)
      const formData = new FormData();
      
      // Append regular form fields - IMPORTANT: Must match backend field names exactly
      formData.append('fullName', orderForm.fullName || '');
      formData.append('email', orderForm.email || '');
      formData.append('phone', orderForm.phone.full || `${orderForm.phone.code}${orderForm.phone.number}` || '');
      formData.append('serviceType', orderForm.serviceType || '');
      formData.append('projectDetails', orderForm.projectDetails || '');
      formData.append('urgency', orderForm.urgency || 'normal');
      formData.append('submittedAt', new Date().toISOString());
      formData.append('status', 'pending');

      // Add user data if logged in
      if (user && user._id) {
        formData.append('userId', user._id);
        formData.append('userEmail', user.email);
      }

      // Append files if any
      uploadedFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      // Debug: Log what we're sending
      console.log('📤 Submitting order from HomePage:');
      console.log('  - Full Name:', orderForm.fullName);
      console.log('  - Email:', orderForm.email);
      console.log('  - Phone:', orderForm.phone.full || `${orderForm.phone.code}${orderForm.phone.number}`);
      console.log('  - Service Type:', orderForm.serviceType);
      console.log('  - Project Details:', orderForm.projectDetails);
      console.log('  - Urgency:', orderForm.urgency);
      console.log('  - Files:', uploadedFiles.length);

      const result = await api.postFormData('/service-orders', formData);
      if (result && (result.success !== false)) {
        console.log('✅ Order submitted successfully:', result);
        setOrderMessage(
          isRTL 
            ? 'تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً.' 
            : 'Your order has been submitted successfully! We will contact you soon.'
        );
        setOrderForm({
          fullName: '',
          email: '',
          phone: { code: '', number: '', full: '' },
          serviceType: '',
          projectDetails: '',
          urgency: 'normal'
        });
        setUploadedFiles([]);
      } else {
        const errorMsg = result?.error || 'Server error';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Order submission error:', error);
      setOrderError(
        isRTL 
          ? `حدث خطأ أثناء إرسال الطلب: ${error.message}` 
          : `An error occurred while submitting your order: ${error.message}`
      );
    }
  };

  const copy = (en: string, ar: string) => isRTL ? ar : en;
  return (
    <div className={styles.home} dir={isRTL ? 'rtl' : 'ltr'}>
      <section className={styles.hero}>
        <img className={styles.heroImage} src="/research-field-hero.png" alt="Researcher working at a field station at dusk" />
        <div className={styles.heroShade} />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{copy('ICSRT / INTERNATIONAL RESEARCH COLLECTIVE', 'ICSRT / مجتمع البحث الدولي')}</p>
          <h1>{copy('TAKE YOUR', 'انطلق ببحثك')}<br /><span>{copy('RESEARCH', 'نحو آفاق')}</span><br />{copy('FURTHER.', 'أبعد.')}</h1>
          <p>{copy('Rigorous support for research, academic writing, and translation—built for work that has somewhere to go.', 'دعم رصين للبحث والكتابة الأكاديمية والترجمة، مصمم للعمل الذي يتطلع إلى آفاق أوسع.')}</p>
          <div className={styles.actions}><a href="#request-service" className={styles.primary}>{copy('START A PROJECT', 'ابدأ مشروعاً')} <span aria-hidden="true">↗</span></a><Link to="/services" className={styles.secondary}>{copy('EXPLORE SERVICES', 'استكشف الخدمات')}</Link></div>
        </div>
        <div className={styles.heroFoot}><span>{copy('FIELD-TESTED ACADEMIC SUPPORT', 'دعم أكاديمي موثوق')}</span><span>{copy('SCROLL TO EXPLORE', 'اكتشف المزيد ↓')}</span></div>
      </section>
      <div className={styles.announcement}>{copy('RESEARCH WITHOUT BORDERS. PROFESSIONAL SUPPORT FOR EVERY STAGE OF THE JOURNEY.', 'بحث بلا حدود. دعم احترافي لكل مرحلة من رحلتك.')}</div>
      <section className={styles.section}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{copy('EXPLORE THE RANGE', 'استكشف الخدمات')}</p><h2>{copy('BUILT FOR THE', 'مصممة لرحلتك')}<br />{copy('WORK AHEAD.', 'البحثية القادمة.')}</h2></div><Link to="/services" className={styles.textLink}>{copy('VIEW ALL SERVICES', 'كل الخدمات')} ↗</Link></div>
        <div className={styles.services}>{[
          {icon: FaCompass, title: copy('Make sense of your research', 'رؤية أوضح لبحثك'), desc: copy('From an early question to a stronger methodology, get guidance that helps you move forward.', 'من السؤال الأول إلى منهجية أقوى، احصل على إرشاد يساعدك على التقدم.'), label: copy('Research assistance', 'المساعدة البحثية')},
          {icon: FaLanguage, title: copy('Let your words travel', 'كلماتك تعبر الحدود'), desc: copy('Careful translation that carries your meaning, respects your field, and keeps your voice.', 'ترجمة دقيقة تنقل المعنى وتراعي تخصصك وتحافظ على صوتك.'), label: copy('Professional translation', 'الترجمة الاحترافية')},
          {icon: FaGraduationCap, title: copy('Take the next step with clarity', 'خطوتك التالية بثقة'), desc: copy('Practical support for planning, refining, and presenting your graduation project.', 'دعم عملي لتخطيط مشروع تخرجك وتطويره وعرضه بوضوح.'), label: copy('Graduation projects', 'مشاريع التخرج')}
        ].map((item,i) => <Link to="/services" className={styles.service} key={item.label}><div className={styles.serviceTop}><item.icon aria-hidden="true" /><span>0{i+1}</span></div><p className={styles.serviceLabel}>{item.label}</p><h3>{item.title}</h3><p>{item.desc}</p><span className={styles.serviceLink}>{copy('Find out more', 'اعرف المزيد')} {isRTL ? '←' : '→'}</span></Link>)}</div>
      </section>
      <section className={styles.process}>
        <div><p className={styles.eyebrow}>{copy('HOW IT WORKS', 'كيف نعمل')}</p><h2>{copy('READY FOR', 'جاهز')}<br /><span>{copy('THE NEXT', 'للخطوة')}<br />{copy('STAGE?', 'التالية؟')}</span></h2></div>
        <div>{[
          [copy('Tell us where you are', 'أخبرنا أين وصلت'),copy('Share your topic, your timeline, and what you need help with.', 'شاركنا موضوعك والوقت المتاح وما تحتاج المساعدة فيه.')],
          [copy('Talk through the details', 'نناقش التفاصيل'),copy('We’ll get in touch to understand your project and discuss the scope.', 'نتواصل معك لفهم مشروعك ومناقشة نطاق العمل.')],
          [copy('Move forward, together', 'نتقدم معاً'),copy('Agree on the next steps before your service begins.', 'نتفق على الخطوات التالية قبل بدء الخدمة.')]
        ].map(([title,desc],i) => <div className={styles.step} key={title}><span>0{i+1}</span><div><h3>{title}</h3><p>{desc}</p></div></div>)}</div>
      </section>
      <section className={styles.section}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{copy('FIELD NOTES', 'ملاحظات بحثية')}</p><h2>{copy('KNOWLEDGE FOR', 'معرفة')}<br />{copy('THE JOURNEY.', 'للرحلة.')}</h2></div><Link className={styles.textLink} to="/articles">{copy('READ ALL ARTICLES', 'اقرأ كل المقالات')} ↗</Link></div>
        <div className={styles.articles}>{(articles.length ? articles : [1,2,3].map(n => ({title: t('articles.'+n+'.title'), excerpt: t('articles.'+n+'.desc')}))).map((article,i) => <Link to={article._id ? '/articles/'+article._id : '/articles'} className={styles.article} key={article._id || i}><span className={styles.articleCategory}>{article.category || copy('From the ICSRT journal', 'من مقالات ICSRT')}</span><h3>{article.title}</h3><p>{article.excerpt || article.description || ''}</p><span className={styles.textLink}>{copy('Read article', 'اقرأ المقال')} {isRTL ? '←' : '→'}</span></Link>)}</div>
      </section>

      {/* Service Request Section - Always Visible */}
      <section id="request-service" className={styles.request}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-800 dark:text-blue-400 mb-4">
              {copy('What are you working on?', 'ما المشروع الذي تعمل عليه؟')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {copy('Tell us a little about it. We’ll help you find a way forward.', 'حدثنا عنه قليلاً، وسنساعدك على تحديد خطوتك التالية.')}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {orderMessage && (
              <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg">
                {orderMessage}
              </div>
            )}
            
            {orderError && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
                {orderError}
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
            
            <form onSubmit={handleOrderSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="home-fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'الاسم الكامل' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    id="home-fullName"
                    name="fullName"
                    value={orderForm.fullName}
                    onChange={handleOrderFormChange}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={isRTL ? 'ادخل اسمك الكامل' : 'Enter your full name'}
                  />
                </div>
                
                <div>
                  <label htmlFor="home-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'البريد الإلكتروني' : 'Email Address'} *
                  </label>
                  <input
                    type="email"
                    id="home-email"
                    name="email"
                    value={orderForm.email}
                    onChange={handleOrderFormChange}
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
                    value={orderForm.phone}
                    onChange={handlePhoneChange}
                    required
                    placeholder={isRTL ? 'ادخل رقم هاتفك' : 'Enter your phone number'}
                    name="phone"
                    id="phone"
                  />
                </div>
                
                <div>
                  <label htmlFor="home-serviceType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'نوع الخدمة' : 'Service Type'} *
                  </label>
                  <select
                    id="home-serviceType"
                    name="serviceType"
                    value={orderForm.serviceType}
                    onChange={handleOrderFormChange}
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
                  <label htmlFor="home-urgency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'درجة الأولوية' : 'Urgency Level'}
                  </label>
                  <select 
                    id="home-urgency"
                    name="urgency"
                    value={orderForm.urgency}
                    onChange={handleOrderFormChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="normal">{isRTL ? 'عادي' : 'Normal'}</option>
                    <option value="urgent">{isRTL ? 'عاجل' : 'Urgent'}</option>
                    <option value="very-urgent">{isRTL ? 'عاجل جداً' : 'Very Urgent'}</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="home-projectDetails" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'تفاصيل المشروع' : 'Project Details'} *
                </label>
                <textarea
                  id="home-projectDetails"
                    name="projectDetails"
                  value={orderForm.projectDetails}
                  onChange={handleOrderFormChange}
                  required
                  rows={5}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:bg-gray-700 dark:text-white"
                  placeholder={isRTL ? 'اشرح تفاصيل المشروع أو الخدمة التي تحتاجها...' : 'Describe the project or service you need...'}
                ></textarea>
              </div>

              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'المرفقات (اختياري)' : 'Attachments (Optional)'}
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    className="sr-only"
                    id="file-upload-home"
                  />
                  <label
                    htmlFor="file-upload-home"
                    className="cursor-pointer"
                  >
                    <div className="text-gray-600 dark:text-gray-400">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-2 text-sm">
                        {isRTL ? 'انقر لاختيار الملفات' : 'Click to choose files'}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {isRTL ? 'PDF, Word, Excel, صور (حتى 10MB لكل ملف)' : 'PDF, Word, Excel, Images (up to 10MB each)'}
                      </p>
                    </div>
                  </label>
                </div>
                
                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                          <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          aria-label={copy("Remove file: ", "حذف الملف: ") + file.name}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
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
              <FaBolt aria-hidden="true" className="text-4xl mb-4 mx-auto text-amber-600 dark:text-amber-400" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t('serviceRequest.features.quick.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('serviceRequest.features.quick.desc')}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <FaBullseye aria-hidden="true" className="text-4xl mb-4 mx-auto text-blue-700 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t('serviceRequest.features.quality.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('serviceRequest.features.quality.desc')}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <FaLock aria-hidden="true" className="text-4xl mb-4 mx-auto text-slate-700 dark:text-slate-300" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t('serviceRequest.features.privacy.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('serviceRequest.features.privacy.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

  {/* Footer removed here; global Footer and FloatingContactButton are provided by Layout */}
    </div>
  );
};

export default HomePage;
