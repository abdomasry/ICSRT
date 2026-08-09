import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Simple test component
const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">ICSRT User Portal</h1>
        <p className="text-lg text-gray-600 mb-8">Testing page - User portal is working!</p>
        <div className="space-x-4">
          <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
            Login
          </button>
          <button className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="*" element={<TestPage />} />
      </Routes>
    </div>
  );
}

export default App;
