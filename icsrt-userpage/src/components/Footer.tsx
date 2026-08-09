'use client';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
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
  FaGlobe,
  FaLink
} from 'react-icons/fa';

const Footer = () => {
  const { t } = useLanguage();
  const tx = (key, fallback) => {
    try {
      const val = t(key);
      if (typeof val === 'string' && val && val !== key) return val;
    } catch {}
    return fallback ?? key;
  };
  const [socialLinks, setSocialLinks] = useState<any[]>([]);

  // (Removed dev-only quick setup function)

  // state already declared above

  // Platform icon mapping
  const platformIcons = {
    facebook: FaFacebook,
    twitter: FaTwitter,
    instagram: FaInstagram,
    linkedin: FaLinkedin,
    youtube: FaYoutube,
    tiktok: FaTiktok,
    whatsapp: FaWhatsapp,
    telegram: FaTelegram,
    discord: FaDiscord,
    snapchat: FaSnapchat,
    pinterest: FaPinterest,
    github: FaGithub,
    website: FaGlobe,
    custom: FaLink
  };

  const platformColors = {
    facebook: 'text-blue-600 hover:text-blue-700',
    twitter: 'text-blue-400 hover:text-blue-500',
    instagram: 'text-pink-600 hover:text-pink-700',
    linkedin: 'text-blue-700 hover:text-blue-800',
    youtube: 'text-red-600 hover:text-red-700',
    tiktok: 'text-gray-900 hover:text-black',
    whatsapp: 'text-green-600 hover:text-green-700',
    telegram: 'text-blue-500 hover:text-blue-600',
    discord: 'text-indigo-600 hover:text-indigo-700',
    snapchat: 'text-yellow-500 hover:text-yellow-600',
    pinterest: 'text-red-700 hover:text-red-800',
    github: 'text-gray-900 hover:text-black',
    website: 'text-gray-600 hover:text-gray-700',
    custom: 'text-gray-600 hover:text-gray-700'
  };

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      console.log('🔄 Footer: Fetching enabled social links via /api/social-links/enabled...');
      let data;
      let links: any[] = [];

      try {
        data = await api.get('/api/social-links/enabled');
        links = Array.isArray(data) ? data : [];
      } catch (err) {
        // If endpoint not found (older server), fall back to full list and filter client-side
        if (err && (err.status === 404 || String(err).includes('/api/social-links/enabled'))) {
          console.warn('⚠️ /api/social-links/enabled not found. Falling back to /api/social-links and filtering enabled items.');
          const all = await api.get('/api/social-links');
          links = Array.isArray(all) ? all.filter(l => l.enabled) : [];
        } else {
          throw err; // rethrow unexpected errors
        }
      }

      const sorted = links.sort((a, b) => (a.order || 0) - (b.order || 0));
      console.log('✅ Footer: Enabled social links:', sorted);
      setSocialLinks(sorted);
    } catch (error) {
      console.error('❌ Footer: Fetch Error:', error?.message || error);
      // Only hint about backend down for network-type errors
      if (!error?.status) {
        console.error('❌ Footer: This can mean the backend server is not running or unreachable at the configured API base URL.');
      }
    }
  };

  const getPlatformIcon = (platform) => {
    const IconComponent = platformIcons[platform?.toLowerCase()] || FaLink;
    return IconComponent;
  };

  const getPlatformColor = (platform) => {
    return platformColors[platform?.toLowerCase()] || 'text-gray-600 hover:text-gray-700';
  };

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-16">
      {/* Top banner removed per request; keeping only the bottom section */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                I
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                ICSRT
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
              {tx('footer.about.desc', 'International Conference for Scientific Research and Technology. Advancing scientific knowledge and fostering global collaboration.')}
            </p>
            
            {/* Social Media Links */}
            {socialLinks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                  {tx('footer.followUs', 'Follow Us')}
                </h3>
                <div className="flex flex-wrap gap-3">
      {socialLinks.map((link) => {
                    const IconComponent = getPlatformIcon(link.platform);
                    const colorClass = getPlatformColor(link.platform);
                    
                    return (
                      <a
        key={link.id || link._id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group relative inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full ${colorClass} transition-all duration-300 hover:scale-110 hover:shadow-lg transform hover:-translate-y-1`}
                        title={link.label || link.platform}
                        aria-label={`Follow us on ${link.label || link.platform}`}
                      >
                        <IconComponent className="w-5 h-5 transition-all duration-200" />
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                          {link.label || link.platform}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </a>
                    );
                  })}
                </div>
                
                {/* Social Media CTA */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  {tx('footer.socialCTA', 'Stay connected with us for the latest updates and announcements.')}
                </p>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">
              {tx('footer.quickLinks', 'Quick Links')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {tx('nav.about', 'About')}
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {tx('nav.contact', 'Contact')}
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {tx('nav.faq', 'FAQ')}
                </a>
              </li>
              <li>
                <a href="/articles" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {tx('nav.articles', 'Articles')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">
              {tx('footer.contact', 'Contact')}
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>
                <a href="mailto:info@icsrt.com" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  info@icsrt.com
                </a>
              </li>
              <li>
                <a href="mailto:support@icsrt.com" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  support@icsrt.com
                </a>
              </li>
              <li className="pt-2">
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 transition-colors"
                >
                  {tx('footer.contactUs', 'Contact Us')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            © {new Date().getFullYear()} ICSRT. {tx('footer.allRightsReserved', 'All rights reserved.')}
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-6 text-sm">
            <a href="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {tx('footer.privacy', 'Privacy Policy')}
            </a>
            <a href="/terms" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {tx('footer.terms', 'Terms of Service')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
