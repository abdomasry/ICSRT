import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const PhoneInput = ({ 
  value, 
  onChange, 
  required = false, 
  placeholder = '',
  className = '',
  error = '',
  name = 'phone',
  id = 'phone'
}) => {
  const { isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchInputRef = React.useRef(null);

  // Comprehensive country codes list
  const countries = [
    { code: '+93', country: 'Afghanistan', flag: '🇦🇫', nameAr: 'أفغانستان' },
    { code: '+355', country: 'Albania', flag: '🇦🇱', nameAr: 'ألبانيا' },
    { code: '+213', country: 'Algeria', flag: '🇩🇿', nameAr: 'الجزائر' },
    { code: '+1', country: 'United States', flag: '🇺🇸', nameAr: 'الولايات المتحدة' },
    { code: '+376', country: 'Andorra', flag: '🇦🇩', nameAr: 'أندورا' },
    { code: '+244', country: 'Angola', flag: '🇦🇴', nameAr: 'أنغولا' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷', nameAr: 'الأرجنتين' },
    { code: '+374', country: 'Armenia', flag: '🇦🇲', nameAr: 'أرمينيا' },
    { code: '+61', country: 'Australia', flag: '🇦🇺', nameAr: 'أستراليا' },
    { code: '+43', country: 'Austria', flag: '🇦🇹', nameAr: 'النمسا' },
    { code: '+994', country: 'Azerbaijan', flag: '🇦🇿', nameAr: 'أذربيجان' },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭', nameAr: 'البحرين' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩', nameAr: 'بنغلاديش' },
    { code: '+375', country: 'Belarus', flag: '🇧🇾', nameAr: 'بيلاروسيا' },
    { code: '+32', country: 'Belgium', flag: '🇧🇪', nameAr: 'بلجيكا' },
    { code: '+229', country: 'Benin', flag: '🇧🇯', nameAr: 'بنين' },
    { code: '+975', country: 'Bhutan', flag: '🇧🇹', nameAr: 'بوتان' },
    { code: '+591', country: 'Bolivia', flag: '🇧🇴', nameAr: 'بوليفيا' },
    { code: '+387', country: 'Bosnia', flag: '🇧🇦', nameAr: 'البوسنة' },
    { code: '+267', country: 'Botswana', flag: '🇧🇼', nameAr: 'بوتسوانا' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷', nameAr: 'البرازيل' },
    { code: '+673', country: 'Brunei', flag: '🇧🇳', nameAr: 'بروناي' },
    { code: '+359', country: 'Bulgaria', flag: '🇧🇬', nameAr: 'بلغاريا' },
    { code: '+226', country: 'Burkina Faso', flag: '🇧🇫', nameAr: 'بوركينا فاسو' },
    { code: '+257', country: 'Burundi', flag: '🇧🇮', nameAr: 'بوروندي' },
    { code: '+855', country: 'Cambodia', flag: '🇰🇭', nameAr: 'كمبوديا' },
    { code: '+237', country: 'Cameroon', flag: '🇨🇲', nameAr: 'الكاميرون' },
    { code: '+1', country: 'Canada', flag: '🇨🇦', nameAr: 'كندا' },
    { code: '+238', country: 'Cape Verde', flag: '🇨🇻', nameAr: 'الرأس الأخضر' },
    { code: '+236', country: 'Central African Rep.', flag: '🇨🇫', nameAr: 'أفريقيا الوسطى' },
    { code: '+235', country: 'Chad', flag: '🇹🇩', nameAr: 'تشاد' },
    { code: '+56', country: 'Chile', flag: '🇨🇱', nameAr: 'تشيلي' },
    { code: '+86', country: 'China', flag: '🇨🇳', nameAr: 'الصين' },
    { code: '+57', country: 'Colombia', flag: '🇨🇴', nameAr: 'كولومبيا' },
    { code: '+269', country: 'Comoros', flag: '🇰🇲', nameAr: 'جزر القمر' },
    { code: '+242', country: 'Congo', flag: '🇨🇬', nameAr: 'الكونغو' },
    { code: '+506', country: 'Costa Rica', flag: '🇨🇷', nameAr: 'كوستاريكا' },
    { code: '+385', country: 'Croatia', flag: '🇭🇷', nameAr: 'كرواتيا' },
    { code: '+53', country: 'Cuba', flag: '🇨🇺', nameAr: 'كوبا' },
    { code: '+357', country: 'Cyprus', flag: '🇨🇾', nameAr: 'قبرص' },
    { code: '+420', country: 'Czech Republic', flag: '🇨🇿', nameAr: 'التشيك' },
    { code: '+45', country: 'Denmark', flag: '🇩🇰', nameAr: 'الدنمارك' },
    { code: '+253', country: 'Djibouti', flag: '🇩🇯', nameAr: 'جيبوتي' },
    { code: '+593', country: 'Ecuador', flag: '🇪🇨', nameAr: 'الإكوادور' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬', nameAr: 'مصر' },
    { code: '+503', country: 'El Salvador', flag: '🇸🇻', nameAr: 'السلفادور' },
    { code: '+240', country: 'Equatorial Guinea', flag: '🇬🇶', nameAr: 'غينيا الاستوائية' },
    { code: '+291', country: 'Eritrea', flag: '🇪🇷', nameAr: 'إريتريا' },
    { code: '+372', country: 'Estonia', flag: '🇪🇪', nameAr: 'إستونيا' },
    { code: '+251', country: 'Ethiopia', flag: '🇪🇹', nameAr: 'إثيوبيا' },
    { code: '+679', country: 'Fiji', flag: '🇫🇯', nameAr: 'فيجي' },
    { code: '+358', country: 'Finland', flag: '🇫🇮', nameAr: 'فنلندا' },
    { code: '+33', country: 'France', flag: '🇫🇷', nameAr: 'فرنسا' },
    { code: '+241', country: 'Gabon', flag: '🇬🇦', nameAr: 'الغابون' },
    { code: '+220', country: 'Gambia', flag: '🇬🇲', nameAr: 'غامبيا' },
    { code: '+995', country: 'Georgia', flag: '🇬🇪', nameAr: 'جورجيا' },
    { code: '+49', country: 'Germany', flag: '🇩🇪', nameAr: 'ألمانيا' },
    { code: '+233', country: 'Ghana', flag: '🇬🇭', nameAr: 'غانا' },
    { code: '+30', country: 'Greece', flag: '🇬🇷', nameAr: 'اليونان' },
    { code: '+502', country: 'Guatemala', flag: '🇬🇹', nameAr: 'غواتيمالا' },
    { code: '+224', country: 'Guinea', flag: '🇬🇳', nameAr: 'غينيا' },
    { code: '+245', country: 'Guinea-Bissau', flag: '🇬🇼', nameAr: 'غينيا بيساو' },
    { code: '+592', country: 'Guyana', flag: '🇬🇾', nameAr: 'غيانا' },
    { code: '+509', country: 'Haiti', flag: '🇭🇹', nameAr: 'هايتي' },
    { code: '+504', country: 'Honduras', flag: '🇭🇳', nameAr: 'هندوراس' },
    { code: '+36', country: 'Hungary', flag: '🇭🇺', nameAr: 'المجر' },
    { code: '+354', country: 'Iceland', flag: '🇮🇸', nameAr: 'آيسلندا' },
    { code: '+91', country: 'India', flag: '🇮🇳', nameAr: 'الهند' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩', nameAr: 'إندونيسيا' },
    { code: '+98', country: 'Iran', flag: '🇮🇷', nameAr: 'إيران' },
    { code: '+964', country: 'Iraq', flag: '🇮🇶', nameAr: 'العراق' },
    { code: '+353', country: 'Ireland', flag: '🇮🇪', nameAr: 'أيرلندا' },
    { code: '+972', country: 'Israel', flag: '🇮🇱', nameAr: 'إسرائيل' },
    { code: '+39', country: 'Italy', flag: '🇮🇹', nameAr: 'إيطاليا' },
    { code: '+225', country: 'Ivory Coast', flag: '🇨🇮', nameAr: 'ساحل العاج' },
    { code: '+81', country: 'Japan', flag: '🇯🇵', nameAr: 'اليابان' },
    { code: '+962', country: 'Jordan', flag: '🇯🇴', nameAr: 'الأردن' },
    { code: '+7', country: 'Kazakhstan', flag: '🇰🇿', nameAr: 'كازاخستان' },
    { code: '+254', country: 'Kenya', flag: '🇰🇪', nameAr: 'كينيا' },
    { code: '+965', country: 'Kuwait', flag: '🇰🇼', nameAr: 'الكويت' },
    { code: '+996', country: 'Kyrgyzstan', flag: '🇰🇬', nameAr: 'قيرغيزستان' },
    { code: '+856', country: 'Laos', flag: '🇱🇦', nameAr: 'لاوس' },
    { code: '+371', country: 'Latvia', flag: '🇱🇻', nameAr: 'لاتفيا' },
    { code: '+961', country: 'Lebanon', flag: '🇱🇧', nameAr: 'لبنان' },
    { code: '+266', country: 'Lesotho', flag: '🇱🇸', nameAr: 'ليسوتو' },
    { code: '+231', country: 'Liberia', flag: '🇱🇷', nameAr: 'ليبيريا' },
    { code: '+218', country: 'Libya', flag: '🇱🇾', nameAr: 'ليبيا' },
    { code: '+423', country: 'Liechtenstein', flag: '🇱🇮', nameAr: 'ليختنشتاين' },
    { code: '+370', country: 'Lithuania', flag: '🇱🇹', nameAr: 'ليتوانيا' },
    { code: '+352', country: 'Luxembourg', flag: '🇱🇺', nameAr: 'لوكسمبورغ' },
    { code: '+389', country: 'Macedonia', flag: '🇲🇰', nameAr: 'مقدونيا' },
    { code: '+261', country: 'Madagascar', flag: '🇲🇬', nameAr: 'مدغشقر' },
    { code: '+265', country: 'Malawi', flag: '🇲🇼', nameAr: 'مالاوي' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾', nameAr: 'ماليزيا' },
    { code: '+960', country: 'Maldives', flag: '🇲🇻', nameAr: 'المالديف' },
    { code: '+223', country: 'Mali', flag: '🇲🇱', nameAr: 'مالي' },
    { code: '+356', country: 'Malta', flag: '🇲🇹', nameAr: 'مالطا' },
    { code: '+222', country: 'Mauritania', flag: '🇲🇷', nameAr: 'موريتانيا' },
    { code: '+230', country: 'Mauritius', flag: '🇲🇺', nameAr: 'موريشيوس' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽', nameAr: 'المكسيك' },
    { code: '+373', country: 'Moldova', flag: '🇲🇩', nameAr: 'مولدوفا' },
    { code: '+377', country: 'Monaco', flag: '🇲🇨', nameAr: 'موناكو' },
    { code: '+976', country: 'Mongolia', flag: '🇲🇳', nameAr: 'منغوليا' },
    { code: '+382', country: 'Montenegro', flag: '🇲🇪', nameAr: 'الجبل الأسود' },
    { code: '+212', country: 'Morocco', flag: '🇲🇦', nameAr: 'المغرب' },
    { code: '+258', country: 'Mozambique', flag: '🇲🇿', nameAr: 'موزمبيق' },
    { code: '+95', country: 'Myanmar', flag: '🇲🇲', nameAr: 'ميانمار' },
    { code: '+264', country: 'Namibia', flag: '🇳🇦', nameAr: 'ناميبيا' },
    { code: '+977', country: 'Nepal', flag: '🇳🇵', nameAr: 'نيبال' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱', nameAr: 'هولندا' },
    { code: '+64', country: 'New Zealand', flag: '🇳🇿', nameAr: 'نيوزيلندا' },
    { code: '+505', country: 'Nicaragua', flag: '🇳🇮', nameAr: 'نيكاراغوا' },
    { code: '+227', country: 'Niger', flag: '🇳🇪', nameAr: 'النيجر' },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬', nameAr: 'نيجيريا' },
    { code: '+47', country: 'Norway', flag: '🇳🇴', nameAr: 'النرويج' },
    { code: '+968', country: 'Oman', flag: '🇴🇲', nameAr: 'عُمان' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰', nameAr: 'باكستان' },
    { code: '+507', country: 'Panama', flag: '🇵🇦', nameAr: 'بنما' },
    { code: '+675', country: 'Papua New Guinea', flag: '🇵🇬', nameAr: 'بابوا غينيا الجديدة' },
    { code: '+595', country: 'Paraguay', flag: '🇵🇾', nameAr: 'باراغواي' },
    { code: '+51', country: 'Peru', flag: '🇵🇪', nameAr: 'بيرو' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭', nameAr: 'الفلبين' },
    { code: '+48', country: 'Poland', flag: '🇵🇱', nameAr: 'بولندا' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹', nameAr: 'البرتغال' },
    { code: '+974', country: 'Qatar', flag: '🇶🇦', nameAr: 'قطر' },
    { code: '+40', country: 'Romania', flag: '🇷🇴', nameAr: 'رومانيا' },
    { code: '+7', country: 'Russia', flag: '🇷🇺', nameAr: 'روسيا' },
    { code: '+250', country: 'Rwanda', flag: '🇷🇼', nameAr: 'رواندا' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', nameAr: 'السعودية' },
    { code: '+221', country: 'Senegal', flag: '🇸🇳', nameAr: 'السنغال' },
    { code: '+381', country: 'Serbia', flag: '🇷🇸', nameAr: 'صربيا' },
    { code: '+248', country: 'Seychelles', flag: '🇸🇨', nameAr: 'سيشل' },
    { code: '+232', country: 'Sierra Leone', flag: '🇸🇱', nameAr: 'سيراليون' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬', nameAr: 'سنغافورة' },
    { code: '+421', country: 'Slovakia', flag: '🇸🇰', nameAr: 'سلوفاكيا' },
    { code: '+386', country: 'Slovenia', flag: '🇸🇮', nameAr: 'سلوفينيا' },
    { code: '+252', country: 'Somalia', flag: '🇸🇴', nameAr: 'الصومال' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦', nameAr: 'جنوب أفريقيا' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷', nameAr: 'كوريا الجنوبية' },
    { code: '+211', country: 'South Sudan', flag: '🇸🇸', nameAr: 'جنوب السودان' },
    { code: '+34', country: 'Spain', flag: '🇪🇸', nameAr: 'إسبانيا' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', nameAr: 'سريلانكا' },
    { code: '+249', country: 'Sudan', flag: '🇸🇩', nameAr: 'السودان' },
    { code: '+597', country: 'Suriname', flag: '🇸🇷', nameAr: 'سورينام' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪', nameAr: 'السويد' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭', nameAr: 'سويسرا' },
    { code: '+963', country: 'Syria', flag: '🇸🇾', nameAr: 'سوريا' },
    { code: '+992', country: 'Tajikistan', flag: '🇹🇯', nameAr: 'طاجيكستان' },
    { code: '+255', country: 'Tanzania', flag: '🇹🇿', nameAr: 'تنزانيا' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭', nameAr: 'تايلاند' },
    { code: '+228', country: 'Togo', flag: '🇹🇬', nameAr: 'توغو' },
    { code: '+216', country: 'Tunisia', flag: '🇹🇳', nameAr: 'تونس' },
    { code: '+90', country: 'Turkey', flag: '🇹🇷', nameAr: 'تركيا' },
    { code: '+993', country: 'Turkmenistan', flag: '🇹🇲', nameAr: 'تركمانستان' },
    { code: '+256', country: 'Uganda', flag: '🇺🇬', nameAr: 'أوغندا' },
    { code: '+380', country: 'Ukraine', flag: '🇺🇦', nameAr: 'أوكرانيا' },
    { code: '+971', country: 'UAE', flag: '🇦🇪', nameAr: 'الإمارات' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧', nameAr: 'المملكة المتحدة' },
    { code: '+598', country: 'Uruguay', flag: '🇺🇾', nameAr: 'الأوروغواي' },
    { code: '+998', country: 'Uzbekistan', flag: '🇺🇿', nameAr: 'أوزبكستان' },
    { code: '+58', country: 'Venezuela', flag: '🇻🇪', nameAr: 'فنزويلا' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳', nameAr: 'فيتنام' },
    { code: '+967', country: 'Yemen', flag: '🇾🇪', nameAr: 'اليمن' },
    { code: '+260', country: 'Zambia', flag: '🇿🇲', nameAr: 'زامبيا' },
    { code: '+263', country: 'Zimbabwe', flag: '🇿🇼', nameAr: 'زيمبابوي' }
  ];

  // Extract country code and phone number from value
  const parsePhoneValue = (phoneValue) => {
    if (!phoneValue) return { countryCode: '+20', phoneNumber: '' }; // Default to Egypt
    
    const country = countries.find(c => phoneValue.startsWith(c.code));
    if (country) {
      return {
        countryCode: country.code,
        phoneNumber: phoneValue.substring(country.code.length).trim()
      };
    }
    
    return { countryCode: '+20', phoneNumber: phoneValue };
  };

  const { countryCode, phoneNumber } = parsePhoneValue(value);

  const handleCountrySelect = (code) => {
    const newValue = code + (phoneNumber ? ' ' + phoneNumber : '');
    onChange({ target: { name, value: newValue } });
    setIsOpen(false);
    setSearchTerm(''); // Reset search term
    setHighlightedIndex(0);
  };

  const handlePhoneChange = (e) => {
    const inputValue = e.target.value;
    const newValue = countryCode + (inputValue ? ' ' + inputValue : '');
    onChange({ target: { name, value: newValue } });
  };

  // Filter countries based on search term
  const filteredCountries = countries.filter(country => {
    const searchLower = searchTerm.toLowerCase();
    return (
      country.country.toLowerCase().includes(searchLower) ||
      country.nameAr.includes(searchTerm) ||
      country.code.includes(searchTerm) ||
      country.code.replace('+', '').includes(searchTerm)
    );
  });

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredCountries.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCountries.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCountries[highlightedIndex]) {
          handleCountrySelect(filteredCountries[highlightedIndex].code);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(0);
        break;
      default:
        // Auto-search by typing characters
        if (e.key.length === 1) {
          setSearchTerm(prev => prev + e.key);
          setHighlightedIndex(0);
        }
        break;
    }
  };

  const handleDropdownOpen = () => {
    setIsOpen(true);
    setHighlightedIndex(0);
    // Focus search input after dropdown opens
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const selectedCountry = countries.find(c => c.code === countryCode) || countries[0];

  // Reset highlighted index when filtered countries change
  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredCountries.length]);

  return (
    <div className={`relative ${className}`} onKeyDown={handleKeyDown}>
      <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 ${error ? 'border-red-500' : ''}`}>
        {/* Country Code Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={handleDropdownOpen}
            className={`flex items-center px-3 py-3 bg-gray-50 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? 'border-l border-r-0' : ''} min-w-[100px] justify-between`}
            tabIndex={0}
          >
            <div className="flex items-center">
              <span className="text-lg mr-1">{selectedCountry.flag}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedCountry.code}
              </span>
            </div>
            <svg 
              className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ml-1 ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Enhanced Dropdown */}
          {isOpen && (
            <>
              <div className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-1 w-80 max-h-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-[9999] overflow-hidden`}>
                {/* Search Input with enhanced UX */}
                <div className="p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setHighlightedIndex(0);
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder={isRTL ? 'ابحث أو اكتب كود الدولة...' : 'Search or type country code...'}
                      className={`w-full px-3 py-2 pl-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white ${isRTL ? 'text-right pr-8 pl-3' : 'text-left'}`}
                      autoComplete="off"
                    />
                    <div className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'} text-gray-400`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  {searchTerm && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {isRTL ? 
                        `${filteredCountries.length} دولة موجودة` : 
                        `${filteredCountries.length} countries found`
                      }
                      {filteredCountries.length > 0 && (
                        <span className="ml-2 text-blue-600 dark:text-blue-400">
                          {isRTL ? '↑↓ للتنقل، Enter للاختيار' : '↑↓ to navigate, Enter to select'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Enhanced Countries List */}
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {filteredCountries.length > 0 ? (
                    <div className="py-1">
                      {filteredCountries.map((country, index) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => handleCountrySelect(country.code)}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          className={`w-full flex items-center px-4 py-3 text-sm transition-colors ${isRTL ? 'flex-row-reverse text-right' : 'text-left'} ${
                            selectedCountry.code === country.code 
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                              : highlightedIndex === index
                              ? 'bg-gray-100 dark:bg-gray-700'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                          } border-b border-gray-50 dark:border-gray-750 last:border-b-0`}
                        >
                          <span className="text-lg flex-shrink-0">{country.flag}</span>
                          <span className={`font-mono font-medium flex-shrink-0 ${isRTL ? 'mr-3' : 'ml-3'} min-w-[60px] text-blue-600 dark:text-blue-400`}>
                            {country.code}
                          </span>
                          <span className={`truncate ${isRTL ? 'mr-2' : 'ml-2'} ${selectedCountry.code === country.code ? 'font-semibold' : ''}`}>
                            {isRTL ? country.nameAr : country.country}
                          </span>
                          {selectedCountry.code === country.code && (
                            <span className={`${isRTL ? 'mr-auto ml-2' : 'ml-auto mr-2'} text-blue-600 dark:text-blue-400`}>
                              ✓
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <div className="text-gray-400 dark:text-gray-500 mb-2">
                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm">
                        {isRTL ? 'لم يتم العثور على دولة' : 'No countries found'}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {isRTL ? 'جرب البحث بكود أو اسم الدولة' : 'Try searching by country code or name'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick tips */}
                {!searchTerm && (
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{isRTL ? 'نصائح: اكتب للبحث السريع' : 'Tip: Type to search quickly'}</span>
                      <span>{isRTL ? 'Esc للإغلاق' : 'Esc to close'}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Backdrop overlay */}
              <div 
                className="fixed inset-0 z-[9998] bg-black bg-opacity-20"
                onClick={() => {
                  setIsOpen(false);
                  setSearchTerm('');
                  setHighlightedIndex(0);
                }}
              />
            </>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          id={id}
          name={name}
          value={phoneNumber}
          onChange={handlePhoneChange}
          required={required}
          placeholder={placeholder || (isRTL ? 'رقم الهاتف' : 'Phone number')}
          className={`flex-1 px-4 py-3 bg-white dark:bg-gray-700 dark:text-white focus:outline-none ${isRTL ? 'text-right' : 'text-left'} min-w-0`}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Custom CSS for scrollbar */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #f7fafc;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f7fafc;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
        .dark .custom-scrollbar {
          scrollbar-color: #4a5568 #2d3748;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #2d3748;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
      `}</style>
    </div>
  );
};

export default PhoneInput;
