import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const linkItems = [
  { name: 'dashboard', icon: '📊', label: 'Dashboard' },
  { name: 'admins', icon: '👥', label: 'Admins' },
  { name: 'roles', icon: '🛡️', label: 'Roles', superAdminOnly: true },
  { name: 'users', icon: '👤', label: 'Users' },
  { name: 'registrations', icon: '📋', label: 'Registrations' },
  { name: 'service-orders', icon: '🛒', label: 'Service Orders' },
  { name: 'services', icon: '⚙️', label: 'Services' },
  { name: 'papers', icon: '📄', label: 'Articles' },
  { name: 'events', icon: '📅', label: 'Events' },
  { name: 'newsletter-subscribers', icon: '✉️', label: 'Newsletter' },
  { name: 'testimonials', icon: '💬', label: 'Testimonials' },
  { name: 'faq', icon: '❓', label: 'FAQ' },
  { name: 'contact-requests', icon: '📧', label: 'Contact Messages' },
  { name: 'about', icon: 'ℹ️', label: 'About' },
  { name: 'mission', icon: 'ℹ️', label: 'Mission' },
  { name: 'vision', icon: '👁️', label: 'Vision' }
];

const Sidebar = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();

  // Filter menu items based on permissions
  const filteredLinkItems = linkItems.filter(item => {
    if (item.superAdminOnly && user?.role !== 'super_admin') {
      return false;
    }
    
    if (user?.role === 'super_admin') {
      return true;
    }
    
    return hasPermission(item.name, 'view');
  });

  const isActive = (itemName) => {
    const path = location.pathname.substring(1);
    return path === itemName || path.startsWith(itemName + '/');
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="bg-blue-600 text-white p-4 md:hidden flex justify-between items-center">
        <h1 className="text-xl font-bold">ICSRT Dashboard</h1>
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white hover:text-gray-200"
        >
          ☰
        </button>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${menuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-300 ease-in-out
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-blue-600 text-white overflow-y-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-blue-700">
          <h1 className="text-2xl font-bold">ICSRT</h1>
          <p className="text-blue-200 text-sm">Dashboard</p>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-blue-700">
          <p className="text-sm font-medium">{user?.username || 'User'}</p>
          <p className="text-xs text-blue-200 capitalize">
            {user?.role === 'super_admin' ? 'Super Admin' : (user?.role_data?.name || 'Admin')}
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {filteredLinkItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={`/${item.name}`}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                    ${isActive(item.name) 
                      ? 'bg-blue-700 text-white' 
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }
                  `}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-blue-100 hover:bg-blue-700 hover:text-white rounded-lg transition-colors"
          >
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
