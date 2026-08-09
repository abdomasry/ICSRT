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
  FaSpinner 
} from 'react-icons/fa';

const SocialMediaFooter = ({ className = "" }) => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    facebook: 'hover:text-blue-600',
    twitter: 'hover:text-blue-400',
    instagram: 'hover:text-pink-500',
    linkedin: 'hover:text-blue-700',
    youtube: 'hover:text-red-600',
    tiktok: 'hover:text-black',
    snapchat: 'hover:text-yellow-400',
    telegram: 'hover:text-blue-500',
    whatsapp: 'hover:text-green-500',
    discord: 'hover:text-indigo-600',
    pinterest: 'hover:text-red-700',
    github: 'hover:text-gray-800',
    website: 'hover:text-gray-600',
    custom: 'hover:text-gray-600'
  };

  // Fetch enabled social links from API
  const fetchSocialLinks = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Fetching enabled social links for footer via /api/social-links/enabled...');
      const data = await api.get('/api/social-links/enabled');
      const linksArray = Array.isArray(data) ? data : [];
      const sorted = linksArray.sort((a, b) => (a.order || 0) - (b.order || 0));
      setSocialLinks(sorted);
      console.log(`✅ Found ${sorted.length} enabled social links`);
      
    } catch (err) {
      console.error('❌ Error fetching social links:', err);
      setError(err.message);
      // Fallback to empty array on error
      setSocialLinks([]);
    } finally {
      setLoading(false);
    }
  };

  // Load social links on component mount
  useEffect(() => {
    fetchSocialLinks();
  }, []);

  // Don't render anything if loading
  if (loading) {
    return (
      <div className={`flex justify-center items-center py-4 ${className}`}>
        <FaSpinner className="animate-spin text-gray-400 text-xl" />
        <span className="ml-2 text-gray-500 text-sm">Loading social links...</span>
      </div>
    );
  }

  // Don't show anything if there's an error or no links
  if (error || socialLinks.length === 0) {
    return null;
  }

  return (
    <div className={`social-media-footer ${className}`}>
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 py-6">
        <span className="text-gray-600 font-medium text-sm sm:text-base">
          Follow Us:
        </span>
        
        <div className="flex flex-wrap justify-center gap-4">
          {socialLinks.map((link) => {
            const IconComponent = platformIcons[link.platform?.toLowerCase()] || FaLink;
            const colorClass = platformColors[link.platform?.toLowerCase()] || 'hover:text-gray-600';
            
            return (
              <a
                key={link.id || link._id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-gray-500 ${colorClass} transition-all duration-200 transform hover:scale-110 p-2 rounded-full hover:bg-gray-100`}
                title={`Follow us on ${link.label || link.platform}`}
                aria-label={`Follow us on ${link.label || link.platform}`}
              >
                <IconComponent className="text-2xl sm:text-3xl" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaFooter;
