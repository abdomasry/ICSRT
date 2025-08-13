import React, { useEffect, useState } from 'react';
import { FaUsers, FaClipboardList, FaCog, FaFileAlt, FaBook, FaCalendarAlt, FaNewspaper, FaQuestionCircle, FaComments, FaEye, FaClock, FaChartLine, FaPlus, FaEdit, FaTrash, FaDownload, FaRefreshCw } from 'react-icons/fa';
import { usePermissions } from '../context/PermissionContext';
import { api } from '../lib/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { hasPermission, getDisplayRole, getPermissionSummary, user } = usePermissions();

  const fetchStats = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
  const data = await api.get('/api/dashboard-stats');
  setStats(data || {});
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    fetchStats(true);
  };

  const StatCard = ({ title, count, icon, color, description, trend }) => (
    <div className={`bg-white shadow-lg rounded-lg p-6 border-l-4 hover:shadow-xl transition-shadow duration-300`} style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold" style={{ color }}>{count?.toLocaleString() || 0}</p>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '↗️' : '↘️'} {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
            <span style={{ color }} className="text-xl">{icon}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const ActionCard = ({ title, description, icon, color, onClick, permission }) => {
    if (permission && !hasPermission(permission)) return null;
    
    return (
      <button 
        onClick={onClick}
        className="bg-white border-2 border-gray-200 rounded-lg p-4 text-left hover:border-blue-300 hover:shadow-md transition-all duration-200 w-full"
      >
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center`} style={{ backgroundColor: color + '20' }}>
            <span style={{ color }} className="text-lg">{icon}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </button>
    );
  };

  if (loading && !stats) {
    return (
      <div className="pt-16 min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="pt-16 min-h-screen p-6 bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Dashboard Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-x-2">
              <button 
                onClick={() => fetchStats()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">ICSRT Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.username || 'Admin'} ({getDisplayRole()})</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <FaRefreshCw className={refreshing ? 'animate-spin' : ''} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error indicator */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-500 mr-3">⚠️</div>
              <div>
                <p className="text-red-800 font-medium">Warning</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Users" 
            count={stats?.totalUsers} 
            icon={<FaUsers />} 
            color="#3B82F6" 
            description="Registered users"
          />
          <StatCard 
            title="Registrations" 
            count={stats?.totalRegistrations} 
            icon={<FaClipboardList />} 
            color="#10B981" 
            description="Conference registrations"
          />
          <StatCard 
            title="Papers" 
            count={stats?.totalPapers} 
            icon={<FaFileAlt />} 
            color="#8B5CF6" 
            description="Research papers"
          />
          <StatCard 
            title="Events" 
            count={stats?.totalEvents} 
            icon={<FaCalendarAlt />} 
            color="#F59E0B" 
            description="Scheduled events"
          />
        </div>

        {/* Content Stats (Conferences/Journals removed) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Speakers" 
            count={stats?.totalSpeakers} 
            icon={<FaUsers />} 
            color="#06B6D4" 
          />
          <StatCard 
            title="News Articles" 
            count={stats?.totalNews} 
            icon={<FaNewspaper />} 
            color="#F97316" 
          />
          <StatCard 
            title="Services" 
            count={stats?.totalServices} 
            icon={<FaCog />} 
            color="#EC4899" 
          />
          <StatCard 
            title="Papers" 
            count={stats?.totalPapers} 
            icon={<FaFileAlt />} 
            color="#8B5CF6" 
          />
        </div>

        {/* Additional Content Stats (Gallery removed) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="FAQ Items" 
            count={stats?.totalFAQ} 
            icon={<FaQuestionCircle />} 
            color="#6366F1" 
          />
          <StatCard 
            title="Testimonials" 
            count={stats?.totalTestimonials} 
            icon={<FaComments />} 
            color="#14B8A6" 
          />
          <StatCard 
            title="Contacts" 
            count={stats?.totalContacts} 
            icon={<FaUsers />} 
            color="#8B5CF6" 
          />
        </div>

        {/* Pending Items - Important Admin Actions */}
        {(stats?.pendingUsers > 0 || stats?.pendingRegistrations > 0) && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-orange-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaClock className="mr-2 text-orange-600" />
              Pending Actions Required
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats?.pendingUsers > 0 && (
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Pending Users</p>
                      <p className="text-2xl font-bold text-orange-700">{stats.pendingUsers}</p>
                    </div>
                    <FaUsers className="text-orange-600 text-xl" />
                  </div>
                </div>
              )}
              {stats?.pendingRegistrations > 0 && (
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Pending Registrations</p>
                      <p className="text-2xl font-bold text-orange-700">{stats.pendingRegistrations}</p>
                    </div>
                    <FaClipboardList className="text-orange-600 text-xl" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaChartLine className="mr-2 text-blue-600" />
            Recent Activity (Last 30 Days)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">New Users</p>
                  <p className="text-2xl font-bold text-blue-700">{stats?.recentUsers || 0}</p>
                </div>
                <FaUsers className="text-blue-600 text-xl" />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">New Registrations</p>
                  <p className="text-2xl font-bold text-green-700">{stats?.recentRegistrations || 0}</p>
                </div>
                <FaClipboardList className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActionCard
              title="Manage Users"
              description="View and manage registered users"
              icon={<FaUsers />}
              color="#3B82F6"
              permission="users.view"
              onClick={() => window.location.href = '/users'}
            />
            <ActionCard
              title="Add Paper"
              description="Submit a new research paper"
              icon={<FaPlus />}
              color="#10B981"
              permission="papers.edit"
              onClick={() => window.location.href = '/papers/add'}
            />
            <ActionCard
              title="Create Event"
              description="Schedule a new conference event"
              icon={<FaCalendarAlt />}
              color="#8B5CF6"
              permission="events.edit"
              onClick={() => window.location.href = '/events/add'}
            />
            <ActionCard
              title="Add News"
              description="Publish a news article"
              icon={<FaNewspaper />}
              color="#F59E0B"
              permission="news.edit"
              onClick={() => window.location.href = '/news/add'}
            />
            {/* Conferences feature removed */}
            <ActionCard
              title="Export Data"
              description="Download system reports"
              icon={<FaDownload />}
              color="#6366F1"
              permission="dashboard.view"
              onClick={() => alert('Export functionality coming soon!')}
            />
          </div>
        </div>

        {/* System Info (for debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 rounded-lg p-4 mb-8">
            <h3 className="text-sm font-bold text-gray-700 mb-2">Debug Info</h3>
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify(getPermissionSummary(), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
