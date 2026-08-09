import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import PhoneNumberInput from "../components/PhoneNumberInput";
import { api } from "../lib/api";
import { 
  FaChartBar, 
  FaFlask, 
  FaEdit, 
  FaLaptopCode, 
  FaGlobe, 
  FaUsers,
  FaRocket,
  FaBrain,
  FaBookOpen,
  FaLightbulb,
  FaLanguage,
  FaMicroscope,
  FaUserGraduate
} from 'react-icons/fa';

const HomePage = () => {
  const { isLoggedIn, user } = useUser();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  // Safe translation helper with fallback text when translation key is missing
  const tx = (key, fallback) => {
    try {
      const val = typeof t === 'function' ? t(key) : undefined;
      return !val || val === key ? fallback : val;
    } catch {
      return fallback;
    }
  };
  const [stats, setStats] = useState({
    clients: 1024,
    countries: 12,
    visitors: 608,
    successRate: 98,
    support: '24/7',
    projects: 1000
  });
  const [articles, setArticles] = useState([]);
  const [services, setServices] = useState([]);
  
  // Order form state
  const [orderForm, setOrderForm] = useState({
    fullName: '',
    email: '',
    phone: { code: '', number: '', full: '' },
    serviceType: '',
    projectDetails: '',
    urgency: 'normal'
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [orderMessage, setOrderMessage] = useState('');
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
  // Fetch website stats
  api.get('/dashboard-stats')
      .then((data) => {
        const baseCustomers = 1024;
        const baseProjects = 1000;
        const dynamicCustomers = data.totalUsers || 0;
        const dynamicProjects = data.totalServiceOrders ? 
          (data.totalServiceOrders - data.activeProjects || 0) : 0; // Only count completed projects
        
        setStats(prevStats => ({
          ...prevStats,
          clients: baseCustomers + dynamicCustomers,
          projects: baseProjects + dynamicProjects,
          countries: prevStats.countries, // Keep static value
          successRate: prevStats.successRate, // Keep static value
          support: prevStats.support // Keep static value
        }));
      })
      .catch(() => {});

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

    const validFiles = [];
    const errors = [];

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

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Navigation */}

      {/* Hero Section with overlay stats card */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              {tx('hero.badge', 'Leading Academic Excellence')}
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {tx('hero.title.part1', 'International Center for')}
              </span>
              <br />
              <span className="text-gray-800 dark:text-gray-200">{tx('hero.title.part2', 'Scientific Research & Translation')}</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl">
              {tx('hero.description', 'Empowering academic excellence through expert research assistance, professional translation services, and comprehensive project support across all disciplines.')}
            </p>
            {/* CTA Buttons under the hero text */}
      <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <Link
                to="/services"
        className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
              >
                {tx('hero.cta.explore', 'Explore Services')} <span className={`ml-2 ${isRTL ? 'rotate-180' : ''}`}>→</span>
              </Link>
              <Link
                to="/about"
        className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              >
                {tx('hero.cta.learn', 'Learn More')} <span className={`ml-2 ${isRTL ? 'rotate-180' : ''}`}>→</span>
              </Link>
            </div>
          </div>
          {/* Right column: overlay stats card */}
          <div className="hidden lg:block relative">
            {/* Colored skewed background */}
            <div className="absolute -top-6 -right-6 w-80 h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl transform rotate-[-8deg] shadow-2xl opacity-90 z-0"></div>
            <div className="absolute -top-2 -right-2 w-80 h-48 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl transform rotate-[-4deg] shadow-2xl opacity-80 z-0"></div>

            {/* Foreground white card */}
            <div className="relative z-20 w-[24rem] ml-auto mr-6 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6">
              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-400">{stats.clients.toLocaleString()}+</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tx('stats.clients', 'Customers')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-green-700 dark:text-green-400">{stats.countries}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tx('stats.countries', 'Countries Served')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-purple-700 dark:text-purple-400">{stats.projects >= 1000 ? stats.projects.toLocaleString() + '+' : stats.projects}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tx('stats.success', 'Projects Completed')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">{stats.support}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tx('stats.support', 'Support')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile stats grid (visible on small screens) */}
        <div className="lg:hidden mt-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4 text-center">
              <div className="text-xl font-extrabold text-blue-700 dark:text-blue-400">{stats.clients.toLocaleString()}+</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tx('stats.clients','Customers')}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4 text-center">
              <div className="text-xl font-extrabold text-green-700 dark:text-green-400">{stats.countries}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tx('stats.countries','Countries Served')}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4 text-center">
              <div className="text-xl font-extrabold text-purple-700 dark:text-purple-400">{stats.projects >= 1000 ? stats.projects.toLocaleString() + '+' : stats.projects}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tx('stats.success','Projects Completed')}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4 text-center">
              <div className="text-xl font-extrabold text-orange-600 dark:text-orange-400">{stats.support}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tx('stats.support','Support')}</div>
            </div>
          </div>
        </div>
        
        <div className={`text-center mt-12 mb-12 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="text-5xl font-bold text-center text-blue-800 dark:text-blue-400 mb-6">{t('services.title')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 text-center max-w-3xl mx-auto">{t('services.subtitle')}</p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-6 rounded-full"></div>
          </div>
          
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Research Assistance Card */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 text-center border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Icon Container with Animation */}
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaMicroscope className="w-10 h-10 text-white transform group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              </div>
              
              <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-4 group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors duration-300">
                {t('services.research.title')}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-base">
                {t('services.research.desc')}
              </p>
              
              <Link 
                to="/services" 
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group/btn"
              >
                <span className="mr-2">{t('services.view')}</span>
                <span className="transform group-hover/btn:translate-x-1 transition-transform duration-300">
                  {isRTL ? '←' : '→'}
                </span>
              </Link>
            </div>
            
            {/* Professional Translation Card */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 text-center border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Icon Container with Animation */}
              <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaLanguage className="w-10 h-10 text-white transform group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              </div>
              
              <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-4 group-hover:text-green-800 dark:group-hover:text-green-300 transition-colors duration-300">
                {t('services.translation.title')}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-base">
                {t('services.translation.desc')}
              </p>
              
              <Link 
                to="/services" 
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group/btn"
              >
                <span className="mr-2">{t('services.view')}</span>
                <span className="transform group-hover/btn:translate-x-1 transition-transform duration-300">
                  {isRTL ? '←' : '→'}
                </span>
              </Link>
            </div>
            
            {/* Graduation Projects Card */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 text-center border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Icon Container with Animation */}
              <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaUserGraduate className="w-10 h-10 text-white transform group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              </div>
              
              <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-4 group-hover:text-purple-800 dark:group-hover:text-purple-300 transition-colors duration-300">
                {t('services.graduation.title')}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-base">
                {t('services.graduation.desc')}
              </p>
              
              <Link 
                to="/services" 
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group/btn"
              >
                <span className="mr-2">{t('services.view')}</span>
                <span className="transform group-hover/btn:translate-x-1 transition-transform duration-300">
                  {isRTL ? '←' : '→'}
                </span>
              </Link>
            </div>
          </div>
      </section>

  {/* Compact strip removed; overlay card restored in hero */}

      {/* Articles Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`text-center mb-12 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="text-4xl font-bold text-center text-blue-800 dark:text-blue-400 mb-4">{t('articles.title')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 text-center">{t('articles.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.length > 0 ? articles.map((article, index) => {
              // Icon selection based on category or index
              const getIcon = () => {
                const category = article.category?.toLowerCase() || '';
                if (category.includes('research') || category.includes('science')) return FaFlask;
                if (category.includes('data') || category.includes('analytics')) return FaChartBar;
                if (category.includes('tech') || category.includes('code')) return FaLaptopCode;
                if (category.includes('global') || category.includes('world')) return FaGlobe;
                if (category.includes('innovation') || category.includes('idea')) return FaLightbulb;
                if (category.includes('ai') || category.includes('brain')) return FaBrain;
                if (category.includes('education') || category.includes('learning')) return FaBookOpen;
                if (category.includes('startup') || category.includes('business')) return FaRocket;
                
                // Default based on index
                return index % 3 === 0 ? FaChartBar : index % 3 === 1 ? FaFlask : FaEdit;
              };
              
              const IconComponent = getIcon();
              
              return (
                <div key={article._id || index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group hover:scale-105">
                  <div className={`h-48 bg-gradient-to-r ${
                    index % 3 === 0 ? 'from-blue-400 to-blue-600' :
                    index % 3 === 1 ? 'from-green-400 to-green-600' :
                    'from-purple-400 to-purple-600'
                  } relative flex items-center justify-center overflow-hidden`}>
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 left-4 w-20 h-20 border border-white rounded-full"></div>
                      <div className="absolute bottom-4 right-4 w-16 h-16 border border-white rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white rounded-full"></div>
                    </div>
                    
                    {/* Main icon */}
                    <div className="relative z-10 text-white text-6xl transform group-hover:scale-110 transition-transform duration-300">
                      <IconComponent />
                    </div>
                    
                    {/* Floating mini icons */}
                    <div className="absolute top-4 right-4 text-white text-xl opacity-60 transform group-hover:rotate-12 transition-transform duration-300">
                      <FaLightbulb />
                    </div>
                    <div className="absolute bottom-4 left-4 text-white text-lg opacity-40 transform group-hover:-rotate-12 transition-transform duration-300">
                      <FaRocket />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        index % 3 === 0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        index % 3 === 1 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                      }`}>
                        {article.category || 'Research'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <FaBookOpen className="text-xs" />
                        {article.readTime || '5 min read'}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {article.excerpt || article.content?.substring(0, 120) + '...'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <FaUsers className="text-xs" />
                        By {article.author || 'ICSRT Team'}
                      </div>
                      <Link to={`/articles/${article._id}`} className={`${
                        index % 3 === 0 ? 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300' :
                        index % 3 === 1 ? 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300' :
                        'text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300'
                      } font-medium inline-flex items-center gap-1 hover:gap-2 transition-all group-hover:underline`}>
                        {t('articles.read')} {isRTL ? '←' : '→'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            }) : (
              // Default articles when no real articles available
              <>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group hover:scale-105">
                  <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600 relative flex items-center justify-center overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 left-4 w-20 h-20 border border-white rounded-full"></div>
                      <div className="absolute bottom-4 right-4 w-16 h-16 border border-white rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white rounded-full"></div>
                    </div>
                    
                    {/* Main icon */}
                    <div className="relative z-10 text-white text-6xl transform group-hover:scale-110 transition-transform duration-300">
                      <FaChartBar />
                    </div>
                    
                    {/* Floating mini icons */}
                    <div className="absolute top-4 right-4 text-white text-xl opacity-60 transform group-hover:rotate-12 transition-transform duration-300">
                      <FaLightbulb />
                    </div>
                    <div className="absolute bottom-4 left-4 text-white text-lg opacity-40 transform group-hover:-rotate-12 transition-transform duration-300">
                      <FaRocket />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Research
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <FaBookOpen className="text-xs" />
                        5 min read
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {t('articles.1.title')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {t('articles.1.desc')}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <FaUsers className="text-xs" />
                        By ICSRT Team
                      </div>
                      <Link to="/articles" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all group-hover:underline">
                        {t('articles.view')} {isRTL ? '←' : '→'}
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group hover:scale-105">
                  <div className="h-48 bg-gradient-to-r from-green-400 to-green-600 relative flex items-center justify-center overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 left-4 w-20 h-20 border border-white rounded-full"></div>
                      <div className="absolute bottom-4 right-4 w-16 h-16 border border-white rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white rounded-full"></div>
                    </div>
                    
                    {/* Main icon */}
                    <div className="relative z-10 text-white text-6xl transform group-hover:scale-110 transition-transform duration-300">
                      <FaFlask />
                    </div>
                    
                    {/* Floating mini icons */}
                    <div className="absolute top-4 right-4 text-white text-xl opacity-60 transform group-hover:rotate-12 transition-transform duration-300">
                      <FaLightbulb />
                    </div>
                    <div className="absolute bottom-4 left-4 text-white text-lg opacity-40 transform group-hover:-rotate-12 transition-transform duration-300">
                      <FaRocket />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Science
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <FaBookOpen className="text-xs" />
                        7 min read
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {t('articles.2.title')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {t('articles.2.desc')}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <FaUsers className="text-xs" />
                        By ICSRT Team
                      </div>
                      <Link to="/articles" className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all group-hover:underline">
                        {t('articles.view')} {isRTL ? '←' : '→'}
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group hover:scale-105">
                  <div className="h-48 bg-gradient-to-r from-purple-400 to-purple-600 relative flex items-center justify-center overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 left-4 w-20 h-20 border border-white rounded-full"></div>
                      <div className="absolute bottom-4 right-4 w-16 h-16 border border-white rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white rounded-full"></div>
                    </div>
                    
                    {/* Main icon */}
                    <div className="relative z-10 text-white text-6xl transform group-hover:scale-110 transition-transform duration-300">
                      <FaEdit />
                    </div>
                    
                    {/* Floating mini icons */}
                    <div className="absolute top-4 right-4 text-white text-xl opacity-60 transform group-hover:rotate-12 transition-transform duration-300">
                      <FaLightbulb />
                    </div>
                    <div className="absolute bottom-4 left-4 text-white text-lg opacity-40 transform group-hover:-rotate-12 transition-transform duration-300">
                      <FaRocket />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        Writing
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <FaBookOpen className="text-xs" />
                        6 min read
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {t('articles.3.title')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {t('articles.3.desc')}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <FaUsers className="text-xs" />
                        By ICSRT Team
                      </div>
                      <Link to="/articles" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all group-hover:underline">
                        {t('articles.view')} {isRTL ? '←' : '→'}
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          {/* View All Articles CTA */}
          <div className="mt-8 text-center">
            <Link to="/articles" className="inline-flex items-center px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 dark:focus:ring-gray-600">
              {tx('articles.viewAll','View All Articles')} <span className={`ml-2 ${isRTL ? 'rotate-180' : ''}`}>→</span>
            </Link>
          </div>
        </div>
      </section>

  {/* Old large stats section removed in favor of compact strip */}

      {/* Service Request Section - Always Visible */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-800 dark:text-blue-400 mb-4">
              {t('serviceRequest.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('serviceRequest.subtitle')}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'الاسم الكامل' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={orderForm.fullName}
                    onChange={handleOrderFormChange}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'نوع الخدمة' : 'Service Type'} *
                  </label>
                  <select
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'درجة الأولوية' : 'Urgency Level'}
                  </label>
                  <select 
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'تفاصيل المشروع' : 'Project Details'} *
                </label>
                <textarea
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
                    className="hidden"
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
                        {isRTL ? 'انقر لتحميل الملفات أو اسحب وأفلت' : 'Click to upload or drag and drop'}
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
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t('serviceRequest.features.quick.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('serviceRequest.features.quick.desc')}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t('serviceRequest.features.quality.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('serviceRequest.features.quality.desc')}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">🔒</div>
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
