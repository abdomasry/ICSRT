import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const About = () => {
  const { hasPermission } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    titleAr: '',
    bioAr: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aboutId, setAboutId] = useState(null);

  // Check if user has view permission for about
  if (!hasPermission('about', 'view')) {
    return (
      <div className='pt-16'>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h2 className="font-bold text-lg">Access Denied</h2>
          <p>You don't have permission to view about section.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Fetch existing about data
    console.log('🔍 Fetching about data...');
    api
      .get('/api/about')
      .then((data) => {
        console.log('📥 About API response:', data);
        // Handle the API response structure {data: [...], pagination: {...}}
        const aboutArray = data?.data || data;
        if (Array.isArray(aboutArray) && aboutArray.length > 0) {
          // Use the most recent about record (first in array, as they're sorted by creation date desc)
          const aboutData = aboutArray[0];
          console.log('📋 Using about data:', aboutData);
          setFormData({
            title: aboutData.title || '',
            content: aboutData.content || '',
            bio: aboutData.bio || '',
            titleAr: aboutData.titleAr || '',
            contentAr: aboutData.contentAr || '',
            bioAr: aboutData.bioAr || ''
          });
          setAboutId(aboutData._id);
          console.log('✅ Form data set, about ID:', aboutData._id);
        } else {
          console.log('⚠️ No about data found');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Error fetching about data:', err);
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check permission for edit
    if (!hasPermission('about', 'edit')) {
      alert('You don\'t have permission to edit about section.');
      return;
    }
    
    console.log('🔄 Form submitted!');
    console.log('📄 Form data:', formData);
    console.log('🆔 About ID:', aboutId);
    
    setSaving(true);

    try {
      const doRequest = aboutId
        ? () => api.put(`/api/about/${aboutId}`, formData)
        : () => api.post('/api/about', formData);

      console.log('📡 Submitting about data via API');
      const result = await doRequest();
      console.log('✅ Success result:', result);
      if (!aboutId) {
        setAboutId(result?._id || result?.insertedId || result?.data?._id);
      }
      alert('About section updated successfully!');
    } catch (err) {
      console.error('💥 Exception during save:', err);
      alert('Error occurred while saving.');
    } finally {
      setSaving(false);
      console.log('🏁 Save operation completed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl font-semibold text-gray-600">Loading about section...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl p-6 md:p-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="text-4xl">ℹ️</div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              About Section Management
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Manage your organization's about information and biography</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* English Section */}
          <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">🇺🇸</div>
              <h2 className="text-2xl font-bold text-gray-800">English Content</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <span className="text-lg">📝</span>
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm font-medium transition-all duration-200"
                  placeholder="Enter title in English"
                  disabled={!hasPermission('about', 'edit')}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <span className="text-lg">📄</span>
                  Content/Description
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm font-medium transition-all duration-200 resize-none"
                  placeholder="Enter content/description in English"
                  disabled={!hasPermission('about', 'edit')}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <span className="text-lg">📖</span>
                  Bio/About Us
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm font-medium transition-all duration-200 resize-none"
                  placeholder="Enter detailed biography in English"
                  disabled={!hasPermission('about', 'edit')}
                />
              </div>
            </div>
          </div>

          {/* Arabic Section */}
          <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">🇸🇦</div>
              <h2 className="text-2xl font-bold text-gray-800">Arabic Content</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <span className="text-lg">📝</span>
                  Title (Arabic)
                </label>
                <input
                  type="text"
                  name="titleAr"
                  value={formData.titleAr}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm font-medium transition-all duration-200"
                  placeholder="أدخل العنوان بالعربية"
                  dir="rtl"
                  disabled={!hasPermission('about', 'edit')}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <span className="text-lg">📄</span>
                  Content/Description (Arabic)
                </label>
                <textarea
                  name="contentAr"
                  value={formData.contentAr}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm font-medium transition-all duration-200 resize-none"
                  placeholder="أدخل المحتوى/الوصف بالعربية"
                  dir="rtl"
                  disabled={!hasPermission('about', 'edit')}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <span className="text-lg">📖</span>
                  Bio/About Us (Arabic)
                </label>
                <textarea
                  name="bioAr"
                  value={formData.bioAr}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm font-medium transition-all duration-200 resize-none"
                  placeholder="أدخل معلومات مفصلة عن المؤسسة بالعربية"
                  dir="rtl"
                  disabled={!hasPermission('about', 'edit')}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center">
            {hasPermission('about', 'edit') && (
              <button
                type="submit"
                disabled={saving}
                className={`group px-8 py-4 rounded-xl text-white font-bold text-lg transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3 ${
                  saving
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                }`}
              >
                {saving ? (
                  <>
                    <span className="text-xl animate-spin">⏳</span>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <span className="text-xl">💾</span>
                    Save Changes
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default About;