import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser } from '../types';

export interface AuthContextType {
  user: any;
  login: (userData: any) => void;
  logout: () => void;
  loading: boolean;
  hasPermission: (section: string, action?: string) => boolean;
  isLoggedIn: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export interface AuthProviderProps {
  children?: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
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

  const login = (userData: any) => {
    setUser(userData);
    localStorage.setItem('icsrt_admin', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('icsrt_admin');
  };

  const hasPermission = (section: string, action = 'view'): boolean => {
    const isDev = process.env.NODE_ENV !== 'production';
    if (!user) {
      if (isDev) console.log('No user found for permission check');
      return false;
    }
    
    const sectionAliases: Record<string, string> = {
      'contact-requests': 'contacts',
      'articles': 'papers',
    };
    const normalizedSection = sectionAliases[section] || section;
    
    if (user.type === 'super_admin' || user.role === 'super_admin') {
      return true;
    }
    
    if (user.role_data && user.role_data.permissions) {
      const permissions = user.role_data.permissions;
      let parsedPermissions = permissions;
      if (typeof permissions === 'string') {
        try {
          parsedPermissions = JSON.parse(permissions);
        } catch (e) {
          return false;
        }
      }
      
      if (parsedPermissions[normalizedSection]) {
        return parsedPermissions[normalizedSection].includes(action);
      }
      return false;
    }
    
    const adminPermissions = [
      'dashboard',
      'users', 
      'services',
      'papers',
      'events',
      'testimonials',
      'faq',
      'contacts',
      'tickets',
      'social-media',
      'collaborations',
    ];
    
    const restrictedForAdmin = [
      'admins',
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

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    hasPermission,
    isLoggedIn: !!user,
    isSuperAdmin: user?.type === 'super_admin' || user?.role === 'super_admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
