import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

const EditServiceOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [serviceTypes, setServiceTypes] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    serviceType: '',
    projectDetails: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchServiceOrder();
    fetchServiceTypes();
  }, [id]);

  const fetchServiceOrder = async () => {
    try {
      setLoading(true);
      setError('');
      
  const data = await api.get(`/api/service-orders/${id}`);
      console.log('Service Order for editing:', data);
      
      // Populate form with existing data
      setFormData({
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        serviceType: data.serviceType || '',
        projectDetails: data.projectDetails || '',
        status: data.status || 'pending'
      });
    } catch (err) {
      console.error('Error fetching service order:', err);
      setError(err.message || 'Failed to fetch service order');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');

      // Prepare data for submission
      const updateData = {
        ...formData
      };

      console.log('Submitting updated service order:', updateData);

  const result = await api.put(`/api/service-orders/${id}`, updateData);
  console.log('Service order updated successfully:', result);
  toast.success('Service order updated successfully!');
      navigate(`/service-orders/view/${id}`);
    } catch (err) {
      console.error('Error updating service order:', err);
      setError(err.message || 'Failed to update service order');
    } finally {
      setSaving(false);
    }
  };

  const fetchServiceTypes = async () => {
    try {
      const data = await api.get('/api/services');
      const servicesArray = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      let options = [];
      if (Array.isArray(servicesArray)) {
        options = servicesArray.map(s => ({ value: s.slug || s._id || s.name, label: s.name || s.title || s.slug || s._id }));
      }
      // Ensure current serviceType is present even if not returned
      if (formData.serviceType && !options.some(o => o.value === formData.serviceType)) {
        options.unshift({ value: formData.serviceType, label: formData.serviceType });
      }
      // Fallback defaults when API fails or returns empty
      if (options.length === 0) {
        options = [
          { value: 'research', label: 'Research' },
          { value: 'translation', label: 'Translation' },
          { value: 'editing', label: 'Editing' },
          { value: 'consultation', label: 'Consultation' },
          { value: 'other', label: 'Other' },
        ];
        if (formData.serviceType && !options.some(o => o.value === formData.serviceType)) {
          options.unshift({ value: formData.serviceType, label: formData.serviceType });
        }
      }
      setServiceTypes(options);
    } catch (err) {
      console.error('Error fetching service types:', err);
      let options = [
        { value: 'research', label: 'Research' },
        { value: 'translation', label: 'Translation' },
        { value: 'editing', label: 'Editing' },
        { value: 'consultation', label: 'Consultation' },
        { value: 'other', label: 'Other' },
      ];
      if (formData.serviceType && !options.some(o => o.value === formData.serviceType)) {
        options.unshift({ value: formData.serviceType, label: formData.serviceType });
      }
      setServiceTypes(options);
    }
  };

  const validateForm = () => {
    return formData.fullName.trim() && formData.email.trim() && formData.serviceType;
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading service order...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.fullName) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Service Order</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-x-3">
              <button 
                onClick={fetchServiceOrder}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <Link 
                to="/service-orders"
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors inline-block"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to={`/service-orders/view/${id}`}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Back to Order Details
              </Link>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Edit Service Order</h1>
          <p className="text-gray-600 mt-1">Update service order information</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Customer Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter customer's full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
                <div className="md:col-span-1">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </section>

            {/* Service Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Service Information
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type *
                  </label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Service Type</option>
                    {serviceTypes.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Project Details */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Project Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="projectDetails" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Details
                  </label>
                  <textarea
                    id="projectDetails"
                    name="projectDetails"
                    value={formData.projectDetails}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the project requirements, objectives, and any specific instructions..."
                  />
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Order Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="ready-for-payment">Ready for Payment</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                to={`/service-orders/view/${id}`}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <FaTimes />
                <span>Cancel</span>
              </Link>
              <button
                type="submit"
                disabled={!validateForm() || saving}
                className={`px-6 py-2 rounded-lg text-white flex items-center space-x-2 transition-colors ${
                  validateForm() && !saving
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <FaSave />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditServiceOrder;
