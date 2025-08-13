import React, { useState, useEffect } from 'react';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaYoutube,
  FaTiktok,
  FaWhatsapp,
  FaTelegram,
  FaDiscord,
  FaSnapchat,
  FaPinterest,
  FaGithub,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaLink,
  FaGlobe,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const SocialMediaManagement = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = 'http://localhost:3000';

  // Form state
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    icon: '',
    label: '',
    enabled: true,
    order: 0
  });

  // Predefined platform icons
  const platformIcons = {
    facebook: { icon: FaFacebook, color: 'text-blue-600', default: 'fab fa-facebook' },
    twitter: { icon: FaTwitter, color: 'text-blue-400', default: 'fab fa-twitter' },
    instagram: { icon: FaInstagram, color: 'text-pink-600', default: 'fab fa-instagram' },
    linkedin: { icon: FaLinkedin, color: 'text-blue-700', default: 'fab fa-linkedin' },
    youtube: { icon: FaYoutube, color: 'text-red-600', default: 'fab fa-youtube' },
    tiktok: { icon: FaTiktok, color: 'text-gray-900', default: 'fab fa-tiktok' },
    whatsapp: { icon: FaWhatsapp, color: 'text-green-600', default: 'fab fa-whatsapp' },
    telegram: { icon: FaTelegram, color: 'text-blue-500', default: 'fab fa-telegram' },
    discord: { icon: FaDiscord, color: 'text-indigo-600', default: 'fab fa-discord' },
    snapchat: { icon: FaSnapchat, color: 'text-yellow-500', default: 'fab fa-snapchat' },
    pinterest: { icon: FaPinterest, color: 'text-red-700', default: 'fab fa-pinterest' },
    github: { icon: FaGithub, color: 'text-gray-900', default: 'fab fa-github' },
    website: { icon: FaGlobe, color: 'text-gray-600', default: 'fas fa-globe' },
    custom: { icon: FaLink, color: 'text-gray-600', default: 'fas fa-link' }
  };

  // Fetch social media links
  const fetchSocialLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching social media links...');
      const response = await fetch('http://localhost:3000/api/social-links');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Fetched social links:', data);
      
      if (data.success) {
        setSocialLinks(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch social links');
      }
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(`Failed to load social media links: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load social links on component mount
  useEffect(() => {
    fetchSocialLinks();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const url = editingLink 
        ? `http://localhost:3000/api/social-links/${editingLink._id}`
        : 'http://localhost:3000/api/social-links';
      
      const method = editingLink ? 'PUT' : 'POST';
      
      console.log(`🔄 ${method} social link:`, formData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Submit result:', result);
      
      if (result.success) {
        await fetchSocialLinks(); // Refresh the list
        resetForm();
        setIsModalOpen(false);
      } else {
        throw new Error(result.error || 'Operation failed');
      }
    } catch (err) {
      console.error('❌ Submit error:', err);
      setError(`Failed to save social link: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this social media link?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      console.log(`🔄 Deleting social link: ${id}`);
      const response = await fetch(`http://localhost:3000/api/social-links/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Delete result:', result);
      
      if (result.success) {
        await fetchSocialLinks(); // Refresh the list
      } else {
        throw new Error(result.error || 'Delete failed');
      }
    } catch (err) {
      console.error('❌ Delete error:', err);
      setError(`Failed to delete social link: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle platform selection
  const handlePlatformChange = (platform) => {
    const platformInfo = platformOptions.find(p => p.value === platform);
    setFormData({
      ...formData,
      platform: platform,
      label: platformInfo?.label || platform,
      icon: platformInfo?.icon || `fab fa-${platform}`
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      platform: '',
      url: '',
      icon: '',
      label: '',
      enabled: true
    });
    setEditingLink(null);
  };

  // Handle edit
  const handleEdit = (link) => {
    setEditingLink(link);
    setFormData({
      platform: link.platform || '',
      url: link.url || '',
      icon: link.icon || '',
      label: link.label || '',
      enabled: link.enabled !== false
    });
    setIsModalOpen(true);
  };

  // Handle add new
  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Social Media Management
                </h1>
                <p className="text-gray-600 mt-1">Manage your social media links and presence</p>
              </div>
            </div>
            <button
              onClick={handleAddNew}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
              <span>Add Social Link</span>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading social media links...</p>
          </div>
        )}

        {/* Social Links Grid */}
        {!loading && socialLinks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {socialLinks.map((link) => (
              <div
                key={link._id}
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <i className={`${link.icon} text-white text-lg`}></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{link.label || link.platform}</h3>
                      <p className="text-sm text-gray-500">Order: {link.order}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {link.enabled ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 break-all">{link.url}</p>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(link)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(link._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && socialLinks.length === 0 && (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Social Media Links</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first social media link</p>
            <button
              onClick={handleAddNew}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Add Social Link</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingLink ? 'Edit Social Link' : 'Add Social Link'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Platform Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => handlePlatformChange(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Platform</option>
                    {platformOptions.map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    required
                    placeholder="https://..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Label */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Display name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon (Font Awesome class)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="fab fa-facebook"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Enabled */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enabled" className="ml-2 text-sm font-medium text-gray-700">
                    Enabled
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingLink ? 'Update' : 'Create'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaManagement;
