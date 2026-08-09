import React, { useEffect, useState } from 'react';
import { FaUsers, FaClipboardList, FaCog, FaFileAlt, FaBook, FaCalendarAlt, FaNewspaper, FaQuestionCircle, FaComments, FaEye, FaClock, FaChartLine, FaPlus, FaEdit, FaTrash, FaDownload, FaSync } from 'react-icons/fa';
import RecentActivity from '../components/RecentActivity';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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

  interface StatCardProps {
    title: any;
    count: any;
    icon: any;
    color: any;
    description: any;
    trend?: any;
    isLarge?: boolean;
    onClick?: any;
  }

  const StatCard: React.FC<StatCardProps> = ({ title, count, icon, color, description, trend, isLarge = false, onClick }) => (
    <div
      className={`bg-white shadow-lg rounded-xl p-6 border-l-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
      style={{ borderLeftColor: color }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick();
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`${isLarge ? 'text-4xl' : 'text-3xl'} font-bold mb-1`} style={{ color }}>{count?.toLocaleString() || 0}</p>
          {description && <p className="text-xs text-gray-500">{description}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {trend > 0 ? '↗️' : '↘️'} {Math.abs(trend)}% this month
              </span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className={`${isLarge ? 'w-16 h-16' : 'w-12 h-12'} rounded-full flex items-center justify-center shadow-lg`} style={{ backgroundColor: color + '15', border: `2px solid ${color}30` }}>
            <span style={{ color }} className={`${isLarge ? 'text-2xl' : 'text-xl'}`}>{icon}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const ActionCard = ({ title, description, icon, color, onClick, disabled = false }) => {
    return (
      <button 
        onClick={onClick}
        disabled={disabled}
        className={`bg-white border-2 border-gray-200 rounded-xl p-6 text-left hover:border-blue-300 hover:shadow-lg transition-all duration-300 w-full transform hover:-translate-y-1 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
      >
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md`} style={{ backgroundColor: color + '15', border: `2px solid ${color}30` }}>
            <span style={{ color }} className="text-xl">{icon}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
          </div>
        </div>
      </button>
    );
  };

  if (loading && !stats) {
    return (
      <div className="pt-16 min-h-screen p-6 bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-xl text-gray-700 font-medium">Loading Dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">Fetching latest statistics and data</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="pt-16 min-h-screen p-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Dashboard Error</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
            <div className="space-x-3">
              <button 
                onClick={() => fetchStats()}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 font-medium shadow-lg"
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all duration-300 font-medium shadow-lg"
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
    <div className="pt-16 min-h-screen p-6 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">ICSRT Admin Dashboard</h1>
              <p className="text-gray-600 text-lg">Welcome back, Admin • Academic Services Platform</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FaSync className={refreshing ? 'animate-spin' : ''} />
                <span className="font-medium">{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error indicator */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <div className="text-red-500 mr-3 text-xl">⚠️</div>
              <div>
                <p className="text-red-800 font-medium">System Warning</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Stats Grid - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Users" 
            count={stats?.totalUsers} 
            icon={<FaUsers />} 
            color="#3B82F6" 
            description="Registered platform users"
            isLarge={true}
            trend={Number.isFinite(stats?.usersChangePercent) ? Math.round(stats.usersChangePercent) : 0}
          />
          <StatCard 
            title="Support Tickets" 
            count={stats?.totalTickets} 
            icon={<FaQuestionCircle />} 
            color="#10B981" 
            description="Customer support requests"
            isLarge={true}
            trend={Number.isFinite(stats?.ticketsChangePercent) ? Math.round(stats.ticketsChangePercent) : 0}
          />
          <StatCard 
            title="Service Orders" 
            count={stats?.totalServiceOrders} 
            icon={<FaClipboardList />} 
            color="#8B5CF6" 
            description="Academic service requests"
            isLarge={true}
            trend={Number.isFinite(stats?.serviceOrdersChangePercent) ? Math.round(stats.serviceOrdersChangePercent) : 0}
          />
          <StatCard 
            title={`Monthly Revenue (${stats?.monthlyRevenueCurrency || 'EGP'})`} 
            count={`${Number(stats?.monthlyRevenue || 0).toLocaleString()} ${stats?.monthlyRevenueCurrency || 'EGP'}`} 
            icon={<FaChartLine />} 
            color="#F59E0B" 
            description="Current month earnings"
            isLarge={true}
            trend={Number.isFinite(stats?.monthlyRevenueChangePercent) ? Math.round(stats.monthlyRevenueChangePercent) : 0}
          />
        </div>

        {/* Active Work Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaCog className="mr-2 text-blue-600" />
            Active Work & Communication
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard 
              title="Active Projects" 
              count={stats?.activeProjects} 
              icon={<FaCog />} 
              color="#EF4444" 
              description="In progress"
            />
            <StatCard 
              title="Pending Reviews" 
              count={stats?.pendingReviews} 
              icon={<FaEye />} 
              color="#06B6D4" 
              description="Awaiting review"
            />
            <StatCard 
              title="New Messages" 
              count={stats?.newMessages} 
              icon={<FaComments />} 
              color="#84CC16" 
              description="Last 24 hours"
            />
            <StatCard 
              title="News Articles" 
              count={stats?.totalNews} 
              icon={<FaNewspaper />} 
              color="#F97316" 
              description="Published content"
            />
            <StatCard 
              title="Available Services" 
              count={stats?.totalServices} 
              icon={<FaCog />} 
              color="#EC4899" 
              description="Active services"
            />
          </div>
        </div>

          {/* Research Collaborations */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaFileAlt className="mr-2 text-purple-600" />
              Research Collaborations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard
                title="Total"
                count={stats?.totalCollaborations}
                icon={<FaFileAlt />}
                color="#6B7280"
                description="All submissions"
                onClick={() => (window.location.href = '/collaborations?status=all')}
              />
              <StatCard
                title="Submitted"
                count={stats?.collaborationsSubmitted}
                icon={<FaFileAlt />}
                color="#3B82F6"
                description="Awaiting review"
                onClick={() => (window.location.href = '/collaborations?status=submitted')}
              />
              <StatCard
                title="In Review"
                count={stats?.collaborationsReview}
                icon={<FaEye />}
                color="#06B6D4"
                description="Under evaluation"
                onClick={() => (window.location.href = '/collaborations?status=review')}
              />
              <StatCard
                title="Approved"
                count={stats?.collaborationsApproved}
                icon={<FaClipboardList />}
                color="#10B981"
                description="Accepted"
                onClick={() => (window.location.href = '/collaborations?status=approved')}
              />
              <StatCard
                title="Rejected"
                count={stats?.collaborationsRejected}
                icon={<FaClipboardList />}
                color="#EF4444"
                description="Declined"
                onClick={() => (window.location.href = '/collaborations?status=rejected')}
              />
            </div>
          </div>

        {/* Platform Content Stats (Gallery removed) */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaBook className="mr-2 text-purple-600" />
            Platform Content
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard 
              title="FAQ Items" 
              count={stats?.totalFAQ} 
              icon={<FaQuestionCircle />} 
              color="#6366F1" 
              description="Help resources"
            />
            <StatCard 
              title="Testimonials" 
              count={stats?.totalTestimonials} 
              icon={<FaComments />} 
              color="#14B8A6" 
              description="User feedback"
            />
            <StatCard 
              title="Contact Records" 
              count={stats?.totalContacts} 
              icon={<FaUsers />} 
              color="#8B5CF6" 
              description="Contact database"
            />
          </div>
        </div>

        {/* Pending Items - Important Admin Actions */}
        {(stats?.pendingTickets > 0 || stats?.pendingOrders > 0) && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl shadow-lg p-6 mb-8 border border-orange-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaClock className="mr-2 text-orange-600" />
              Urgent Actions Required
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats?.pendingTickets > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-md border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 mb-1">Pending Support Tickets</p>
                      <p className="text-3xl font-bold text-orange-700">{stats.pendingTickets}</p>
                      <p className="text-xs text-orange-600 mt-1">Require immediate attention</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <FaQuestionCircle className="text-orange-600 text-xl" />
                    </div>
                  </div>
                  <button className="mt-4 w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                    Review Tickets
                  </button>
                </div>
              )}
              {stats?.pendingOrders > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-md border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 mb-1">Pending Service Orders</p>
                      <p className="text-3xl font-bold text-orange-700">{stats.pendingOrders}</p>
                      <p className="text-xs text-orange-600 mt-1">Awaiting price quotes</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <FaClipboardList className="text-orange-600 text-xl" />
                    </div>
                  </div>
                  <button className="mt-4 w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                    Process Orders
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity - Enhanced with Live Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaChartLine className="mr-2 text-blue-600" />
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-sm font-medium text-green-800">Database Connection</span>
                <span className="text-green-600 text-xl">●</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-sm font-medium text-green-800">API Server</span>
                <span className="text-green-600 text-xl">●</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-blue-800">Active Collections</span>
                <span className="text-blue-600 font-bold">13</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 mb-3 font-medium">Recent Activity (Last 30 Days)</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">New Users</span>
                    <span className="font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">{stats?.recentUsers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">New Tickets</span>
                    <span className="font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">{stats?.recentTickets || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Service Orders</span>
                    <span className="font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">{stats?.recentServiceOrders || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <FaPlus className="mr-3 text-green-600" />
            Quick Management Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard
              title="Manage Users"
              description="View, edit, and manage registered users and their permissions"
              icon={<FaUsers />}
              color="#3B82F6"
              onClick={() => window.location.href = '/users'}
            />
            <ActionCard
              title="Support Tickets"
              description="Review and respond to customer support requests"
              icon={<FaQuestionCircle />}
              color="#10B981"
              onClick={() => window.location.href = '/tickets'}
            />
            <ActionCard
              title="Service Orders"
              description="Process academic service orders and manage pricing"
              icon={<FaClipboardList />}
              color="#8B5CF6"
              onClick={() => window.location.href = '/service-orders'}
            />
            <ActionCard
              title="Add News Article"
              description="Publish important news and updates for users"
              icon={<FaNewspaper />}
              color="#F59E0B"
              onClick={() => window.location.href = '/news/add'}
            />
            <ActionCard
              title="Manage Services"
              description="Add, edit, or remove available academic services"
              icon={<FaCog />}
              color="#EF4444"
              onClick={() => window.location.href = '/services'}
            />
            <ActionCard
              title="Analytics & Reports"
              description="View detailed analytics and generate system reports"
              icon={<FaChartLine />}
              color="#6366F1"
              onClick={() => window.location.href = '/analytics'}
            />
            <ActionCard
              title="Message Center"
              description="View and respond to user messages and communications"
              icon={<FaComments />}
              color="#14B8A6"
              onClick={() => window.location.href = '/messages'}
            />
            <ActionCard
              title="Content Management"
              description="Manage FAQ, testimonials, and other site content"
              icon={<FaBook />}
              color="#EC4899"
              onClick={() => window.location.href = '/content'}
            />
            <ActionCard
              title="Export Data"
              description="Download system reports, user data, and analytics"
              icon={<FaDownload />}
              color="#F97316"
              onClick={() => toast.info('Export coming soon: choose data type to export')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
