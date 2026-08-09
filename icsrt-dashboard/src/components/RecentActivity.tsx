'use client';
import React, { useState, useEffect } from 'react';
import { FaSync, FaUsers, FaQuestionCircle, FaClipboardList, FaNewspaper, FaComments } from 'react-icons/fa';
import { api } from '../lib/api';

const RecentActivity = () => {
  const [recentData, setRecentData] = useState({
    users: [],
    tickets: [],
    serviceOrders: [],
    news: []
  });
  const [loading, setLoading] = useState(true);

  const extractArray = (res, key) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res[key])) return res[key];
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.items)) return res.items;
    return [];
  };

  const fetchRecentData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent data from each collection via api client
      const [users, tickets, serviceOrders, news] = await Promise.all([
        api.get('/api/users?limit=5&sortBy=createdAt&sortOrder=desc'),
        api.get('/api/tickets?limit=5&sortBy=createdAt&sortOrder=desc'),
        api.get('/api/service-orders?limit=5&sortBy=submittedAt&sortOrder=desc'),
        api.get('/api/news?limit=5&sortBy=createdAt&sortOrder=desc'),
      ]);

      setRecentData({
        users: extractArray(users, 'users'),
        tickets: extractArray(tickets, 'tickets'),
        serviceOrders: extractArray(serviceOrders, 'orders').length ? extractArray(serviceOrders, 'orders') : extractArray(serviceOrders, 'serviceOrders'),
        news: extractArray(news, 'articles').length ? extractArray(news, 'articles') : extractArray(news, 'news')
      });
    } catch (error) {
      console.error('Error fetching recent data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentData();
  }, []);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  interface ActivityItemProps {
    icon: any;
    title: string;
    subtitle: any;
    date: any;
    color: string;
    status: string;
  }

  const ActivityItem: React.FC<ActivityItemProps> = ({ icon, title, subtitle, date, color, status }) => (
    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm`} style={{ backgroundColor: color + '20', border: `2px solid ${color}40` }}>
        <span style={{ color }} className="text-sm">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-600 truncate">{subtitle}</p>
        {status && (
          <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
            status === 'pending' ? 'bg-orange-100 text-orange-800' :
            status === 'completed' ? 'bg-green-100 text-green-800' :
            status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {status}
          </span>
        )}
      </div>
      <span className="text-xs text-gray-400 font-medium">{formatDate(date)}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <FaSync className="animate-spin mr-3 text-blue-600" />
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4 p-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
        <button 
          onClick={fetchRecentData}
          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
          title="Refresh Activity"
        >
          <FaSync className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {/* Recent Users */}
        {(Array.isArray(recentData.users) ? recentData.users : []).slice(0, 2).map((user: any, index) => (
          <ActivityItem
            key={`user-${index}`}
            icon={<FaUsers />}
            title={`New User Registered`}
            subtitle={user.fullName || user.name || user.email}
            date={user.createdAt}
            color="#3B82F6"
            status={user.isVerified ? 'verified' : 'pending'}
          />
        ))}
        
        {/* Recent Support Tickets */}
        {(Array.isArray(recentData.tickets) ? recentData.tickets : []).slice(0, 2).map((ticket: any, index) => (
          <ActivityItem
            key={`ticket-${index}`}
            icon={<FaQuestionCircle />}
            title={`Support Ticket: ${ticket.subject}`}
            subtitle={`From ${ticket.userEmail || 'Customer'}`}
            date={ticket.createdAt}
            color="#10B981"
            status={ticket.status}
          />
        ))}
        
        {/* Recent Service Orders */}
        {(Array.isArray(recentData.serviceOrders) ? recentData.serviceOrders : []).slice(0, 2).map((order: any, index) => (
          <ActivityItem
            key={`order-${index}`}
            icon={<FaClipboardList />}
            title={`Service Order: ${order.serviceName || 'Academic Service'}`}
            subtitle={`${order.customerInfo?.name || order.userEmail || 'Customer'} • $${order.totalAmount || 0}`}
            date={order.submittedAt || order.createdAt}
            color="#8B5CF6"
            status={order.status}
          />
        ))}
        
        {/* Recent News */}
        {(Array.isArray(recentData.news) ? recentData.news : []).slice(0, 1).map((newsItem: any, index) => (
          <ActivityItem
            key={`news-${index}`}
            icon={<FaNewspaper />}
            title={`News Published: ${newsItem.title}`}
            subtitle={newsItem.description || 'Latest news update'}
            date={newsItem.createdAt}
            color="#F59E0B"
            status="published"
          />
        ))}
        
        {/* Show message if no recent activity */}
        {recentData.users.length === 0 && recentData.tickets.length === 0 && 
         recentData.serviceOrders.length === 0 && recentData.news.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FaComments className="mx-auto text-4xl text-gray-300 mb-4" />
            <p className="text-lg font-medium">No recent activity found</p>
            <p className="text-sm">User interactions and system activity will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
