'use client';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  FaComments, 
  FaTimes, 
  FaPhone, 
  FaEnvelope, 
  FaTicketAlt,
  FaWhatsapp,
  FaTelegram
} from 'react-icons/fa';

const FloatingContactButton = () => {
  const { t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`fixed bottom-6 z-[9999] ${isRTL ? 'left-6' : 'right-6'}`}>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Contact Options */}
      {isOpen && (
        <div className={`absolute bottom-16 ${isRTL ? 'left-0' : 'right-0'} mb-4 space-y-3 w-64 z-[9999]`}>
          {/* Phone */}
          <button
            onClick={() => {
              window.open('tel:+201018045506');
              setIsOpen(false);
            }}
            className="flex items-center w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg transform hover:scale-105 cursor-pointer transition-all duration-200"
          >
            <FaPhone className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-sm">{t('contact.info.phone.title')}</div>
              <div className="text-xs opacity-90">+20 101 804 5506</div>
            </div>
          </button>

          {/* WhatsApp */}
          <button
            onClick={() => {
              window.open('https://api.whatsapp.com/send?phone=201018045506');
              setIsOpen(false);
            }}
            className="flex items-center w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg transform hover:scale-105 cursor-pointer transition-all duration-200"
          >
            <FaWhatsapp className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-sm">WhatsApp</div>
              <div className="text-xs opacity-90">{t('contact.whatsapp')}</div>
            </div>
          </button>

          {/* Email */}
          <button
            onClick={() => {
              window.open('mailto:info@icsrt-me.com?subject=Academic Services Inquiry');
              setIsOpen(false);
            }}
            className="flex items-center w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg transform hover:scale-105 cursor-pointer transition-all duration-200"
          >
            <FaEnvelope className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-sm">{t('contact.info.email.title')}</div>
              <div className="text-xs opacity-90">info@icsrt-me.com</div>
            </div>
          </button>

          {/* Telegram */}
          <button
            onClick={() => {
              window.open('https://t.me/icsrt_support');
              setIsOpen(false);
            }}
            className="flex items-center w-full bg-blue-400 hover:bg-blue-500 text-white px-4 py-3 rounded-xl shadow-lg transform hover:scale-105 cursor-pointer transition-all duration-200"
          >
            <FaTelegram className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-sm">Telegram</div>
              <div className="text-xs opacity-90">{t('contact.telegram')}</div>
            </div>
          </button>

          {/* Support Ticket */}
          <Link
            to="/contact"
            onClick={() => setIsOpen(false)}
            className="flex items-center w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-xl shadow-lg transform hover:scale-105 cursor-pointer transition-all duration-200"
          >
            <FaTicketAlt className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-sm">{t('contact.submitTicket')}</div>
              <div className="text-xs opacity-90">{t('contact.getHelp')}</div>
            </div>
          </Link>
        </div>
      )}

      {/* Main Contact Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 flex items-center justify-center cursor-pointer z-[9999] relative"
        style={{ 
          transform: isOpen ? 'rotate(180deg) scale(1.1)' : 'scale(1)',
          zIndex: 9999
        }}
      >
        {isOpen ? (
          <FaTimes className="w-6 h-6" />
        ) : (
          <FaComments className="w-6 h-6" />
        )}
      </button>

      {/* Pulse Animation Ring */}
      {!isOpen && (
        <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20 pointer-events-none"></div>
      )}
    </div>
  );
};

export default FloatingContactButton;
