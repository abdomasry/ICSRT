'use client';
import React, { useState } from 'react';
import { apiUpload } from '../utils/api';
import { api, API_BASE_URL } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const AddService = () => {
  const [form, setForm] = useState({ 
  title: '', 
  titleAr: '',
  description: '', 
  descriptionAr: '',
    image: '',
    price: '',
    features: '',
    duration: ''
  });
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [activeLangTab, setActiveLangTab] = useState('en');
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/api/services', form);
        toast.success('Service added successfully!');
        navigate('/services');
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while adding service.');
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
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Service</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 mb-2">
          <button type="button" onClick={() => setActiveLangTab('en')} className={`px-3 py-1 rounded ${activeLangTab==='en' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>English</button>
          <button type="button" onClick={() => setActiveLangTab('ar')} className={`px-3 py-1 rounded ${activeLangTab==='ar' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>العربية</button>
        </div>
  {activeLangTab==='en' && (<div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Service Title *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Enter service title"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
  </div>)}
  {activeLangTab==='ar' && (<div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">عنوان الخدمة (عربي)</label>
          <input
            type="text"
            name="titleAr"
            value={form.titleAr}
            onChange={handleChange}
            placeholder="اكتب عنوان الخدمة"
            dir="rtl"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
  </div>)}
        
  {activeLangTab==='en' && (<div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Service Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            placeholder="Describe the service in detail"
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
  </div>)}
  {activeLangTab==='ar' && (<div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">وصف الخدمة (عربي)</label>
          <textarea
            name="descriptionAr"
            value={form.descriptionAr}
            onChange={handleChange}
            placeholder="وصف الخدمة باللغة العربية"
            rows={4}
            dir="rtl"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
  </div>)}
        
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Service Image</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <input
                type="url"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://example.com/service-image.jpg"
                disabled={uploading}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">Paste an image URL or upload a file</p>
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
              <p className="text-sm text-gray-500 mt-1">From your PC (max 5MB)</p>
            </div>
          </div>
          {form.image ? (
            <img src={form.image} alt="Preview" className="mt-3 h-28 w-28 object-cover rounded border" />
          ) : null}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Price</label>
            <input
              type="text"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="e.g., $99 or Contact for quote"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Duration</label>
            <input
              type="text"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              placeholder="e.g., 2-3 weeks"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Key Features</label>
          <textarea
            name="features"
            value={form.features}
            onChange={handleChange}
            placeholder="List key features, separated by lines or commas"
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">Optional: List the main features or benefits</p>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold transition-colors"
          >
            Add Service
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddService;
