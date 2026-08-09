'use client';
import React, { useState } from 'react';
import { api } from '../lib/api';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

const WorkWithUs = () => {
  const { user, isLoggedIn } = useUser();
  const { t, isRTL } = useLanguage();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [file, setFile] = useState<any>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [fileInfo, setFileInfo] = useState<any>(null); // { url, filename, mimetype, size }
  const [cvFile, setCvFile] = useState<any>(null);
  const [cvInfo, setCvInfo] = useState<any>(null);
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [error, setError] = useState('');

  if (!isLoggedIn || user?.userType !== 'researcher_professional') {
    return (
      <div className={`max-w-3xl mx-auto p-6 ${isRTL ? 'rtl text-right' : 'ltr'}`}>
        <h1 className="text-2xl font-bold mb-2 text-blue-800 dark:text-blue-300">{t('work.title')}</h1>
        <p className="text-gray-700 dark:text-gray-300">{t('work.onlyResearchers')}</p>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      // Optional upload first if file is selected
      let attachment: any = null;
      if (file) {
        setFileUploading(true);
        const up = await api.uploadFileSafe(file);
        setFileUploading(false);
        if (!up.ok) throw new Error(up.data?.error || 'Upload failed');
        attachment = up.data; // { success, url, filename, ... }
        setFileInfo(attachment);
      }
      let cv: any = null;
      if (cvFile) {
        setFileUploading(true);
        const up2 = await api.uploadFileSafe(cvFile);
        setFileUploading(false);
        if (!up2.ok) throw new Error(up2.data?.error || 'CV upload failed');
        cv = up2.data;
        setCvInfo(cv);
      }

      const body = {
        title: title.trim() || 'Untitled',
        summary: summary.trim(),
        userEmail: user.email,
        userId: user._id || user.id,
        status: 'submitted',
        // Contact fields
        firstName: String(firstName || '').trim() || null,
        lastName: String(lastName || '').trim() || null,
        contact: {
          phone: (phoneCode || phoneNumber) ? `${phoneCode || ''}${phoneNumber || ''}`.replace(/\s+/g,'') : null,
          phoneCode: phoneCode || null,
          phoneNumber: phoneNumber || null,
        },
        social: {
          facebook: facebook || null,
          instagram: instagram || null,
          linkedin: linkedin || null,
        },
        attachment: attachment ? {
          url: attachment.url,
          filename: attachment.filename,
          mimetype: attachment.mimetype,
          size: attachment.size,
        } : null,
        cv: cv ? {
          url: cv.url,
          filename: cv.filename,
          mimetype: cv.mimetype,
          size: cv.size,
        } : null,
      };
      const res = await api.postSafe('/api/collaborations', body);
      if (!res.ok) throw new Error(res.data?.error || 'Failed to submit');
      setStatus('done');
      setTitle('');
      setSummary('');
      setFirstName('');
      setLastName('');
      setPhoneCode('');
      setPhoneNumber('');
      setFacebook('');
      setInstagram('');
      setLinkedin('');
      setFile(null);
      setFileInfo(null);
  setCvFile(null);
  setCvInfo(null);
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Failed to submit');
    }
  };

  return (
    <div className={`max-w-5xl mx-auto p-6 ${isRTL ? 'rtl text-right' : 'ltr'}`}>
      <h1 className="text-3xl font-extrabold mb-2 text-blue-800 dark:text-blue-300">{t('work.title')}</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-8">{t('work.subtitle')}</p>

      {/* Why work with us */}
      <section className="grid md:grid-cols-2 gap-4 mb-8">
        {[1,2,3,4].map((i) => (
          <div key={i} className="rounded-2xl border border-blue-100 dark:border-gray-700 bg-white/70 dark:bg-gray-800 p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-1">{t(`work.why.${i}.title`)}</h3>
            <p className="text-gray-700 dark:text-gray-300">{t(`work.why.${i}.desc`)}</p>
          </div>
        ))}
      </section>

      <form onSubmit={submit} className="space-y-4">
        {/* Names */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isRTL ? 'text-right' : ''}`}>
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">{isRTL ? 'الاسم الأول' : 'First Name'}</label>
            <input className="w-full border border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3" value={firstName} onChange={(e)=>setFirstName(e.target.value)} placeholder={isRTL ? 'أدخل الاسم الأول' : 'Enter first name'} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">{isRTL ? 'اسم العائلة' : 'Last Name'}</label>
            <input className="w-full border border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3" value={lastName} onChange={(e)=>setLastName(e.target.value)} placeholder={isRTL ? 'أدخل اسم العائلة' : 'Enter last name'} />
          </div>
        </div>

        {/* Contact with country code */}
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">{isRTL ? 'رقم التواصل (مع مفتاح الدولة)' : 'Contact Number (with country code)'}</label>
          <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} gap-2`}>
            <input className="w-32 border border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3" value={phoneCode} onChange={(e)=>setPhoneCode(e.target.value)} placeholder={isRTL ? '+20' : '+20'} />
            <input className="flex-1 border border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3" value={phoneNumber} onChange={(e)=>setPhoneNumber(e.target.value)} placeholder={isRTL ? 'رقم الهاتف' : 'Phone number'} />
          </div>
        </div>

        {/* Social links */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${isRTL ? 'text-right' : ''}`}>
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Facebook</label>
            <input className="w-full border border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3" value={facebook} onChange={(e)=>setFacebook(e.target.value)} placeholder="https://facebook.com/your-profile" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Instagram</label>
            <input className="w-full border border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3" value={instagram} onChange={(e)=>setInstagram(e.target.value)} placeholder="https://instagram.com/your-profile" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">LinkedIn</label>
            <input className="w-full border border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3" value={linkedin} onChange={(e)=>setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/your-profile" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">{t('work.form.title.label')}</label>
          <input
            className="w-full border border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('work.form.title.placeholder')}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">{t('work.form.summary.label')}</label>
          <textarea
            className="w-full border border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 h-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder={t('work.form.summary.placeholder')}
          />
        </div>

        {/* File upload */}
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">{isRTL ? 'رفع ملف (PDF, Word, PowerPoint, صور)' : 'Upload file (PDF, Word, PowerPoint, Images)'}</label>
          <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp" onChange={(e)=>setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          {fileUploading && <div className="text-sm text-gray-500 mt-1">{isRTL ? 'جاري الرفع...' : 'Uploading...'}</div>}
          {fileInfo?.url && (
            <div className={`mt-2 text-sm ${isRTL ? 'text-right' : ''}`}>
              <a href={fileInfo.url} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{isRTL ? 'تم الرفع: عرض الملف' : 'Uploaded: View file'}</a>
            </div>
          )}
        </div>

        {/* CV upload */}
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">{isRTL ? 'تحميل السيرة الذاتية (CV)' : 'Upload CV'}</label>
          <input type="file" accept=".pdf,.doc,.docx" onChange={(e)=>setCvFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          {cvInfo?.url && (
            <div className={`mt-2 text-sm ${isRTL ? 'text-right' : ''}`}>
              <a href={cvInfo.url} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{isRTL ? 'تم الرفع: عرض السيرة الذاتية' : 'Uploaded: View CV'}</a>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={status==='sending'}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-xl font-medium transition-all disabled:opacity-60 shadow-lg"
          >
            {status==='sending' ? t('work.form.submitting') : t('work.form.submit')}
          </button>
          {status==='done' && <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t('work.form.done')}</span>}
          {status==='error' && <span className="text-red-600">{error}</span>}
        </div>
      </form>
    </div>
  );
};

export default WorkWithUs;
