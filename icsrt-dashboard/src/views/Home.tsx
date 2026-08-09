'use client';
import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

const Home = () => {
  const [stats, setStats] = useState({ visitors: 0, registrations: 0, services: 0 });

  useEffect(() => {
    let mounted = true;
    api
      .get("/api/dashboard-stats")
      .then((data) => {
        if (mounted && data) setStats(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-2">Welcome to ICSRT Admin Portal</h1>
        <p className="text-lg text-gray-600 mb-6">Empowering Education & Research Management</p>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-100 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-700">{stats.visitors}</div>
            <div className="text-gray-500">Visitors</div>
          </div>
          <div className="bg-green-100 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-700">{stats.registrations}</div>
            <div className="text-gray-500">Registrations</div>
          </div>
          {/* Conferences removed */}
          <div className="bg-pink-100 rounded-lg p-4">
            <div className="text-2xl font-bold text-pink-700">{stats.services}</div>
            <div className="text-gray-500">Services</div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-gray-700">Manage your services, speakers, papers, and more with a modern, education-inspired interface.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
