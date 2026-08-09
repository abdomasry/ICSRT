import React, { useState } from 'react';
import { api } from '../lib/api';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const contactMethods = [
    {
      id: 'whatsapp',
      title: '📱 WhatsApp Support',
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Get instant support via WhatsApp',
      action: () => {
        const message = `Hi! I need help with: ${formData.subject || 'General inquiry'}`;
        window.open(`https://wa.me/+1234567890?text=${encodeURIComponent(message)}`, '_blank');
      }
    },
    {
      id: 'email',
      title: '📧 Email Support',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Send us a detailed email',
      action: () => {
        const subject = formData.subject || 'Support Request';
        const body = `Name: ${formData.name}\nPhone: ${formData.phone}\n\nMessage:\n${formData.message}`;
        window.location.href = `mailto:support@icsrt.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }
    },
    {
      id: 'ticket',
      title: '🎫 Support Ticket',
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Create a support ticket in our system',
      action: () => {
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
          setError('Please fill in all required fields to create a support ticket');
          return;
        }
        handleSubmitTicket();
      }
    }
  ];

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing Question' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmitTicket = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await api.post('/api/contacts', formData);

      if (data && (data.success || data._id || data.id)) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          category: 'general'
        });
      } else {
        setError((data && (data.error || data.message)) || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose your preferred way to get in touch with our support team. We're here to help!
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {contactMethods.map((method) => {
            return (
              <div key={method.id} className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className={`${method.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors text-2xl`}>
                  {method.title.charAt(0)}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-600 mb-4">{method.description}</p>
                <button
                  onClick={method.action}
                  className={`${method.color} text-white px-6 py-2 rounded-lg flex items-center justify-center mx-auto space-x-2 transition-colors`}
                >
                  <span>Contact Now</span>
                  <span>→</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              ✅ Your message has been sent successfully! We'll get back to you soon.
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              ❌ {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👤 Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📧 Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📞 Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📂 Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of your inquiry"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💬 Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please provide details about your inquiry..."
                  required
                ></textarea>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleSubmitTicket}
              disabled={loading || !formData.name || !formData.email || !formData.subject || !formData.message}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg flex items-center justify-center mx-auto space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>✈️</span>
                  <span>Send Support Ticket</span>
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              By submitting this form, you agree to our privacy policy
            </p>
          </div>
        </div>

        {/* Additional Contact Info */}
        <div className="mt-12 bg-gray-800 text-white rounded-lg p-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mx-auto mb-4 text-blue-400">📧</div>
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p>support@icsrt.com</p>
            </div>
            <div>
              <div className="text-3xl mx-auto mb-4 text-green-400">📱</div>
              <h3 className="text-xl font-semibold mb-2">WhatsApp</h3>
              <p>+1 (555) 123-4567</p>
            </div>
            <div>
              <div className="text-3xl mx-auto mb-4 text-purple-400">🎫</div>
              <h3 className="text-xl font-semibold mb-2">Support Portal</h3>
              <p>24/7 Ticket System</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
