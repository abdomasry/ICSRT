'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUser, FaCog, FaKey } from 'react-icons/fa';
import { useAuth } from './context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleChangePassword = () => {
    setShowDropdown(false);
    navigate('/change-password');
  };

  const getUserDisplayName = () => {
    return user?.username || 'Admin User';
  };

  const getRoleDisplayName = () => {
    if (user?.type === 'super_admin') return 'Super Administrator';
    if (user?.role_data?.name) return user.role_data.name;
    if (user?.role === 'superadmin') return 'Super Administrator';
    if (user?.role === 'admin') return 'Administrator';
    if (user?.role === 'content_manager') return 'Content Manager';
    if (user?.role === 'event_manager') return 'Event Manager';
    return 'Administrator';
  };

  const getRoleIcon = () => {
    return <FaUser className="text-blue-500" />;
  };

  return (
    <header className="hidden md:block bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-800">ICSRT Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* User Information */}
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-2">
              {getRoleIcon()}
              <div className="text-right">
                <p className="font-medium text-gray-900">{getUserDisplayName()}</p>
                <p className="text-gray-500">{getRoleDisplayName()}</p>
              </div>
            </div>
          </div>
          
          {/* Settings - available for all authenticated users */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
              >
                <FaCog />
                <span>Settings</span>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={handleChangePassword}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FaKey />
                      <span>Change Password</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
