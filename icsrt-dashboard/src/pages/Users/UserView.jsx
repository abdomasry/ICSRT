import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const UserView = () => {
  const toast = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await api.get(`/api/users/${id}`);
      setUser(data);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err.message || 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (action) => {
    const confirmMessage = action === 'approve' 
      ? 'Are you sure you want to approve this user registration?' 
      : 'Are you sure you want to reject this user registration?';
    
  const ok = await confirm({ title: 'Confirm approval', message: confirmMessage, confirmText: action === 'approve' ? 'Approve' : 'Reject' });
  if (!ok) return;

    try {
      await api.put(`/api/users/${id}`, {
        status: action === 'approve' ? 'approved' : 'rejected',
        isActive: action === 'approve',
        approvedBy: 'admin',
        approvedAt: action === 'approve' ? new Date().toISOString() : null,
      });

      // Update user in local state
      setUser({
        ...user,
        status: action === 'approve' ? 'approved' : 'rejected',
        isActive: action === 'approve',
        approvedBy: 'admin',
        approvedAt: action === 'approve' ? new Date().toISOString() : null
      });

  toast.success(`User ${action}d successfully!`);
    } catch (err) {
      console.error(`Error ${action}ing user:`, err);
  toast.error(`Failed to ${action} user: ` + err.message);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({ title: 'Delete user?', message: 'This action cannot be undone.', confirmText: 'Delete' });
    if (!ok) return;

    try {
      await api.del(`/api/admin/users/${id}`);

  toast.success('User deleted successfully');
      navigate('/users');
    } catch (err) {
      console.error('Error deleting user:', err);
  toast.error('Failed to delete user: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (err) {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (user) => {
    const status = user.status || (user.isActive ? 'approved' : 'pending');
    
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <FaClock className="mr-1" /> Pending Approval
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
            <FaCheck className="mr-1" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
            <FaTimes className="mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
            Unknown Status
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading user...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={() => navigate('/users')}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/users')}
            className="text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">User Details</h1>
        </div>
        <div className="flex space-x-2">
          {user.status === 'pending' && (
            <>
              <button
                onClick={() => handleApproval('approve')}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center space-x-2"
              >
                <FaCheck />
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleApproval('reject')}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 flex items-center space-x-2"
              >
                <FaTimes />
                <span>Reject</span>
              </button>
            </>
          )}
          <button
            onClick={() => navigate(`/users/edit/${id}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2"
          >
            <FaEdit />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center space-x-2"
          >
            <FaTrash />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0 h-20 w-20">
            <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
              {(user.fullName || user.name)?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {user.fullName || user.name || 'No name provided'}
            </h2>
            <p className="text-gray-600 mb-2">{user.email}</p>
            {getStatusBadge(user)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="text-gray-900">{user.phone || 'No phone provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <p className="text-gray-900">{user.country || 'No country provided'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Institution</label>
                <p className="text-gray-900">{user.institution || 'No institution provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">User Type</label>
                <p className="text-gray-900">{user.userType || 'No user type provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Registration Type</label>
                <p className="text-gray-900">{user.registrationType || 'General'}</p>
              </div>
            </div>
          </div>
        </div>

        {(user.researchArea || user.motivation) && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Research Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.researchArea && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Research Area</label>
                  <p className="text-gray-900">{user.researchArea}</p>
                </div>
              )}
              {user.motivation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Motivation for Joining</label>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{user.motivation}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {user.bio && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Bio</h3>
            <p className="text-gray-700">{user.bio}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">User ID</label>
              <p className="text-gray-900 font-mono text-sm">{user._id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Date</label>
              <p className="text-gray-900">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Status</label>
              <p className="text-gray-900">{user.isActive ? 'Active' : 'Inactive'}</p>
            </div>
            {user.approvedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Approved Date</label>
                <p className="text-gray-900">{formatDate(user.approvedAt)}</p>
              </div>
            )}
            {user.approvedBy && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Approved By</label>
                <p className="text-gray-900">{user.approvedBy}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Verified</label>
              <p className="text-gray-900">{user.isVerified ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserView;
