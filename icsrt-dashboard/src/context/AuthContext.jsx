import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('icsrt_admin');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('icsrt_admin');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('icsrt_admin', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('icsrt_admin');
  };

  const hasPermission = (section, action = 'view') => {
    const isDev = process.env.NODE_ENV !== 'production';
    if (!user) {
      if (isDev) console.log('No user found for permission check');
      return false;
    }
    
    // Normalize known aliases to match permission keys stored in role_data
    const sectionAliases = {
      'contact-requests': 'contacts',
      'articles': 'papers',
    };
    const normalizedSection = sectionAliases[section] || section;
    
    if (isDev) {
      console.log(`Checking permission for section: ${normalizedSection} (raw: ${section}), action: ${action}`);
      console.log('Current user:', user);
    }
    
    // Super admin has access to everything
    if (user.type === 'super_admin' || user.role === 'super_admin') {
      if (isDev) console.log('User is super admin, granting access');
      return true;
    }
    
    // Check if user has role_data with permissions
    if (user.role_data && user.role_data.permissions) {
      if (isDev) console.log('Found role_data with permissions:', user.role_data.permissions);
      const permissions = user.role_data.permissions;
      
      // If permissions is a string, parse it
      let parsedPermissions = permissions;
      if (typeof permissions === 'string') {
        try {
          parsedPermissions = JSON.parse(permissions);
          if (isDev) console.log('Parsed permissions from string:', parsedPermissions);
        } catch (e) {
          console.error('Error parsing permissions:', e);
          return false;
        }
      }
      
      // Check if the section exists in permissions and has the required action
      if (parsedPermissions[normalizedSection]) {
        const hasAction = parsedPermissions[normalizedSection].includes(action);
        if (isDev) {
          console.log(`Section ${normalizedSection} has actions:`, parsedPermissions[normalizedSection]);
          console.log(`Required action ${action} found:`, hasAction);
        }
        return hasAction;
      }
      
      if (isDev) console.log(`Section ${normalizedSection} not found in permissions`);
      return false;
    }
    
    if (isDev) console.log('No role_data found, falling back to old system');
    // Fallback to old system if no role_data
    const adminPermissions = [
      'dashboard',
      'users', 
      'services',
      'papers', // articles
      'events',
      'testimonials',
      'faq',
      'contacts',
      'tickets', // allow access to support tickets for content admins by default
      'social-media', // allow social media management
    ];
    
    // Regular admin cannot access these sections
    const restrictedForAdmin = [
      'admins', // Only super admin can manage admins
      'registrations',
      'service-orders',
      'newsletter-subscribers',
      'about',
      'mission', 
      'vision'
    ];
    
  if (restrictedForAdmin.includes(normalizedSection)) {
      return false;
    }
    
  return adminPermissions.includes(normalizedSection);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    hasPermission,
    isLoggedIn: !!user,
    isSuperAdmin: user?.type === 'super_admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
