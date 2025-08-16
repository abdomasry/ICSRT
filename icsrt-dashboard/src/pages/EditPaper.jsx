import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiUpload } from '../utils/api';
import { api, API_BASE_URL } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const EditPaper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const toast = useToast();

  // Check if user has permission to edit articles
  if (!hasPermission('papers', 'edit')) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Access Denied</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>You don't have permission to edit articles.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [form, setForm] = useState({ 
  title: '', 
  titleAr: '',
    author: '', 
  abstract: '', 
  abstractAr: '',
  content: '', 
  contentAr: '',
    image: '',
    category: '',
    tags: '',
  excerpt: '',
  excerptAr: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeLangTab, setActiveLangTab] = useState('en');

  useEffect(() => {
    api.get(`/api/news/${id}`)
      .then(data => {
        setForm({
          title: data.title || '',
      titleAr: data.titleAr || '',
          author: data.author || '',
          abstract: data.abstract || '',
      abstractAr: data.abstractAr || '',
          content: data.content || '',
      contentAr: data.contentAr || '',
          image: data.image || '',
          category: data.category || '',
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : data.tags || '',
      excerpt: data.excerpt || '',
      excerptAr: data.excerptAr || ''
        });
      })
      .catch(err => console.error('Fetch error:', err));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await api.put(`/api/news/${id}`, {
        ...form,
        type: 'article',
        updatedAt: new Date().toISOString()
      });
        toast.success('Article updated successfully!');
        navigate('/papers');
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while updating.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
  const result = await apiUpload(`${API_BASE_URL}/api/upload`, file);
      setForm(prev => ({ ...prev, image: result.url }));
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Image upload failed. Please try a smaller image (max 5MB).');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Article</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 mb-2">
          <button type="button" onClick={() => setActiveLangTab('en')} className={`px-3 py-1 rounded ${activeLangTab==='en' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>English</button>
          <button type="button" onClick={() => setActiveLangTab('ar')} className={`px-3 py-1 rounded ${activeLangTab==='ar' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>العربية</button>
        </div>
  {activeLangTab==='en' && (<div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Article Title *</label>
          <input 
            type="text" 
            name="title" 
            placeholder="Enter article title" 
            value={form.title} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" 
          />
  </div>)}
  {activeLangTab==='ar' && (<div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">عنوان المقال (عربي)</label>
          <input 
            type="text" 
            name="titleAr" 
            placeholder="اكتب عنوان المقال" 
            value={form.titleAr} 
            onChange={handleChange} 
            disabled={isLoading}
            dir="rtl"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" 
          />
  </div>)}
        
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Author *</label>
          <input 
            type="text" 
            name="author" 
            placeholder="Article author name" 
            value={form.author} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Article Image</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <input 
                type="url" 
                name="image" 
                placeholder="https://example.com/article-image.jpg" 
                value={form.image} 
                onChange={handleChange} 
                disabled={isLoading || uploading}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" 
              />
              <p className="text-sm text-gray-500 mt-1">Paste an image URL or upload a file</p>
            </div>
            <div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                disabled={isLoading || uploading}
                className="w-full border border-gray-300 rounded-lg p-2 disabled:bg-gray-100" 
              />
              <p className="text-sm text-gray-500 mt-1">From your PC (max 5MB)</p>
            </div>
          </div>
          {form.image ? (
            <img src={form.image} alt="Preview" className="mt-3 h-28 w-28 object-cover rounded border" />
          ) : null}
        </div>
        
  {activeLangTab==='en' && (<div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Excerpt</label>
          <textarea 
            name="excerpt" 
            placeholder="Brief summary or excerpt of the article" 
            value={form.excerpt} 
            onChange={handleChange} 
            disabled={isLoading}
            rows="2"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
  </div>)}
  {activeLangTab==='ar' && (<div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">ملخص قصير (عربي)</label>
          <textarea 
            name="excerptAr" 
            placeholder="ملخص موجز للمقال" 
            value={form.excerptAr} 
            onChange={handleChange} 
            disabled={isLoading}
            rows="2"
            dir="rtl"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
  </div>)}
        
  {activeLangTab==='en' && (<div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Abstract</label>
          <textarea 
            name="abstract" 
            placeholder="Article abstract or introduction" 
            value={form.abstract} 
            onChange={handleChange} 
            disabled={isLoading}
            rows="3"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
  </div>)}
  {activeLangTab==='ar' && (<div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">الملخص (عربي)</label>
          <textarea 
            name="abstractAr" 
            placeholder="الملخص أو المقدمة" 
            value={form.abstractAr} 
            onChange={handleChange} 
            disabled={isLoading}
            rows="3"
            dir="rtl"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
  </div>)}
        
  {activeLangTab==='en' && (<div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Full Content</label>
          <textarea 
            name="content" 
            placeholder="Full article content" 
            value={form.content} 
            onChange={handleChange} 
            disabled={isLoading}
            rows="8"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
  </div>)}
  {activeLangTab==='ar' && (<div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">المحتوى الكامل (عربي)</label>
          <textarea 
            name="contentAr" 
            placeholder="المحتوى الكامل للمقال" 
            value={form.contentAr} 
            onChange={handleChange} 
            disabled={isLoading}
            rows="8"
            dir="rtl"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
  </div>)}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Category</label>
            <input 
              type="text" 
              name="category" 
              placeholder="e.g., Research, Technology, Science" 
              value={form.category} 
              onChange={handleChange} 
              disabled={isLoading}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Tags</label>
            <input 
              type="text" 
              name="tags" 
              placeholder="research, science, technology (comma separated)" 
              value={form.tags} 
              onChange={handleChange} 
              disabled={isLoading}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" 
            />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/papers')}
            disabled={isLoading}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-semibold transition-colors disabled:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPaper;