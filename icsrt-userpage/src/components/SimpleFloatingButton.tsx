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

const SimpleFloatingButton = () => {
  const { t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    console.log('Button clicked!');
    setIsOpen(!isOpen);
  };

  const handlePhoneClick = () => {
    console.log('Phone clicked!');
    window.open('tel:+201018045506');
  };

  const handleWhatsAppClick = () => {
    console.log('WhatsApp clicked!');
    window.open('https://api.whatsapp.com/send?phone=201018045506');
  };

  const handleEmailClick = () => {
    console.log('Email clicked!');
    window.open('mailto:info@icsrt-me.com?subject=Academic Services Inquiry');
  };

  return (
    <div className={`fixed bottom-6 z-50 ${isRTL ? 'left-6' : 'right-6'}`}>
      {/* Contact Options */}
      {isOpen && (
        <div className="mb-4 space-y-3">
          {/* Phone */}
          <button
            onClick={handlePhoneClick}
            className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg cursor-pointer w-64"
          >
            <FaPhone className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-sm">Call Us</div>
              <div className="text-xs opacity-90">+20 101 804 5506</div>
            </div>
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsAppClick}
            className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg cursor-pointer w-64"
          >
            <FaWhatsapp className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-sm">WhatsApp</div>
              <div className="text-xs opacity-90">Chat with us</div>
            </div>
          </button>

          {/* Email */}
          <button
            onClick={handleEmailClick}
            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg cursor-pointer w-64"
          >
            <FaEnvelope className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-sm">Email Us</div>
              <div className="text-xs opacity-90">info@icsrt-me.com</div>
            </div>
          </button>

          {/* Contact Page */}
          <Link
            to="/contact"
            onClick={() => setIsOpen(false)}
            className="flex items-center bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-xl shadow-lg cursor-pointer w-64"
          >
            <FaTicketAlt className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-sm">Support Ticket</div>
              <div className="text-xs opacity-90">Get professional help</div>
            </div>
          </Link>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={handleClick}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer"
      >
        {isOpen ? <FaTimes className="w-6 h-6" /> : <FaComments className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default SimpleFloatingButton;
