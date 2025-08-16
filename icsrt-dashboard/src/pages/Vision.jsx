import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

const Vision = () => {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    bio: '',
    titleAr: '',
    contentAr: '',
    bioAr: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visionId, setVisionId] = useState(null);

  // Check if user has view permission for vision
  if (!hasPermission('vision', 'view')) {
    return (
      <div className='pt-16'>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h2 className="font-bold text-lg">Access Denied</h2>
          <p>You don't have permission to view vision.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Fetch existing vision data
    console.log('🔍 Fetching vision data...');
    api
      .get('/api/vision')
      .then((data) => {
        console.log('📥 Vision API response:', data);
        // Handle the API response structure {data: [...], pagination: {...}}
        const visionArray = data?.data || data;
        if (Array.isArray(visionArray) && visionArray.length > 0) {
          // Use the most recent vision record (first in array, as they're sorted by creation date desc)
          const visionData = visionArray[0];
          console.log('📋 Using vision data:', visionData);
          setFormData({
            title: visionData.title || '',
            content: visionData.content || '',
            bio: visionData.bio || '',
            titleAr: visionData.titleAr || '',
            contentAr: visionData.contentAr || '',
            bioAr: visionData.bioAr || ''
          });
          setVisionId(visionData._id);
          console.log('✅ Form data set, vision ID:', visionData._id);
        } else {
          console.log('⚠️ No vision data found');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Error fetching vision data:', err);
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
    if (!hasPermission('vision', 'edit')) {
      toast.error("You don't have permission to edit vision.");
      return;
    }
    
    console.log('🔄 Form submitted!');
    console.log('📄 Form data:', formData);
    console.log('🆔 Vision ID:', visionId);
    
    setSaving(true);

    try {
      const doRequest = visionId
        ? () => api.put(`/api/vision/${visionId}`, formData)
        : () => api.post('/api/vision', formData);

      console.log('📡 Submitting vision data via API');
      const result = await doRequest();
      console.log('✅ Success result:', result);
  if (!visionId) {
        setVisionId(result?._id || result?.insertedId || result?.data?._id);
      }
  toast.success('Vision section updated successfully!');
    } catch (err) {
      console.error('💥 Exception during save:', err);
  toast.error('Error occurred while saving.');
    } finally {
      setSaving(false);
      console.log('🏁 Save operation completed');
    }
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen p-6 bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg text-gray-600 bg-white rounded-xl p-8 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
            <span>Loading vision content...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-5xl mx-auto">
        {/* Modern Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <span className="text-white text-2xl">🔮</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Vision Management
              </h1>
              <p className="text-gray-600 mt-1">Define and manage your organization's vision statement</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm">📝</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Vision Content Editor</h2>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* English Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🇺🇸</span>
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  English Content
                </h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    <span className="flex items-center">
                      <span className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mr-2"></span>
                      Title
                    </span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    placeholder="Enter title in English"
                    disabled={!hasPermission('vision', 'edit')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    <span className="flex items-center">
                      <span className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mr-2"></span>
                      Content/Description
                    </span>
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md resize-none"
                    placeholder="Enter content/description in English"
                    disabled={!hasPermission('vision', 'edit')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    <span className="flex items-center">
                      <span className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mr-2"></span>
                      Vision Statement
                    </span>
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md resize-none"
                    placeholder="Enter detailed vision statement in English"
                    disabled={!hasPermission('vision', 'edit')}
                  />
                </div>
              </div>
            </div>

            {/* Arabic Section */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🇸🇦</span>
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Arabic Content
                </h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    <span className="flex items-center">
                      <span className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mr-2"></span>
                      Title (Arabic)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="titleAr"
                    value={formData.titleAr}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    placeholder="أدخل العنوان بالعربية"
                    dir="rtl"
                    disabled={!hasPermission('vision', 'edit')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    <span className="flex items-center">
                      <span className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mr-2"></span>
                      Content/Description (Arabic)
                    </span>
                  </label>
                  <textarea
                    name="contentAr"
                    value={formData.contentAr}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md resize-none"
                    placeholder="أدخل المحتوى/الوصف بالعربية"
                    dir="rtl"
                    disabled={!hasPermission('vision', 'edit')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    <span className="flex items-center">
                      <span className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mr-2"></span>
                      Vision Statement (Arabic)
                    </span>
                  </label>
                  <textarea
                    name="bioAr"
                    value={formData.bioAr}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md resize-none"
                    placeholder="أدخل بيان الرؤية بالعربية"
                    dir="rtl"
                    disabled={!hasPermission('vision', 'edit')}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            {hasPermission('vision', 'edit') && (
              <div className="flex justify-end bg-gray-50 rounded-xl p-6">
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-8 py-3 rounded-xl text-white font-bold transition-all duration-200 transform ${
                    saving
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl'
                  } flex items-center space-x-2`}
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Vision;
