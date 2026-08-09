'use client';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaEye, FaClock, FaUser, FaUserCheck, FaUserTimes, FaCalendarAlt, FaEnvelope, FaPhone, FaBuilding, FaGlobe } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import Pagination from '../../components/Pagination';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const UserList = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState('gradient'); // 'gradient' | 'cards'
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'researcher_professional' | 'student_academic'
  const [serverStats, setServerStats] = useState({ total: 0, researchers: 0, students: 0 });
  const { hasPermission } = useAuth();

  // Check if user has view permission for users
  if (!hasPermission('users', 'view')) {
    return (
      <div className='pt-16'>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h2 className="font-bold text-lg">Access Denied</h2>
          <p>You don't have permission to view users.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, activeFilter]);

  useEffect(() => {
    fetchUserStats();
  }, []);

  useEffect(() => {
    // Filter users based on search term (client-side refinement)
    if (Array.isArray(users)) {
      const filtered = users.filter(user => {
        const userName = user.name || user.fullName || '';
        const userEmail = user.email || '';
        const userPhone = user.phone || '';
        const userInstitution = user.institution || user.affiliation || '';
        return (
          userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          userPhone.includes(searchTerm) ||
          userInstitution.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
        search: searchTerm || '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        userType: activeFilter || 'all',
      });
      const resp = await api.getJson(`/api/users?${params.toString()}`);
      if (resp && Array.isArray(resp.data)) {
        setUsers(resp.data);
        const p = resp.pagination || {};
        setTotal(parseInt(p.total || 0));
        // Reflect current filtered total in the active card (independent of stats endpoint)
        if (!searchTerm) {
          setServerStats((prev) => ({
            ...prev,
            ...(activeFilter === 'all' ? { total: parseInt(p.total || 0) } : {}),
            ...(activeFilter === 'researcher_professional' ? { researchers: parseInt(p.total || 0) } : {}),
            ...(activeFilter === 'student_academic' ? { students: parseInt(p.total || 0) } : {}),
          }));
        }
        // Ensure counters reflect DB totals even before stats endpoint resolves
        fetchUserCountsFallback();
      } else if (Array.isArray(resp)) {
        // Fallback shape, no pagination provided
        setUsers(resp);
        setTotal(resp.length);
        if (!searchTerm) {
          setServerStats((prev) => ({
            ...prev,
            ...(activeFilter === 'all' ? { total: resp.length } : {}),
            ...(activeFilter === 'researcher_professional' ? { researchers: resp.length } : {}),
            ...(activeFilter === 'student_academic' ? { students: resp.length } : {}),
          }));
        }
        fetchUserCountsFallback();
      } else if (resp && Array.isArray(resp.data)) {
        setUsers(resp.data);
        setTotal(resp.data.length);
        if (!searchTerm) {
          setServerStats((prev) => ({
            ...prev,
            ...(activeFilter === 'all' ? { total: resp.data.length } : {}),
            ...(activeFilter === 'researcher_professional' ? { researchers: resp.data.length } : {}),
            ...(activeFilter === 'student_academic' ? { students: resp.data.length } : {}),
          }));
        }
        fetchUserCountsFallback();
      } else {
        console.warn('Users API returned unexpected format:', resp);
        setUsers([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const resp = await api.getJson('/api/users/stats');
      if (resp && (typeof resp.total === 'number')) {
        setServerStats({
          total: resp.total || 0,
          researchers: resp.researchers || 0,
          students: resp.students || 0,
        });
        // If backend returns zeros but we have users, try fallback
        if ((resp.total === 0 || resp.total === undefined) && Array.isArray(users) && users.length > 0) {
          await fetchUserCountsFallback();
        }
      } else {
        await fetchUserCountsFallback();
      }
    } catch (e) {
      // Fallback to counting via list endpoint
      await fetchUserCountsFallback();
    }
  };

  const fetchUserCountsFallback = async () => {
    try {
      const mk = async (type) => {
        const params = new URLSearchParams({ page: '1', limit: '1', userType: type });
        const r = await api.getJson(`/api/users?${params.toString()}`);
        if (r && r.pagination && typeof r.pagination.total === 'number') return r.pagination.total;
        if (Array.isArray(r?.data)) return r.data.length; // unlikely due to limit=1
        return 0;
      };
      const [total, researchers, students] = await Promise.all([
        mk('all'),
        mk('researcher_professional'),
        mk('student_academic'),
      ]);
      setServerStats({ total, researchers, students });
    } catch {
      // leave defaults
    }
  };

  const handleStatClick = (type) => {
    // type: 'all' | 'researcher_professional' | 'student_academic'
    setActiveFilter(type);
    setPage(1);
  };

  const handleDelete = async (userId) => {
    const ok = await confirm({ title: 'Delete user?', message: 'This action cannot be undone.', confirmText: 'Delete' });
    if (!ok) return;

    try {
      await api.del(`/api/users/${userId}`);

      // Remove user from local state
      if (Array.isArray(users)) {
        setUsers(users.filter(user => user._id !== userId));
      }
  toast.success('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
  toast.error('Failed to delete user: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  const pendingCount = Array.isArray(users) ? users.filter(user => user.status === 'pending').length : 0;
  
  const userStats = {
    total: total || users.length,
    verified: users.filter(u => u.emailVerified || u.status === 'verified').length,
    pending: users.filter(u => u.status === 'pending').length,
    admin: users.filter(u => u.role === 'admin').length,
    regular: users.filter(u => u.role !== 'admin').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl font-semibold text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              👥 User Management
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Manage registered users and their permissions</p>
            {pendingCount > 0 && (
              <div className="mt-2 flex items-center gap-2 text-yellow-600">
                <FaClock />
                <span className="font-semibold">{pendingCount} user{pendingCount !== 1 ? 's' : ''} pending approval</span>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* View toggle: Cards (gradient style) or List */}
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
              onClick={() => { fetchUsers(); fetchUserStats(); }}
              className="group bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white px-6 py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span className="text-xl">🔄</span>
              Refresh
            </button>
            {hasPermission('users', 'create') && (
              <Link
                to="/users/add"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <FaPlus />
                Add User
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Clickable Filter Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Total */}
        <button
          type="button"
          onClick={() => handleStatClick('all')}
          className={`text-left bg-white/80 backdrop-blur-lg rounded-xl border ${activeFilter==='all' ? 'border-blue-300 ring-2 ring-blue-200' : 'border-white/20'} shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
              {serverStats.total}
            </div>
            <div className="text-sm font-semibold text-gray-600">Total</div>
            <div className="text-2xl mt-2">👥</div>
          </div>
        </button>

        {/* Researchers */}
        <button
          type="button"
          onClick={() => handleStatClick('researcher_professional')}
          className={`text-left bg-white/80 backdrop-blur-lg rounded-xl border ${activeFilter==='researcher_professional' ? 'border-purple-300 ring-2 ring-purple-200' : 'border-white/20'} shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
              {serverStats.researchers}
            </div>
            <div className="text-sm font-semibold text-gray-600">Researchers</div>
            <div className="text-2xl mt-2">🧪</div>
          </div>
        </button>

        {/* Students */}
        <button
          type="button"
          onClick={() => handleStatClick('student_academic')}
          className={`text-left bg-white/80 backdrop-blur-lg rounded-xl border ${activeFilter==='student_academic' ? 'border-emerald-300 ring-2 ring-emerald-200' : 'border-white/20'} shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-1">
              {serverStats.students}
            </div>
            <div className="text-sm font-semibold text-gray-600">Students</div>
            <div className="text-2xl mt-2">🎓</div>
          </div>
        </button>
      </div>

      {/* Modern Search */}
      <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 mb-8">
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">🔍</span>
          <input
            type="text"
            placeholder="Search users by name, email, phone, or institution..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-100 to-rose-100 border border-red-200 text-red-700 p-4 rounded-xl mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span className="font-semibold">{error}</span>
            </div>
            <button
              onClick={fetchUsers}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

  {/* Modern Users Display */}
      <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No users found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No users match the current search criteria' : 'No users have been registered yet'}
            </p>
          </div>
        ) : (
          <div className="p-6">
            {/* User Cards or List */}
            {viewMode === 'list' ? (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-gray-100 text-gray-800 rounded-md flex items-center justify-center text-sm font-bold">
                        {(user.fullName || user.name || user.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate max-w-[240px]">{user.fullName || user.name || 'No name'}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[280px]">{user.email}</div>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${user.role==='admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{user.role==='admin' ? 'Admin' : 'User'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${user.emailVerified || user.status==='verified' ? 'bg-green-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>{user.emailVerified || user.status==='verified' ? 'Verified' : 'Pending'}</span>
                      <span className="text-xs text-gray-500">{formatDate(user.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Link to={`/users/view/${user._id}`} className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md">View</Link>
                      {hasPermission('users','edit') && (
                        <Link to={`/users/edit/${user._id}`} className="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-md">Edit</Link>
                      )}
                      {hasPermission('users','delete') && (
                        <button onClick={()=>handleDelete(user._id)} className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md">Delete</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className={`${viewMode==='gradient' ?
                      'group bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 p-6 relative overflow-hidden' :
                      'bg-white rounded-xl border border-gray-200 shadow p-6'
                    }`}
                  >
                    {viewMode==='gradient' && (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                    
                    <div className="relative z-10">
                      {/* User Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 ${viewMode==='gradient' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-gray-100 text-gray-800'} rounded-xl flex items-center justify-center text-xl font-bold shadow-lg`}>
                            {(user.fullName || user.name)?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '👤'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors text-lg">
                              {user.fullName || user.name || 'No name provided'}
                            </div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${(() => {
                            const g = viewMode==='gradient';
                            if (user.role === 'admin') return g ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700' : 'bg-purple-100 text-purple-700';
                            return g ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700' : 'bg-blue-100 text-blue-700';
                          })()}`}>
                            {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            user.emailVerified || user.status === 'verified'
                              ? (viewMode==='gradient' ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700' : 'bg-green-100 text-emerald-700') 
                              : (viewMode==='gradient' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700' : 'bg-yellow-100 text-yellow-700')
                          }`}>
                            {user.emailVerified || user.status === 'verified' ? '✅ Verified' : '⏳ Pending'}
                          </span>
                        </div>
                      </div>

                      {/* User Details */}
                      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <div className="bg-gray-50/80 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <FaPhone className="text-blue-500" />
                            <span className="font-semibold text-gray-700">Phone</span>
                          </div>
                          <p className="text-gray-600">{user.phone || 'Not provided'}</p>
                        </div>

                        <div className="bg-gray-50/80 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <FaCalendarAlt className="text-green-500" />
                            <span className="font-semibold text-gray-700">Joined</span>
                          </div>
                          <p className="text-gray-600">{formatDate(user.createdAt)}</p>
                        </div>

                        <div className="bg-gray-50/80 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <FaBuilding className="text-purple-500" />
                            <span className="font-semibold text-gray-700">Institution</span>
                          </div>
                          <p className="text-gray-600">{user.institution || user.affiliation || 'Not specified'}</p>
                        </div>

                        <div className="bg-gray-50/80 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <FaGlobe className="text-indigo-500" />
                            <span className="font-semibold text-gray-700">Country</span>
                          </div>
                          <p className="text-gray-600">{user.country || 'Not specified'}</p>
                        </div>
                      </div>

                      {/* User Type and Research Area */}
                      {(user.userType || user.researchArea || user.fieldOfStudy) && (
                        <div className="mb-4 space-y-2">
                          {user.userType && (
                            <div className="bg-blue-50/80 rounded-lg p-2">
                              <span className="text-sm font-semibold text-blue-700">Type: </span>
                              <span className="text-sm text-blue-600">{user.userType}</span>
                            </div>
                          )}
                          {(user.researchArea || user.fieldOfStudy) && (
                            <div className="bg-green-50/80 rounded-lg p-2">
                              <span className="text-sm font-semibold text-green-700">Research: </span>
                              <span className="text-sm text-green-600">{user.researchArea || user.fieldOfStudy}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link
                          to={`/users/view/${user._id}`}
                          className={`flex-1 ${viewMode==='gradient' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${viewMode==='gradient' ? 'transform hover:scale-105' : ''} flex items-center justify-center gap-2`}
                        >
                          <FaEye />
                          View
                        </Link>

                        {hasPermission('users', 'edit') && (
                          <Link
                            to={`/users/edit/${user._id}`}
                            className={`flex-1 ${viewMode==='gradient' ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${viewMode==='gradient' ? 'transform hover:scale-105' : ''} flex items-center justify-center gap-2`}
                          >
                            <FaEdit />
                            Edit
                          </Link>
                        )}

                        {hasPermission('users', 'delete') && (
                          <button
                            onClick={() => handleDelete(user._id)}
                            className={`flex-1 ${viewMode==='gradient' ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700' : 'bg-red-600 hover:bg-red-700'} text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${viewMode==='gradient' ? 'transform hover:scale-105' : ''} flex items-center justify-center gap-2`}
                          >
                            <FaTrash />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            <div className="mt-6 bg-gray-50/80 rounded-xl p-4">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={total || filteredUsers.length}
                onPageChange={(p)=> setPage(p)}
                onPageSizeChange={(s)=> { setPageSize(s); setPage(1); }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
