'use client';

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTachometerAlt, FaUsers, FaFileAlt, FaClipboardList, FaEnvelope, FaCog, FaQuestionCircle, FaInfoCircle, FaEye, FaShoppingCart, FaEnvelopeOpen, FaSignOutAlt, FaLock, FaTicketAlt, FaShareAlt, FaGift } from 'react-icons/fa';
import { useAuth } from './context/AuthContext';

const linkItems = [
  { name: 'dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
  { name: 'admins', icon: <FaUsers />, label: 'Admins' },
  { name: 'roles', icon: <FaLock />, label: 'Roles', superAdminOnly: true },
  { name: 'users', icon: <FaUsers />, label: 'Users' },
  { name: 'service-orders', icon: <FaShoppingCart />, label: 'Service Orders' },
  { name: 'coupons', icon: <FaGift />, label: 'Coupons' },
  { name: 'services', icon: <FaCog />, label: 'Services' },
  { name: 'papers', icon: <FaFileAlt />, label: 'Articles' },
  { name: 'newsletter-subscribers', icon: <FaEnvelopeOpen />, label: 'Newsletter' },
  { name: 'faq', icon: <FaQuestionCircle />, label: 'FAQ' },
  { name: 'contact-requests', icon: <FaEnvelope />, label: 'Contact Messages' },
  { name: 'tickets', icon: <FaTicketAlt />, label: 'Support Tickets' },
  { name: 'social-media', icon: <FaShareAlt />, label: 'Social Media' },
  // Researcher collaborations management
  { name: 'collaborations', icon: <FaClipboardList />, label: 'Collaborations' },
  { name: 'about', icon: <FaInfoCircle />, label: 'About' },
  { name: 'mission', icon: <FaInfoCircle />, label: 'Mission' },
  { name: 'vision', icon: <FaEye />, label: 'Vision' }
];

const Sidebar = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();
  const isDev = process.env.NODE_ENV !== 'production';

  // Filter menu items based on permissions
  const filteredLinkItems = linkItems.filter(item => {
    if (isDev) console.log(`Checking menu item: ${item.name}`);
    
    // Check if item requires super admin access
    if (item.superAdminOnly) {
      const isSuperAdmin = user?.type === 'super_admin';
      if (isDev) console.log(`Item ${item.name} requires super admin, user is super admin:`, isSuperAdmin);
      return isSuperAdmin;
    }
    
    // Otherwise check normal permissions
    const hasAccess = hasPermission(item.name);
    if (isDev) console.log(`Item ${item.name} permission check result:`, hasAccess);
    return hasAccess;
  });
  if (isDev) console.log('Filtered menu items:', filteredLinkItems.map(item => item.name));

  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {menuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile Top Bar*/}
      <div className="md:hidden fixed top-0 left-0 w-full bg-white shadow p-4 z-[60] flex justify-between items-center">
        <div className="text-xl font-bold text-blue-700">ICSRT Dashboard</div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800"
            title="Logout"
          >
            <FaSignOutAlt />
          </button>
          <button
            className="text-2xl text-gray-700 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <FaBars />
          </button>
        </div>
      </div>

      {/* Dropdown Menu under Hamburger */}
      {menuOpen && (
        <div className="md:hidden fixed top-[64px] left-0 w-full bg-white shadow-lg z-[55] p-4 space-y-2 border-t max-h-[calc(100vh-64px)] overflow-y-auto">
          {filteredLinkItems.map(({ name, icon, label }) => (
            <Link
              key={name}
              to={`/${name}`}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname === `/${name}` 
                  ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className={`text-lg ${location.pathname === `/${name}` ? 'text-blue-600' : 'text-gray-500'}`}>
                {icon}
              </span>
              <span>{label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-red-600 hover:bg-red-50 w-full"
          >
            <FaSignOutAlt className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-white shadow-lg z-50 border-r border-gray-200">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm">
            <h1 className="text-xl font-bold">ICSRT Dashboard</h1>
          </div>
          
          {/* User Info */}
          <div className="px-4 py-3 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-600 capitalize">
                  {user?.type === 'super_admin' ? 'Super Administrator' : (user?.role_data?.name || user?.type?.replace('_', ' ') || 'Administrator')}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 p-2 ml-2"
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 bg-white overflow-y-auto">
            <div className="space-y-1">
              {filteredLinkItems.map(({ name, icon, label }) => (
                <Link
                  key={name}
                  to={`/${name}`}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    location.pathname === `/${name}`
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:scale-105'
                  }`}
                >
                  <span className={`mr-3 flex-shrink-0 text-lg ${
                    location.pathname === `/${name}` ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {icon}
                  </span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </nav>
          
          {/* Footer */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              ICSRT Content Management
            </div>
            <div className="text-xs text-gray-400 text-center mt-1">
              v2.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
