'use client';

import React from 'react';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import { UserProvider } from '../context/UserContext';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingContactButton from './FloatingContactButton';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <UserProvider>
          <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <FloatingContactButton />
          </div>
        </UserProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
