'use client';
import React from 'react';

const RefreshButton = ({ onRefresh, loading = false, disabled = false, className = '' }) => {
  return (
    <button 
      onClick={onRefresh}
      disabled={loading || disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded font-medium ${
        loading || disabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-gray-600 text-white hover:bg-gray-700'
      } ${className}`}
    >
      <svg 
        className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
        />
      </svg>
      Refresh
    </button>
  );
};

export default RefreshButton;
