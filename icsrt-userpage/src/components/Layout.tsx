'use client';
import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingContactButton from './FloatingContactButton';

interface LayoutProps {
  children?: ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  const { isRTL } = useLanguage();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 ${isRTL ? 'rtl' : 'ltr'} ${className}`}>
      <Navbar />
      <main className="min-h-screen">
        {children || <Outlet />}
      </main>
      <Footer />
      <FloatingContactButton />
    </div>
  );
};

export default Layout;
