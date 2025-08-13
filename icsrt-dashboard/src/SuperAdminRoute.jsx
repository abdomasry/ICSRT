
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const SuperAdminRoute = () => {
  const isAuthenticated = !!localStorage.getItem("adminToken");
  const role = localStorage.getItem("adminRole");
  const customRole = localStorage.getItem("adminCustomRole");
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  // Only true superadmins (without custom roles) can access super admin routes
  if (role !== "superadmin" || customRole) {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

export default SuperAdminRoute;
