import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

const SocialFooter = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Platform icon mapping using Unicode emojis (no dependency on Font Awesome)
  const platformEmojis = {
    facebook: '📘',
    twitter: '🐦', 
    instagram: '📷',
    linkedin: '💼',
    youtube: '📺',
    github: '🐙',
    tiktok: '🎵',
    whatsapp: '💬',
    telegram: '✈️',
    discord: '🎮'
  };

  const fetchSocialLinks = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching social media links for footer...');

      // Prefer the enabled-only endpoint; fall back to full list if not available
      let links = [];
      try {
        links = await api.get('/api/social-links/enabled');
      } catch (err) {
        // If 404 or server doesn't support /enabled, fall back and filter client-side
        console.warn('ℹ️ /enabled endpoint unavailable, falling back to /api/social-links');
        const all = await api.get('/api/social-links');
        links = Array.isArray(all) ? all.filter(l => l.enabled) : [];
      }

      // Sort by order
      links.sort((a, b) => (a.order || 0) - (b.order || 0));
      setSocialLinks(links);
      console.log('✅ Social links loaded for footer:', links);
    } catch (error) {
      console.error('❌ Footer social links fetch error:', error);
      setSocialLinks([]); // Fail silently for user-facing component
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center space-x-4 py-4">
        <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (socialLinks.length === 0) {
    return null; // Don't show anything if no social links
  }

  return (
    <div className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-6">Connect With Us</h3>
          <div className="flex justify-center space-x-6 mb-8">
      {socialLinks.map((link) => (
              <a
        key={link.id || link._id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-12 h-12 bg-gray-800 hover:bg-blue-600 rounded-full transition-all duration-300 transform hover:scale-110"
                title={link.label || link.platform}
              >
                <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                  {platformEmojis[link.platform.toLowerCase()] || '🔗'}
                </span>
              </a>
            ))}
          </div>
          <p className="text-gray-400 text-sm">
            Follow us for the latest updates and research insights
          </p>
        </div>
        
        {/* Additional Footer Content */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 ICSRT. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialFooter;
