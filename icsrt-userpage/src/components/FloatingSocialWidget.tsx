'use client';
import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
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
  FaLink,
  FaGlobe,
  FaTimes,
  FaShare 
} from 'react-icons/fa';

const FloatingSocialWidget = ({ className = "" }) => {
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Platform icons mapping
  const platformIcons = {
    facebook: FaFacebook,
    twitter: FaTwitter,
    instagram: FaInstagram,
    linkedin: FaLinkedin,
    youtube: FaYoutube,
    tiktok: FaTiktok,
    snapchat: FaSnapchat,
    telegram: FaTelegram,
    whatsapp: FaWhatsapp,
    discord: FaDiscord,
    pinterest: FaPinterest,
    github: FaGithub,
    website: FaGlobe,
    custom: FaLink
  };

  // Platform colors mapping
  const platformColors = {
    facebook: 'hover:bg-blue-600 hover:text-white',
    twitter: 'hover:bg-blue-400 hover:text-white',
    instagram: 'hover:bg-pink-500 hover:text-white',
    linkedin: 'hover:bg-blue-700 hover:text-white',
    youtube: 'hover:bg-red-600 hover:text-white',
    tiktok: 'hover:bg-black hover:text-white',
    snapchat: 'hover:bg-yellow-400 hover:text-black',
    telegram: 'hover:bg-blue-500 hover:text-white',
    whatsapp: 'hover:bg-green-500 hover:text-white',
    discord: 'hover:bg-indigo-600 hover:text-white',
    pinterest: 'hover:bg-red-700 hover:text-white',
    github: 'hover:bg-gray-800 hover:text-white',
    website: 'hover:bg-gray-600 hover:text-white',
    custom: 'hover:bg-gray-600 hover:text-white'
  };

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      setLoading(true);
      console.log('🔄 FloatingSocialWidget: Fetching social links...');
      
  const data = await api.get('/api/social-links/enabled');
  const links = Array.isArray(data) ? data : [];
  const sorted = links.sort((a, b) => (a.order || 0) - (b.order || 0));
  console.log('✅ FloatingSocialWidget: Enabled links:', sorted);
  setSocialLinks(sorted);
    } catch (error) {
      console.error('❌ FloatingSocialWidget: Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform) => {
    return platformIcons[platform?.toLowerCase()] || FaLink;
  };

  const getPlatformColor = (platform) => {
    return platformColors[platform?.toLowerCase()] || 'hover:bg-gray-600 hover:text-white';
  };

  // Don't render if no social links
  if (loading || socialLinks.length === 0) {
    return null;
  }

  return (
    <div className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-50 ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 mb-2"
        title="Social Media Links"
        aria-label="Toggle social media links"
      >
        {isOpen ? <FaTimes className="w-5 h-5" /> : <FaShare className="w-5 h-5" />}
      </button>

      {/* Social Links Panel */}
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-[200px] animate-fade-in">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 text-center">
            Follow Us
          </h3>
          
          <div className="space-y-2">
            {socialLinks.map((link) => {
              const IconComponent = getPlatformIcon(link.platform);
              const colorClass = getPlatformColor(link.platform);
              
              return (
                <a
                  key={link._id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 ${colorClass} group`}
                  title={link.label || link.platform}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium capitalize">
                    {link.label || link.platform}
                  </span>
                </a>
              );
            })}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Stay connected with ICSRT
            </p>
          </div>
        </div>
      )}
      
  {/* Custom Animation Styles */}
  <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FloatingSocialWidget;
