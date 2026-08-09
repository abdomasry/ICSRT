'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaEnvelope, FaUsers, FaSearch, FaFilter, FaDownload, FaTrash, FaPaperPlane } from 'react-icons/fa';
import { api } from '../../lib/api';
import Pagination from '../../components/Pagination';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const NewsletterSubscribers = () => {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, active: 0, unsubscribed: 0 });
  const [selectedSubscribers, setSelectedSubscribers] = useState<any[]>([]);
  const [showSendEmail, setShowSendEmail] = useState(false);
  const [viewMode, setViewMode] = useState('gradient'); // 'gradient' | 'cards' | 'list'
  const toast = useToast();
  const confirm = useConfirm();

  // Fetch subscribers
  const fetchSubscribers = async () => {
    try {
      setLoading(true);
  const data = await api.get(`/api/newsletter/subscribers?status=${statusFilter}&page=${page}&limit=${pageSize}&search=${searchTerm}`);
  setSubscribers(data.subscribers || []);
  setTotal(data.total || 0);

  // Fetch stats in parallel
  const [activeData, totalData, unsubData] = await Promise.all([
  api.get(`/api/newsletter/subscribers?status=active&limit=1`),
  api.get(`/api/newsletter/subscribers?status=all&limit=1`),
  api.get(`/api/newsletter/subscribers?status=unsubscribed&limit=1`)
  ]);

  setStats({
    active: activeData.total || 0,
    total: totalData.total || 0,
    unsubscribed: unsubData.total || 0
  });
  } catch (error) {
      console.error('Error fetching subscribers:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [statusFilter, page, pageSize, searchTerm]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  // Handle bulk unsubscribe
  const handleBulkUnsubscribe = async () => {
    if (selectedSubscribers.length === 0) return;
    
  const ok = await confirm({ title: 'Bulk unsubscribe?', message: `Unsubscribe ${selectedSubscribers.length} subscribers?`, confirmText: 'Unsubscribe' });
  if (!ok) return;
    
    try {
      for (const email of selectedSubscribers) {
        await api.post('/api/newsletter/unsubscribe', { email });
      }
      
      setSelectedSubscribers([]);
      fetchSubscribers();
      toast.success('Selected subscribers have been unsubscribed.');
    } catch (error) {
      console.error('Bulk unsubscribe error:', error);
      setError('Failed to unsubscribe selected users');
      toast.error('Failed to unsubscribe selected users');
    }
  };

  // Handle export
  const handleExport = () => {
    const csvContent = [
      ['Email', 'Name', 'Status', 'Subscribed Date', 'Preferences', 'Emails Sent'],
      ...subscribers.map(sub => [
        sub.email,
        sub.name || '',
        sub.status,
        new Date(sub.subscribedAt).toLocaleDateString(),
        sub.preferences.join(', '),
        sub.emailsSent || 0
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle checkbox selection
  const handleSelectSubscriber = (email) => {
    setSelectedSubscribers(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleSelectAll = () => {
    if (selectedSubscribers.length === subscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(subscribers.map(sub => sub.email));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              📧 Newsletter Subscribers
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Manage your newsletter subscription list and communications</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
              <button
                className={`px-3 py-2 text-sm font-semibold rounded-md ${viewMode==='gradient' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={()=> setViewMode('gradient')}
                aria-pressed={viewMode==='gradient'}
              >
                Cards
              </button>
              <button
                className={`ml-1 px-3 py-2 text-sm font-semibold rounded-md ${viewMode==='list' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={()=> setViewMode('list')}
                aria-pressed={viewMode==='list'}
              >
                List
              </button>
            </div>
            <button
              onClick={() => setShowSendEmail(true)}
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span className="text-xl">📨</span>
              Send Newsletter
            </button>
          </div>
        </div>
      </div>

      {/* Modern Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          className={`bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer ${statusFilter==='all' ? 'ring-2 ring-blue-300' : ''}`}
          onClick={() => { setStatusFilter('all'); setPage(1); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setStatusFilter('all'); setPage(1); } }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Total Subscribers</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stats.total}
                </p>
                <p className="text-xs text-gray-500 mt-1">All newsletter subscribers</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
        </div>

        <div
          className={`bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer ${statusFilter==='active' ? 'ring-2 ring-blue-300' : ''}`}
          onClick={() => { setStatusFilter('active'); setPage(1); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setStatusFilter('active'); setPage(1); } }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Active Subscribers</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  {stats.active}
                </p>
                <p className="text-xs text-gray-500 mt-1">Currently subscribed</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>

        <div
          className={`bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer ${statusFilter==='unsubscribed' ? 'ring-2 ring-blue-300' : ''}`}
          onClick={() => { setStatusFilter('unsubscribed'); setPage(1); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setStatusFilter('unsubscribed'); setPage(1); } }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-rose-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Unsubscribed</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  {stats.unsubscribed}
                </p>
                <p className="text-xs text-gray-500 mt-1">No longer subscribed</p>
              </div>
              <div className="text-4xl">❌</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Filters and Actions */}
      <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">🔍</span>
              <input
                type="text"
                placeholder="Search subscribers by email or name..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center gap-3 min-w-fit">
              <span className="text-xl">🔧</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm font-semibold"
              >
                <option value="active">Active</option>
                <option value="unsubscribed">Unsubscribed</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 w-full lg:w-auto">
            <button
              onClick={handleExport}
              className="flex-1 lg:flex-none bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="text-xl">📥</span>
              Export
            </button>
            
            {selectedSubscribers.length > 0 && (
              <button
                onClick={handleBulkUnsubscribe}
                className="flex-1 lg:flex-none bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="text-xl">🗑️</span>
                Unsubscribe ({selectedSubscribers.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-100 to-rose-100 border border-red-200 text-red-700 p-4 rounded-xl mb-6 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="font-semibold">{error}</span>
          </div>
        </div>
      )}

      {/* Modern Subscribers Cards */}
      <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-xl font-semibold text-gray-600">Loading subscribers...</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📧</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No subscribers found</h3>
            <p className="text-gray-600">Start building your newsletter audience</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Table Header */}
            <div className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl mb-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedSubscribers.length === subscribers.length && subscribers.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-gray-700">Select All</span>
              </div>
            </div>

            {/* Cards vs List */}
            {viewMode === 'list' ? (
              <div className="space-y-2">
                {subscribers.map((subscriber) => (
                  <div key={subscriber._id} className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.includes(subscriber.email)}
                        onChange={() => handleSelectSubscriber(subscriber.email)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="w-8 h-8 bg-gray-100 text-gray-800 rounded-md flex items-center justify-center text-sm font-bold">
                        {(subscriber.name?.charAt(0) || subscriber.email.charAt(0)).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate max-w-[260px]">{subscriber.name || 'No name'} • {subscriber.email}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[340px]">{new Date(subscriber.subscribedAt).toLocaleDateString()} • {(subscriber.preferences||[]).join(', ') || 'No preferences'}</div>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${subscriber.status==='active' ? 'bg-green-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{subscriber.status}</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">sent {subscriber.emailsSent || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {subscribers.map((subscriber) => (
                <div key={subscriber._id} className={`${viewMode==='gradient' ? 'group bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 p-6 relative overflow-hidden' : 'bg-white rounded-xl border border-gray-200 shadow p-6'}`}>
                  {viewMode==='gradient' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedSubscribers.includes(subscriber.email)}
                          onChange={() => handleSelectSubscriber(subscriber.email)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className={`w-12 h-12 ${viewMode==='gradient' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-gray-100 text-gray-800'} rounded-xl flex items-center justify-center text-xl font-bold shadow-lg`}>
                          {(subscriber.name?.charAt(0) || subscriber.email.charAt(0)).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {subscriber.name || 'No name'}
                          </div>
                          <div className="text-sm text-gray-600">{subscriber.email}</div>
                        </div>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        subscriber.status === 'active' 
                          ? (viewMode==='gradient' ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700' : 'bg-green-100 text-emerald-700') 
                          : (viewMode==='gradient' ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700' : 'bg-red-100 text-red-700')
                      }`}>
                        {subscriber.status === 'active' ? '✅ Active' : '❌ Unsubscribed'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50/80 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">🏷️</span>
                          <span className="font-semibold text-gray-700">Preferences</span>
                        </div>
                        <p className="text-gray-600">{subscriber.preferences?.join(', ') || 'None'}</p>
                      </div>

                      <div className="bg-gray-50/80 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">📅</span>
                          <span className="font-semibold text-gray-700">Subscribed</span>
                        </div>
                        <p className="text-gray-600">{new Date(subscriber.subscribedAt).toLocaleDateString()}</p>
                      </div>

                      <div className="bg-gray-50/80 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">📊</span>
                          <span className="font-semibold text-gray-700">Emails Sent</span>
                        </div>
                        <p className="text-gray-600">{subscriber.emailsSent || 0}</p>
                      </div>

                      <div className="bg-gray-50/80 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">📍</span>
                          <span className="font-semibold text-gray-700">Source</span>
                        </div>
                        <p className="text-gray-600">{subscriber.source || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}

            {/* Pagination */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={total}
                onPageChange={(p)=> setPage(p)}
                onPageSizeChange={(s)=> { setPageSize(s); setPage(1); }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Send Newsletter Modal */}
      {showSendEmail && (
        <SendNewsletterModal 
          onClose={() => setShowSendEmail(false)}
          onSuccess={() => {
            setShowSendEmail(false);
            fetchSubscribers();
          }}
        />
      )}
    </div>
  );
};

// Send Newsletter Modal Component
const SendNewsletterModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    type: 'general',
    targetPreference: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
  const result = await api.post('/api/newsletter/send', formData);
      const successCount = result?.successCount ?? result?.count ?? 0;
  toast.success(`Newsletter sent successfully to ${successCount} subscribers!`);
      onSuccess();
    } catch (error) {
      console.error('Send newsletter error:', error);
      setError('Network error occurred');
  toast.error('Failed to send newsletter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Send Newsletter</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter newsletter subject..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter newsletter content (HTML supported)..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="general">General</option>
                <option value="service">Service Update</option>
                <option value="article">Article</option>
                <option value="event">Event</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Preference
              </label>
              <select
                value={formData.targetPreference}
                onChange={(e) => setFormData(prev => ({ ...prev, targetPreference: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Subscribers</option>
                <option value="services">Services Only</option>
                <option value="articles">Articles Only</option>
                <option value="events">Events Only</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Sending...' : 'Send Newsletter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsletterSubscribers;
