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

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Fetching social links from API...');
      const response = await fetch(`${API_BASE_URL}/api/social-links`);
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 API response:', data);
      
      if (data.success && Array.isArray(data.data)) {
        setSocialLinks(data.data);
        console.log(`✅ Successfully loaded ${data.data.length} social links`);
      } else {
        setError(data.error || 'Failed to fetch social links');
        setSocialLinks([]);
      }
    } catch (error) {
      console.error('❌ Error fetching social links:', error);
      setError('Failed to connect to server. Please ensure the server is running on port 3000.');
      setSocialLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (link = null) => {
    if (link) {
      setEditingLink(link);
      setFormData({
        platform: link.platform || '',
        url: link.url || '',
        icon: link.icon || '',
        label: link.label || '',
        enabled: link.enabled !== undefined ? link.enabled : true,
        order: link.order || 0
      });
    } else {
      setEditingLink(null);
      setFormData({
        platform: '',
        url: '',
        icon: '',
        label: '',
        enabled: true,
        order: 0
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLink(null);
    setFormData({
      platform: '',
      url: '',
      icon: '',
      label: '',
      enabled: true,
      order: 0
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Auto-set icon and label when platform changes
      if (name === 'platform' && value && platformIcons[value.toLowerCase()]) {
        newData.icon = platformIcons[value.toLowerCase()].default;
        newData.label = newData.label || value.charAt(0).toUpperCase() + value.slice(1);
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.platform || !formData.url) {
      alert('❌ Platform and URL are required');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const url = editingLink 
        ? `${API_BASE_URL}/api/social-links/${editingLink._id}`
        : `${API_BASE_URL}/api/social-links`;
      
      const method = editingLink ? 'PUT' : 'POST';
      
      console.log(`🔄 ${method} request to:`, url);
      console.log('📝 Submitting data:', formData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('📡 Submit response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 Submit response data:', data);

      if (data.success) {
        alert(`✅ Social link ${editingLink ? 'updated' : 'created'} successfully!`);
        fetchSocialLinks();
        handleCloseModal();
      } else {
        console.error('❌ Server returned error:', data);
        alert(`❌ Failed to ${editingLink ? 'update' : 'create'} social link: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error submitting social link:', error);
      alert(`❌ Error ${editingLink ? 'updating' : 'creating'} social link: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (linkId) => {
    if (!window.confirm('Are you sure you want to delete this social link? This action cannot be undone.')) {
      return;
    }
    
    try {
      console.log(`🗑️ Deleting social link: ${linkId}`);
      
      const response = await fetch(`${API_BASE_URL}/api/social-links/${linkId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('📡 Delete response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 Delete response data:', data);

      if (data.success) {
        console.log('✅ Successfully deleted social link');
        alert('✅ Social link deleted successfully!');
        fetchSocialLinks();
      } else {
        console.error('❌ Server returned error:', data);
        alert(`❌ Failed to delete social link: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error deleting social link:', error);
      alert(`❌ Error deleting social link: ${error.message}`);
    }
  };

  const toggleEnabled = async (link) => {
    try {
      console.log(`🔄 Toggling social link ${link._id} enabled status from ${link.enabled} to ${!link.enabled}`);
      
      const updateData = {
        ...link,
        enabled: !link.enabled
      };
      
      console.log('📝 Sending update data:', updateData);
      
      const response = await fetch(`${API_BASE_URL}/api/social-links/${link._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      console.log('📡 Toggle response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 Toggle response data:', data);

      if (data.success) {
        console.log('✅ Successfully toggled social link status');
        fetchSocialLinks();
      } else {
        console.error('❌ Server returned error:', data);
        alert(`❌ Failed to update social link: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error toggling social link:', error);
      alert(`❌ Error updating social link: ${error.message}`);
    }
  };

  const getPlatformIcon = (platform) => {
    if (!platform) return <FaLink className="text-xl text-gray-600" />;
    
    const platformData = platformIcons[platform.toLowerCase()];
    if (platformData) {
      const IconComponent = platformData.icon;
      return <IconComponent className={`text-xl ${platformData.color}`} />;
    }
    return <FaLink className="text-xl text-gray-600" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              📱 Social Media Management
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Manage social media links that appear in the website footer</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchSocialLinks}
              className="bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white px-6 py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <FaSpinner className={`${loading ? 'animate-spin' : ''} transition-transform`} />
              Refresh
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span className="text-xl">➕</span>
              Add Social Link
            </button>
          </div>
        </div>
      </div>

      {/* Modern Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Total Links</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {socialLinks?.length || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">All social media platforms</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Active Links</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  {socialLinks?.filter(link => link?.enabled)?.length || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Currently visible</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Disabled Links</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent">
                  {socialLinks?.filter(link => !link?.enabled)?.length || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Currently hidden</p>
              </div>
              <div className="text-4xl">❌</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Social Links Display */}
      <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-xl font-semibold text-gray-600">Loading social links...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-xl font-bold text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchSocialLinks}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Try Again
            </button>
          </div>
        ) : socialLinks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No social media links found</h3>
            <p className="text-gray-600 mb-8 text-lg">Connect your social media platforms to engage with your audience</p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2 mx-auto"
            >
              <span className="text-xl">➕</span>
              Add Your First Social Link
            </button>
          </div>
        ) : (
          <div className="p-6">
            {/* Social Link Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {socialLinks?.map((link) => (
                <div key={link?._id || Math.random()} className="group bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center text-xl shadow-lg">
                          {getPlatformIcon(link?.platform)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {link?.label || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-600 capitalize">{link.platform}</div>
                        </div>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        link?.enabled 
                          ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700' 
                          : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700'
                      }`}>
                        {link?.enabled ? '✅ Active' : '❌ Disabled'}
                      </span>
                    </div>

                    {/* URL */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🌐</span>
                        <span className="font-semibold text-gray-700">URL</span>
                      </div>
                      <a 
                        href={link.url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 text-sm break-all hover:underline transition-colors"
                      >
                        {link.url || 'No URL provided'}
                      </a>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="bg-gray-50/80 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">📊</span>
                          <span className="font-semibold text-gray-700">Order</span>
                        </div>
                        <p className="text-gray-600">#{link.order || 'N/A'}</p>
                      </div>

                      <div className="bg-gray-50/80 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">📅</span>
                          <span className="font-semibold text-gray-700">Created</span>
                        </div>
                        <p className="text-gray-600">{formatDate(link.createdAt)}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(link)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <FaEdit />
                        Edit
                      </button>

                      <button
                        onClick={() => toggleEnabled(link)}
                        className={`flex-1 ${
                          link.enabled 
                            ? 'bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700' 
                            : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'
                        } text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2`}
                      >
                        {link.enabled ? <FaEyeSlash /> : <FaEye />}
                        {link.enabled ? 'Disable' : 'Enable'}
                      </button>

                      <button
                        onClick={() => handleDelete(link._id)}
                        className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                        title="Delete Link"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {editingLink ? 'Edit Social Link' : 'Add New Social Link'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Platform *
                    </label>
                    <select
                      name="platform"
                      value={formData.platform}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Platform</option>
                      {Object.keys(platformIcons).map(platform => (
                        <option key={platform} value={platform}>
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Label
                    </label>
                    <input
                      type="text"
                      name="label"
                      value={formData.label}
                      onChange={handleInputChange}
                      placeholder="Display label"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL *
                  </label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon Class (Font Awesome)
                  </label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    placeholder="fab fa-facebook"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Auto-filled when platform is selected. Use Font Awesome classes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="enabled"
                        checked={formData.enabled}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Enabled (visible on website)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                  >
                    {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    {submitting ? 'Saving...' : (editingLink ? 'Update Link' : 'Create Link')}
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
