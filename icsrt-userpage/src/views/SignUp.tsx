'use client';
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import DarkModeToggle from "../components/DarkModeToggle";
import PhoneNumberInput from "../components/PhoneNumberInput";
import CountrySelect from "../components/CountrySelect";
import { api } from "../lib/api";
import { getCodeByName, getNameByCode } from "../utils/countryData";

const SignUp = () => {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: { code: "", number: "", full: "" },
    institution: "",
    country: "",
    userType: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // Password strength validation function
  const validatePasswordStrength = (password) => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push(isRTL ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push(isRTL ? 'يجب أن تحتوي على حرف كبير واحد على الأقل' : 'Must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push(isRTL ? 'يجب أن تحتوي على حرف صغير واحد على الأقل' : 'Must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push(isRTL ? 'يجب أن تحتوي على رقم واحد على الأقل' : 'Must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password)) {
      errors.push(isRTL ? 'يجب أن تحتوي على رمز خاص واحد على الأقل' : 'Must contain at least one special character');
    }
    
    return errors;
  };

  // Phone number validation
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[\d\s\-()]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return isRTL ? 'رقم هاتف غير صحيح' : 'Invalid phone number format';
    }
    return '';
  };

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return isRTL ? 'بريد إلكتروني غير صحيح' : 'Invalid email format';
    }
    return '';
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (phoneData) => {
    // When code changes, update country to match
    let updated = { ...phoneData };
    let country = form.country;
    if (phoneData.code && phoneData.code !== form.phone.code) {
      const name = getNameByCode(phoneData.code);
      if (name) country = name;
    }
    setForm({ ...form, phone: updated, country });
  };

  const handleCountryChange = (country) => {
    // When country changes, set phone code to match
    const code = getCodeByName(country);
    const phone = { ...form.phone };
    if (code && code !== phone.code) {
      phone.code = code;
      phone.full = code ? `+${code}${phone.number || ''}` : phone.number || '';
    }
    setForm({ ...form, country, phone });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    // Validation
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError(isRTL ? 'الاسم الأول واسم العائلة مطلوبان' : 'First and last name are required');
      setLoading(false);
      return;
    }

    const emailError = validateEmail(form.email);
    if (emailError) {
      setError(emailError);
      setLoading(false);
      return;
    }

    const passwordErrors = validatePasswordStrength(form.password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors[0]);
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      setLoading(false);
      return;
    }

    const phoneError = validatePhoneNumber(form.phone.full || form.phone.number);
    if (phoneError) {
      setError(phoneError);
      setLoading(false);
      return;
    }

    if (!form.userType) {
      setError(isRTL ? 'نوع المستخدم مطلوب' : 'User type is required');
      setLoading(false);
      return;
    }

  try {
      const signupData = {
        firstName: form.firstName,
        lastName: form.lastName,
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
        phone: form.phone.full || `${form.phone.code}${form.phone.number}`,
        institution: form.institution,
        country: form.country,
        userType: form.userType,
        createdAt: new Date().toISOString()
      };

  const resp = await api.postSafe('/api/auth/register', signupData);
  const data = resp.data;
  if (resp.ok && data && (data.success !== false)) {
        setMessage(
          isRTL 
            ? 'تم إنشاء الحساب بنجاح! يرجى تحقق من بريدك الإلكتروني لتأكيد الحساب.'
            : 'Account created successfully! Please check your email to verify your account.'
        );
        
        setTimeout(() => {
          navigate('/verify-email', { state: { email: form.email } });
        }, 2000);
      } else {
        const serverMsg = data?.error || data?.message;
        setError(serverMsg || (isRTL ? 'فشل في إنشاء الحساب' : 'Failed to create account'));
      }
    } catch (err) {
      setError(isRTL ? 'خطأ في الشبكة. يرجى المحاولة مرة أخرى.' : 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center ${isRTL ? 'px-4 py-6' : 'p-4'} ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full border border-gray-100 dark:border-gray-700 ${isRTL ? 'p-6 max-w-3xl mx-4' : 'p-8 max-w-2xl'}`}>
        <div className={`text-center ${isRTL ? 'mb-6' : 'mb-8'} ${isRTL ? 'rtl' : 'ltr'}`}>
          <Link to="/" className={`text-3xl font-black text-blue-600 dark:text-blue-400 ${isRTL ? 'font-arabic' : ''}`}>
            ICSRT
          </Link>
          <h1 className={`${isRTL ? 'text-2xl lg:text-3xl' : 'text-3xl'} font-bold text-gray-900 dark:text-white ${isRTL ? 'mt-3 mb-2' : 'mt-4 mb-2'} ${isRTL ? 'font-arabic leading-relaxed' : ''}`}>
            {isRTL ? 'إنشاء حساب جديد' : 'Create New Account'}
          </h1>
          <p className={`text-gray-600 dark:text-gray-300 ${isRTL ? 'font-arabic text-sm leading-relaxed px-2' : ''}`}>
            {isRTL ? 'انضم إلى مجتمع الباحثين والأكاديميين' : 'Join our community of researchers and academics'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={`${isRTL ? 'space-y-5' : 'space-y-6'} ${isRTL ? 'rtl' : 'ltr'}`}>
          <div className={`grid grid-cols-1 ${isRTL ? 'lg:grid-cols-2 gap-4' : 'md:grid-cols-2 gap-6'}`}>
            <input
              type="text"
              name="firstName"
              placeholder={isRTL ? 'الاسم الأول *' : 'First Name *'}
              value={form.firstName}
              onChange={handleChange}
              required
              className={`w-full border border-blue-200 ${isRTL ? 'p-3 lg:p-4' : 'p-4'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${isRTL ? 'text-right font-arabic text-sm lg:text-base' : 'text-left'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <input
              type="text"
              name="lastName"
              placeholder={isRTL ? 'اسم العائلة *' : 'Last Name *'}
              value={form.lastName}
              onChange={handleChange}
              required
              className={`w-full border border-blue-200 ${isRTL ? 'p-3 lg:p-4' : 'p-4'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${isRTL ? 'text-right font-arabic text-sm lg:text-base' : 'text-left'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder={isRTL ? 'البريد الإلكتروني *' : 'Email Address *'}
              value={form.email}
              onChange={handleChange}
              required
              className={`w-full border border-blue-200 ${isRTL ? 'p-3 lg:p-4' : 'p-4'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${isRTL ? 'text-right font-arabic text-sm lg:text-base' : 'text-left'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            {form.email && validateEmail(form.email) && (
              <div className={`text-xs text-red-600 dark:text-red-400 mt-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                {validateEmail(form.email)}
              </div>
            )}
          </div>

          <div className={`grid grid-cols-1 ${isRTL ? 'lg:grid-cols-2 gap-4' : 'md:grid-cols-2 gap-6'} ${isRTL ? 'md:grid-flow-col-dense' : ''}`}>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                placeholder={isRTL ? 'كلمة المرور *' : 'Password *'}
                value={form.password}
                onChange={handleChange}
                required
                className={`w-full border border-blue-200 ${isRTL ? 'p-3 lg:p-4 pr-10' : 'p-4 pr-12'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${isRTL ? 'text-right font-arabic text-sm lg:text-base' : 'text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 ${isRTL ? 'left-3' : 'right-4'}`}
              >
                {passwordVisible ? '🙈' : '👁️'}
              </button>
            </div>

            <div className="relative">
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                name="confirmPassword"
                placeholder={isRTL ? 'تأكيد كلمة المرور *' : 'Confirm Password *'}
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full border border-blue-200 ${isRTL ? 'p-3 lg:p-4 pr-10' : 'p-4 pr-12'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${isRTL ? 'text-right font-arabic text-sm lg:text-base' : 'text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <button
                type="button"
                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 ${isRTL ? 'left-3' : 'right-4'}`}
              >
                {confirmPasswordVisible ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {form.password && (
            <div className={`bg-gray-50 dark:bg-gray-700 ${isRTL ? 'p-3' : 'p-4'} rounded-xl`}>
              <h4 className={`text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'font-arabic text-right' : ''}`}>
                {isRTL ? 'قوة كلمة المرور:' : 'Password Strength:'}
              </h4>
              <div className={`${isRTL ? 'space-y-1' : 'space-y-1'}`}>
                {validatePasswordStrength(form.password).map((error, index) => (
                  <div key={index} className={`text-xs text-red-600 dark:text-red-400 flex items-center ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}>
                    <span className={isRTL ? 'ml-1' : 'mr-1'}>❌</span> {error}
                  </div>
                ))}
                {validatePasswordStrength(form.password).length === 0 && (
                  <div className={`text-xs text-green-600 dark:text-green-400 flex items-center ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}>
                    <span className={isRTL ? 'ml-1' : 'mr-1'}>✅</span> 
                    {isRTL ? 'كلمة مرور قوية!' : 'Strong password!'}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={`grid grid-cols-1 ${isRTL ? 'lg:grid-cols-2 gap-4' : 'md:grid-cols-2 gap-6'} ${isRTL ? 'md:grid-flow-col-dense' : ''}`}>
            <div>
              <PhoneNumberInput
                value={form.phone}
                onChange={handlePhoneChange}
                required
                placeholder={isRTL ? 'رقم الهاتف' : 'Phone Number'}
                error={form.phone.number && validatePhoneNumber(form.phone.full || form.phone.number) ? validatePhoneNumber(form.phone.full || form.phone.number) : ''}
                name="phone"
                id="phone"
                className=""
              />
              {form.phone.full && !validatePhoneNumber(form.phone.full) && form.phone.full.startsWith('+') && (
                <div className={`text-xs text-green-600 flex items-center mt-2 ${isRTL ? 'flex-row-reverse font-arabic' : ''}`}>
                  <span className={isRTL ? 'ml-1' : 'mr-1'}>✅</span>
                  {isRTL ? 'رقم هاتف صحيح' : 'Valid phone number'}
                </div>
              )}
            </div>

            <div>
              <CountrySelect
                value={form.country}
                onChange={handleCountryChange}
                name="country"
                id="country"
                required
                className="border-blue-200 focus:ring-blue-400"
              />
            </div>
          </div>

          <input
            type="text"
            name="institution"
            placeholder={isRTL ? 'المؤسسة/الجامعة' : 'Institution/University'}
            value={form.institution}
            onChange={handleChange}
            className={`w-full border border-blue-200 ${isRTL ? 'p-3 lg:p-4' : 'p-4'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${isRTL ? 'text-right font-arabic text-sm lg:text-base' : 'text-left'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          />

          <select
            name="userType"
            value={form.userType}
            onChange={handleChange}
            required
            className={`w-full border border-blue-200 ${isRTL ? 'p-3 lg:p-4' : 'p-4'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition dark:bg-gray-700 dark:border-gray-600 dark:text-white ${isRTL ? 'text-right font-arabic text-sm lg:text-base' : 'text-left'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <option value="">{isRTL ? 'اختر نوع المستخدم *' : 'Select User Type *'}</option>
            <option value="student_academic">{isRTL ? 'طالب / أكاديمي' : 'Student / Academic'}</option>
            <option value="researcher_professional">{isRTL ? 'باحث / خبير' : 'Researcher / Professional'}</option>
          </select>

          <div className={`flex items-start ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-3'} ${isRTL ? 'flex-row-reverse' : ''}`}>
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className={`${isRTL ? 'text-sm' : 'text-sm'} text-gray-600 dark:text-gray-300 ${isRTL ? 'text-right font-arabic leading-relaxed' : 'text-left'}`}>
              {isRTL ? 'أوافق على ' : 'I agree to the '}
              <Link to="/terms" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                {isRTL ? 'الشروط والأحكام' : 'Terms & Conditions'}
              </Link>
              {isRTL ? ' و' : ' and '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white ${isRTL ? 'py-3 lg:py-4' : 'py-4'} px-8 rounded-xl font-bold ${isRTL ? 'text-base lg:text-lg' : 'text-lg'} shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${isRTL ? 'font-arabic' : ''}`}
          >
            {loading 
              ? (isRTL ? 'جاري الإنشاء...' : 'Creating Account...') 
              : (isRTL ? 'إنشاء الحساب' : 'Create Account')
            }
          </button>
        </form>

        <div className={`text-center ${isRTL ? 'mt-5' : 'mt-6'}`}>
          <p className={`text-gray-600 dark:text-gray-300 ${isRTL ? 'font-arabic text-sm' : ''}`}>
            {isRTL ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold">
              {isRTL ? 'تسجيل دخول' : 'Sign In'}
            </Link>
          </p>
        </div>

        {message && (
          <div className={`${isRTL ? 'mt-3' : 'mt-4'} p-4 bg-green-100 border border-green-300 rounded-xl`}>
            <div className={`text-green-800 font-semibold text-center ${isRTL ? 'font-arabic text-sm leading-relaxed' : ''}`}>{message}</div>
          </div>
        )}
        
        {error && (
          <div className={`${isRTL ? 'mt-3' : 'mt-4'} p-4 bg-red-100 border border-red-300 rounded-xl`}>
            <div className={`text-red-800 font-semibold text-center ${isRTL ? 'font-arabic text-sm leading-relaxed' : ''}`}>{error}</div>
          </div>
        )}

        <div className={`${isRTL ? 'mt-5' : 'mt-6'} flex justify-center items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-4'}`}>
          <LanguageSwitcher />
          <DarkModeToggle />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
