'use client';

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import ProfileDropdown from './ProfileDropdown';
import LanguageSwitcher from './LanguageSwitcher';
import DarkModeToggle from './DarkModeToggle';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { isLoggedIn, user } = useUser();
  const { t, isRTL } = useLanguage();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const baseNavigation = [
    { name: t('nav.home'), href: '/', key: 'home' },
    { name: t('nav.services'), href: '/services', key: 'services' },
    { name: t('nav.articles'), href: '/articles', key: 'articles' },
    { name: t('nav.about'), href: '/about', key: 'about' },
    { name: t('nav.faq'), href: '/faq', key: 'faq' },
    { name: t('nav.contact'), href: '/contact', key: 'contact' },
  ];

  // Treat any userType containing 'research' as researcher (defensive for legacy values)
  const isResearcher = isLoggedIn && (String(user?.userType || '').toLowerCase().includes('research'));
  const navigation = isResearcher
    ? [...baseNavigation.slice(0, 3), { name: t('nav.work'), href: '/work-with-us', key: 'work' }, ...baseNavigation.slice(3)]
    : baseNavigation;

  const isActiveRoute = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="brand-nav sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="brand-logo transition-colors duration-300"
            >
              ICSRT
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className={`hidden lg:flex items-center ${isRTL ? 'space-x-reverse space-x-8' : 'space-x-8'}`}>
            {navigation.map((item) => (
              <Link
                key={item.key}
                to={item.href}
                className={`brand-nav-link relative transition-all duration-300 ${
                  isActiveRoute(item.href)
                    ? 'text-amber-300'
                    : ''
                }`}
              >
                {item.name}
                {isActiveRoute(item.href) && (
                  <span className="absolute -bottom-1 left-0 w-full h-px bg-amber-300"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Right side - Controls and Auth */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            
            {/* Dark Mode Toggle */}
            <div className="hidden sm:block">
              <DarkModeToggle />
            </div>

            {/* Authentication */}
            {isLoggedIn ? (
              <ProfileDropdown />
            ) : (
              <div className={`hidden md:flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                <Link 
                  to="/login" 
                  className="brand-nav-link transition-colors duration-300"
                >
                  {t('nav.login')}
                </Link>
                <Link 
                  to="/signup" 
                  className="brand-nav-cta px-6 py-2 transition-all duration-300"
                >
                  {t('nav.signup')}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-3 text-stone-100 hover:text-amber-300 hover:bg-white/10 transition-colors duration-300"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <FaTimes className="h-6 w-6" />
                ) : (
                  <FaBars className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/20">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-[#111]">
              {navigation.map((item) => (
                <Link
                  key={item.key}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`brand-nav-link block px-3 py-3 text-base transition-colors duration-300 ${
                    isActiveRoute(item.href)
                    ? 'text-amber-300 bg-white/10'
                    : 'hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Controls */}
              <div className="pt-4 border-t border-white/20">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm font-medium text-stone-200">
                    {t('common.settings')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <LanguageSwitcher />
                    <DarkModeToggle />
                  </div>
                </div>
              </div>

              {/* Mobile Authentication */}
              {!isLoggedIn && (
                <div className="pt-4 border-t border-white/20 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="brand-nav-link block w-full text-center px-3 py-3 transition-colors duration-300"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="brand-nav-cta block w-full text-center px-3 py-3 transition-all duration-300"
                  >
                    {t('nav.signup')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
