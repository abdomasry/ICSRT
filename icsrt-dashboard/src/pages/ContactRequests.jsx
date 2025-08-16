import React, { useState, useEffect } from 'react';
import { FaEye, FaTrash, FaReply, FaEnvelope, FaCalendarAlt, FaUser, FaPhone, FaAt, FaWhatsapp, FaTicketAlt, FaExternalLinkAlt } from 'react-icons/fa';
import Pagination from '../components/Pagination';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { useConfirm } from '../context/ConfirmContext';

const ContactRequests = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('gradient'); // 'gradient' | 'cards' | 'list'

  // API base centralized via api helper

  // Contact methods configuration
  const contactMethods = [
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-green-500 hover:bg-green-600',
      action: (contact) => {
        if (!contact.phone) {
          toast.warning('No phone number available for this contact');
          return;
        }
        
        // Format phone number (remove non-digits)
        let phoneNumber = contact.phone.replace(/\D/g, '');
        
        // Remove leading zero if present
        if (phoneNumber.startsWith('0')) {
          phoneNumber = phoneNumber.substring(1);
        }
        
        // Add country code if missing (customize based on your country)
        if (!phoneNumber.startsWith('1') && !phoneNumber.startsWith('2') && !phoneNumber.startsWith('3') && 
            !phoneNumber.startsWith('4') && !phoneNumber.startsWith('5') && !phoneNumber.startsWith('6') && 
            !phoneNumber.startsWith('7') && !phoneNumber.startsWith('8') && !phoneNumber.startsWith('9')) {
          // Assuming Egypt country code +20 as default - customize this
          phoneNumber = '20' + phoneNumber;
        }
        
        const message = `Hello ${contact.name}! Thank you for contacting ICSRT regarding: "${contact.subject}". How can we help you?`;
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }
    },
    {
      name: 'Email',
      icon: FaAt,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: (contact) => {
        const subject = `Re: ${contact.subject}`;
        const body = `Hi ${contact.name},\n\nThank you for contacting us regarding: "${contact.subject}"\n\nYour message: "${contact.message}"\n\nWe're here to help!\n\nBest regards,\nICSRT Team`;
        const emailUrl = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = emailUrl;
      }
    },
    {
      name: 'Create Ticket',
      icon: FaTicketAlt,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: async (contact) => {
        try {
          const data = await api.postJson(`/api/contact-requests/${contact._id}/convert-to-ticket`, {});
          if (data && data.success) {
            toast.success(`Ticket #${data.ticketNumber} created for ${contact.name}`);
            // Refresh the contacts list to show the updated status
            fetchContacts();
          } else {
            toast.error(`Failed to create ticket${data?.message ? ': ' + data.message : ''}`);
          }
        } catch (error) {
          console.error('Error creating ticket:', error);
          toast.error(`Error creating ticket: ${error.message}`);
        }
      }
    }
  ];

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError('');
  const data = await api.getJson(`/api/contact-requests`);
      
      // Handle both response formats (with success field or direct array)
      if (Array.isArray(data)) {
        setContacts(data);
      } else if (data.success && data.data) {
        setContacts(data.data || []);
      } else if (data.data) {
        setContacts(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch contact requests');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to fetch contact requests. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
    
    // Mark as read if not already
    if (!contact.read) {
      markAsRead(contact._id);
    }
  };

  const markAsRead = async (id) => {
    try {
  const response = await api.patchJson(`/api/contact-requests/${id}/read`, {});
  if (response) {
        setContacts(contacts.map(contact => 
          contact._id === id ? { ...contact, read: true } : contact
        ));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({ title: 'Delete contact request?', message: 'This action cannot be undone.', confirmText: 'Delete' });
    if (ok) {
      try {
        await api.del(`/api/contact-requests/${id}`);
          setContacts(contacts.filter(contact => contact._id !== id));
          toast.success('Contact request deleted');
      } catch (error) {
        console.error('Error deleting contact:', error);
        setError('Failed to delete contact request');
      }
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedContact) return;

    try {
      setReplying(true);
      const data = await api.postJson(`/api/contacts/${selectedContact._id}/reply`, { replyMessage: replyMessage.trim() });
      if (data) {
        toast.success('Reply sent successfully!');
        setReplyMessage('');
        setShowModal(false);
        
        // Update the contact status
        setContacts(contacts.map(contact => 
          contact._id === selectedContact._id 
            ? { ...contact, replied: true, replyDate: new Date().toISOString() }
            : contact
        ));
      } else {
        setError('Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      setError('Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  // Filter and search contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'unread' && !contact.read) ||
                         (statusFilter === 'read' && contact.read) ||
                         (statusFilter === 'replied' && contact.replied) ||
                         (statusFilter === 'pending' && !contact.replied);
    
    return matchesSearch && matchesStatus;
  });

  // Pagination (client-side) using shared component
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstItem, indexOfLastItem);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Statistics for the dashboard
  const contactStats = {
    total: contacts.length,
    unread: contacts.filter(c => !c.read).length,
    read: contacts.filter(c => c.read).length,
    replied: contacts.filter(c => c.replied).length,
    pending: contacts.filter(c => !c.replied).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-6xl mb-4">📧</div>
          <p className="text-xl font-semibold text-gray-600">Loading messages...</p>
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
              📧 Contact Messages
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Manage customer inquiries and support requests</p>
            {contactStats.unread > 0 && (
              <div className="mt-2 flex items-center gap-2 text-blue-600">
                <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="font-semibold">{contactStats.unread} unread message{contactStats.unread !== 1 ? 's' : ''}</span>
              </div>
            )}
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
              onClick={fetchContacts}
              className="group bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white px-6 py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span className="text-xl">🔄</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Modern Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div
          className={`bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer ${statusFilter==='all' ? 'ring-2 ring-blue-300' : ''}`}
          onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setStatusFilter('all'); setCurrentPage(1); } }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
              {contactStats.total}
            </div>
            <div className="text-sm font-semibold text-gray-600">Total Messages</div>
            <div className="text-2xl mt-2">📧</div>
          </div>
        </div>

        <div
          className={`bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer ${statusFilter==='unread' ? 'ring-2 ring-blue-300' : ''}`}
          onClick={() => { setStatusFilter('unread'); setCurrentPage(1); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setStatusFilter('unread'); setCurrentPage(1); } }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
              {contactStats.unread}
            </div>
            <div className="text-sm font-semibold text-gray-600">Unread</div>
            <div className="text-2xl mt-2">🆕</div>
          </div>
        </div>

        <div
          className={`bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer ${statusFilter==='read' ? 'ring-2 ring-blue-300' : ''}`}
          onClick={() => { setStatusFilter('read'); setCurrentPage(1); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setStatusFilter('read'); setCurrentPage(1); } }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-1">
              {contactStats.read}
            </div>
            <div className="text-sm font-semibold text-gray-600">Read</div>
            <div className="text-2xl mt-2">👀</div>
          </div>
        </div>

        <div
          className={`bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer ${statusFilter==='replied' ? 'ring-2 ring-blue-300' : ''}`}
          onClick={() => { setStatusFilter('replied'); setCurrentPage(1); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setStatusFilter('replied'); setCurrentPage(1); } }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
              {contactStats.replied}
            </div>
            <div className="text-sm font-semibold text-gray-600">Replied</div>
            <div className="text-2xl mt-2">✅</div>
          </div>
        </div>

        <div
          className={`bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer ${statusFilter==='pending' ? 'ring-2 ring-blue-300' : ''}`}
          onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setStatusFilter('pending'); setCurrentPage(1); } }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-1">
              {contactStats.pending}
            </div>
            <div className="text-sm font-semibold text-gray-600">Pending</div>
            <div className="text-2xl mt-2">⏳</div>
          </div>
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
              onClick={fetchContacts}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Modern Search and Filters */}
      <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">🏷️</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm appearance-none"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Modern Messages Display */}
      <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg overflow-hidden">
        {filteredContacts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📧</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No messages found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' ? 'No messages match the current filters' : 'No contact messages yet'}
            </p>
          </div>
        ) : (
          <div className="p-6">
            {/* Cards vs List */}
            {viewMode === 'list' ? (
              <div className="space-y-2">
                {currentContacts.map((contact) => (
                  <div key={contact._id} className={`flex items-center justify-between bg-white rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition ${!contact.read ? 'ring-2 ring-blue-200' : ''}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-gray-100 text-gray-800 rounded-md flex items-center justify-center text-sm font-bold">
                        {contact.name?.charAt(0)?.toUpperCase() || '👤'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate max-w-[260px]">{contact.name} • {contact.subject}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[340px]">{contact.email} • {formatDate(contact.createdAt)}</div>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                      {!contact.read && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">new</span>
                      )}
                      {contact.replied && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-emerald-700">replied</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <button onClick={() => handleView(contact)} className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md">View</button>
                      <button onClick={() => handleDelete(contact._id)} className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentContacts.map((contact) => (
                <div key={contact._id} className={`${viewMode==='gradient' ? 'group bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 p-6 relative overflow-hidden' : 'bg-white rounded-xl border border-gray-200 shadow p-6'} ${!contact.read ? 'ring-2 ring-blue-200' : ''}`}>
                  {viewMode==='gradient' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                  
                  <div className="relative z-10">
                    {/* Message Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${viewMode==='gradient' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-gray-100 text-gray-800'} rounded-xl flex items-center justify-center text-xl font-bold shadow-lg`}>
                          {contact.name?.charAt(0)?.toUpperCase() || '👤'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors text-lg">
                            {contact.name}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <FaAt className="text-xs" />
                            {contact.email}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {!contact.read && (
                          <span className={`${viewMode==='gradient' ? 'bg-gradient-to-r from-blue-100 to-cyan-100' : 'bg-blue-100'} px-3 py-1 rounded-full text-sm font-semibold text-blue-700 animate-pulse`}>
                            🆕 New
                          </span>
                        )}
                        {contact.replied && (
                          <span className={`${viewMode==='gradient' ? 'bg-gradient-to-r from-emerald-100 to-green-100' : 'bg-green-100'} px-3 py-1 rounded-full text-sm font-semibold text-emerald-700`}>
                            ✅ Replied
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Subject and Date */}
                    <div className="mb-4">
                      <div className="font-semibold text-gray-800 mb-2 text-lg">
                        {contact.subject}
                      </div>
                      <div className="text-gray-600 line-clamp-3 bg-gray-50/80 rounded-lg p-3">
                        {contact.message}
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      {contact.phone && (
                        <div className="bg-gray-50/80 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <FaPhone className="text-blue-500" />
                            <span className="font-semibold text-gray-700">Phone</span>
                          </div>
                          <p className="text-gray-600">{contact.phone}</p>
                        </div>
                      )}

                      <div className="bg-gray-50/80 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <FaCalendarAlt className="text-green-500" />
                          <span className="font-semibold text-gray-700">Received</span>
                        </div>
                        <p className="text-gray-600">{formatDate(contact.createdAt)}</p>
                      </div>
                    </div>

                    {/* Quick Contact Methods */}
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Quick Actions</div>
                      <div className="grid grid-cols-3 gap-2">
                        {contactMethods.map((method, index) => {
                          const IconComponent = method.icon;
                          return (
                            <button
                              key={index}
                              onClick={() => method.action(contact)}
                              className={`${method.color} text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs font-semibold transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg`}
                            >
                              <IconComponent className="text-sm" />
                              <span className="hidden sm:inline">{method.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(contact)}
                        className={`flex-1 ${viewMode==='gradient' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${viewMode==='gradient' ? 'transform hover:scale-105' : ''} flex items-center justify-center gap-2`}
                      >
                        <FaEye />
                        View Details
                      </button>

                      <button
                        onClick={() => handleDelete(contact._id)}
                        className={`flex-1 ${viewMode==='gradient' ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700' : 'bg-red-600 hover:bg-red-700'} text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${viewMode==='gradient' ? 'transform hover:scale-105' : ''} flex items-center justify-center gap-2`}
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
            
            {/* Pagination */}
            <div className="mt-8 bg-gray-50/80 rounded-xl p-4">
              <Pagination
                page={currentPage}
                pageSize={itemsPerPage}
                total={filteredContacts.length}
                onPageChange={(p)=> setCurrentPage(p)}
                onPageSizeChange={(s)=> { setItemsPerPage(s); setCurrentPage(1); }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modern View/Reply Modal */}
      {showModal && selectedContact && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    📧 Message Details
                  </h2>
                  <p className="text-gray-600 mt-1">View and respond to contact message</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-all duration-200"
                >
                  ✕
                </button>
              </div>

              {/* Contact Methods */}
              <div className="mb-6 bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  🚀 Quick Contact Methods
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {contactMethods.map((method, index) => {
                    const IconComponent = method.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => method.action(selectedContact)}
                        className={`${method.color} text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl`}
                      >
                        <IconComponent className="text-lg" />
                        <span className="font-semibold">{method.name}</span>
                        <FaExternalLinkAlt className="text-sm" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 p-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    👤 Contact Information
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedContact.name}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                        <FaAt className="text-blue-500" />
                        {selectedContact.email}
                      </p>
                    </div>

                    {selectedContact.phone && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                          <FaPhone className="text-green-500" />
                          {selectedContact.phone}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Date Received</label>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                        <FaCalendarAlt className="text-purple-500" />
                        {formatDate(selectedContact.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 p-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    📝 Message Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg font-medium">{selectedContact.subject}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{selectedContact.message}</p>
                      </div>
                    </div>

                    {selectedContact.replied && (
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-emerald-700">
                          <span className="text-lg">✅</span>
                          <span className="font-semibold">Reply sent on {formatDate(selectedContact.replyDate)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reply Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  💬 Internal Reply Note
                </h4>
                <div className="space-y-4">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Add an internal note about your response to this message..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  />
                  <p className="text-sm text-gray-600 bg-white/60 p-3 rounded-lg">
                    💡 <strong>Note:</strong> This will mark the message as replied in your dashboard. Use the contact methods above to actually respond to the customer.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyMessage.trim() || replying}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {replying ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Saving Note...
                      </>
                    ) : (
                      <>
                        <FaReply />
                        Mark as Replied
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactRequests;
