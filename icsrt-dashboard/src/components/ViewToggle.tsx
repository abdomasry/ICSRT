import React from 'react';

export default function ViewToggle({ value, onChange }) {
  const btn = (mode, label) => (
    <button
      key={mode}
      className={`px-3 py-2 text-sm font-semibold rounded-md ${value===mode ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-800'}`}
      onClick={() => onChange(mode)}
      aria-pressed={value===mode}
    >
      {label}
    </button>
  );

  return (
    <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
      {btn('gradient', 'Gradient')}
      <div className="w-[4px]" />
      {btn('cards', 'Cards')}
      <div className="w-[4px]" />
      {btn('list', 'List')}
    </div>
  );
}
