
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaClock, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { api } from '../lib/api';

const Registrations = () => {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('registrations'); // 'registrations' or 'users'
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    // Fetch conference registrations
    api
      .get('/api/registrations')
      .then((responseData) => {
        // Handle the response structure properly
        if (Array.isArray(responseData)) {
          setData(responseData);
        } else if (responseData && Array.isArray(responseData.data)) {
          setData(responseData.data);
        } else {
          console.warn('Registrations API returned unexpected format:', responseData);
          setData([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setData([]);
      });

    // Fetch user registrations
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const userData = await api.get('/api/users');
      // Ensure userData is an array before setting
      if (Array.isArray(userData)) {
        setUsers(userData);
      } else if (userData && Array.isArray(userData.data)) {
        setUsers(userData.data);
      } else {
        console.warn('Users API returned unexpected format:', userData);
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    }
  };

  const handleUserApproval = async (userId, action) => {
    const confirmMessage = action === 'approve' 
      ? 'Are you sure you want to approve this user registration?' 
      : 'Are you sure you want to reject this user registration?';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const endpoint = action === 'approve' ? 'approve' : 'reject';
      const result = await api.put(`/api/admin/users/${userId}/${endpoint}`);
      console.log('User approval result:', result);

      // Update user in local state
      if (Array.isArray(users)) {
        setUsers(users.map(user => {
          if (user._id === userId) {
            return {
              ...user,
              status: action === 'approve' ? 'approved' : 'rejected',
              isActive: action === 'approve',
              approvedBy: 'admin',
              approvedAt: action === 'approve' ? new Date().toISOString() : null
            };
          }
          return user;
        }));
      }

      alert(`User ${action}d successfully!`);
    } catch (err) {
      console.error(`Error ${action}ing user:`, err);
      alert(`Failed to ${action} user: ` + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) return;
    try {
      const res = await api.del(`/api/registrations/${id}`);
      if (res && (res.ok || res.success !== false)) {
        setData(data.filter(item => item._id !== id));
        alert('Registration deleted.');
      } else {
        alert('Failed to delete.');
      }
    } catch (err) {
      console.error(err);
      alert('Error occurred while deleting.');
    }
  };

  const getStatusBadge = (user) => {
    const status = user.status || (user.isActive ? 'approved' : 'pending');
    
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <FaClock className="mr-1" /> Pending
          </span>
        );
      case 'approved':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            <FaCheck className="mr-1" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            <FaTimes className="mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return user.status === 'pending';
    if (statusFilter === 'approved') return user.status === 'approved' || user.isActive;
    if (statusFilter === 'rejected') return user.status === 'rejected';
    return true;
  }) : [];

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (err) {
      return 'Invalid Date';
    }
  };

  return (
    <div className='pt-16'>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Registrations & User Management</h1>
        <Link
          to="/registrations/add"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Registration
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('registrations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'registrations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Conference Registrations ({data.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            User Registrations ({users.length})
          </button>
        </nav>
      </div>

      {/* Conference Registrations Tab */}
      {activeTab === 'registrations' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded shadow hover:shadow-md cursor-pointer"
              onClick={() => setSelected(item)}
            >
              <h2 className="text-lg font-bold mb-1 text-blue-600">{item.fullName}</h2>
              <p className="text-sm text-gray-600">{item.email}</p>
              <p className="text-sm text-gray-600">{item.phone}</p>
              <p className="text-sm text-gray-500">{item.institution}</p>
              <p className="text-xs text-blue-500">{item.conference}</p>
              <p className="text-xs text-gray-500">{item.registrationType} • {item.researchArea}</p>
              <div className="mt-1">
                <span className={`px-2 py-1 rounded text-xs ${item.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {item.paymentStatus}
                </span>
              </div>
              <div className="mt-2 space-x-4 text-sm">
                <Link to={`/registrations/edit/${item._id}`} className="text-blue-600 hover:underline">
                  <FaEdit className="inline mr-1" /> Edit
                </Link>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }} className="text-red-600 hover:underline">
                  <FaTrash className="inline mr-1" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Registrations Tab */}
      {activeTab === 'users' && (
        <div>
          {/* Status Filter */}
          <div className="mb-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white"
            >
              <option value="all">All Users ({Array.isArray(users) ? users.length : 0})</option>
              <option value="pending">Pending ({Array.isArray(users) ? users.filter(u => u.status === 'pending').length : 0})</option>
              <option value="approved">Approved ({Array.isArray(users) ? users.filter(u => u.status === 'approved' || u.isActive).length : 0})</option>
              <option value="rejected">Rejected ({Array.isArray(users) ? users.filter(u => u.status === 'rejected').length : 0})</option>
            </select>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <div key={user._id} className="bg-white rounded-lg shadow-md p-4 border">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {user.name || 'Unnamed User'}
                  </h3>
                  {getStatusBadge(user)}
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <p><strong>Email:</strong> {user.email}</p>
                  {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
                  {user.registrationType && <p><strong>Type:</strong> {user.registrationType}</p>}
                  <p><strong>Registered:</strong> {formatDate(user.createdAt)}</p>
                  {user.approvedAt && <p><strong>Approved:</strong> {formatDate(user.approvedAt)}</p>}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {user.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUserApproval(user._id, 'approve')}
                        className="flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                      >
                        <FaCheck className="mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleUserApproval(user._id, 'reject')}
                        className="flex items-center px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                      >
                        <FaTimes className="mr-1" />
                        Reject
                      </button>
                    </>
                  )}
                  <Link
                    to={`/users/view/${user._id}`}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    <FaEye className="mr-1" />
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found for the selected filter.
            </div>
          )}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl"
              onClick={() => setSelected(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold text-blue-700 mb-2">{selected.fullName}</h2>
            <p><strong>Email:</strong> {selected.email}</p>
            <p><strong>Phone:</strong> {selected.phone}</p>
            <p><strong>Institution:</strong> {selected.institution}</p>
            <p><strong>Country:</strong> {selected.country}</p>
            <p><strong>Conference:</strong> {selected.conference}</p>
            <p><strong>Research Area:</strong> {selected.researchArea}</p>
            <p><strong>Registration Type:</strong> {selected.registrationType}</p>
            {selected.paperTitle && <p><strong>Paper Title:</strong> {selected.paperTitle}</p>}
            {selected.abstract && (
              <div>
                <strong>Abstract:</strong>
                <p className="text-sm mt-1 bg-gray-50 p-2 rounded">{selected.abstract}</p>
              </div>
            )}
            <p><strong>Payment Status:</strong> <span className={`px-2 py-1 rounded text-xs ${selected.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{selected.paymentStatus}</span></p>
            <p><strong>Registered At:</strong> {selected.registeredAt ? new Date(selected.registeredAt).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registrations;
