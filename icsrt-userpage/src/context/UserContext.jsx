import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('icsrtUser');
    const savedToken = localStorage.getItem('icsrtToken');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  // Auto-enrich stored user if important fields are missing (e.g., userType)
  useEffect(() => {
    const enrich = async () => {
      try {
        if (!user || !user._id) return;
        // Avoid repeated enrichment
        if (user.__enriched) return;
        // If userType is missing, fetch full user profile from API
        if (!user.userType) {
          const resp = await api.getSafe(`/api/users/${user._id}`);
          if (resp.ok && resp.data) {
            const merged = { ...user, ...resp.data, __enriched: true };
            setUser(merged);
            localStorage.setItem('icsrtUser', JSON.stringify(merged));
          } else {
            // Mark as checked to avoid loops even if API fails
            const flagged = { ...user, __enriched: true };
            setUser(flagged);
            localStorage.setItem('icsrtUser', JSON.stringify(flagged));
          }
        } else {
          // User has userType, just mark as enriched if not already
          if (!user.__enriched) {
            const flagged = { ...user, __enriched: true };
            setUser(flagged);
            localStorage.setItem('icsrtUser', JSON.stringify(flagged));
          }
        }
      } catch (e) {
        // Non-fatal: just skip enrichment
      }
    };
    enrich();
  // Only run when user._id changes, not on every user object change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('icsrtUser', JSON.stringify(userData));
    localStorage.setItem('icsrtToken', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('icsrtUser');
    localStorage.removeItem('icsrtToken');
  };

  const updateUser = (updatedUserData) => {
    // Merge to preserve stable fields (token stored separately), and flags like __enriched
    setUser(prev => {
      const merged = { ...(prev || {}), ...(updatedUserData || {}) };
      localStorage.setItem('icsrtUser', JSON.stringify(merged));
      return merged;
    });
  };

  // Optional: refetch user by id and update context
  const refreshUser = async () => {
    try {
      if (!user?._id) return;
      const resp = await api.getSafe(`/api/users/${user._id}`);
      if (resp.ok && resp.data) updateUser({ ...resp.data, __enriched: true });
    } catch {}
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
  updateUser,
  refreshUser,
    isLoggedIn: !!user
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
