import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch, 
  FaDownload,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaBuilding,
  FaGlobe,
  FaClipboardList,
  FaCog,
  FaCheck,
  FaTimes,
  FaClock,
  FaPaperPlane
} from 'react-icons/fa';
import { api } from '../lib/api';
import Pagination from '../components/Pagination';
import QRCode from 'react-qr-code';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

const ServiceOrders = () => {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('gradient'); // 'gradient' | 'cards' | 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [serviceTypes, setServiceTypes] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  // Base stats that respect search/serviceType but ignore selected status
  const [baseStats, setBaseStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    inProgress: 0,
    readyForPayment: 0,
    completed: 0,
    cancelled: 0,
  });

  // Enhanced functionality states
  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('userpage');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showPriceEditor, setShowPriceEditor] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [priceReason, setPriceReason] = useState('');
  const [updatingPrice, setUpdatingPrice] = useState(false);
  const [showStatusEditor, setShowStatusEditor] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showPurchaseLinkModal, setShowPurchaseLinkModal] = useState(false);
  const [generatingPurchaseLink, setGeneratingPurchaseLink] = useState(false);
  const [generatedPurchaseLink, setGeneratedPurchaseLink] = useState(null);
  // Admin notify (multi-channel)
  // Multi-channel defaults: don't log to userpage unless explicitly selected
  const [notifyChannels, setNotifyChannels] = useState({ userpage: false, email: false, whatsapp: false });
  const [sendingNotify, setSendingNotify] = useState(false);
  const [emailOverride, setEmailOverride] = useState('');
  const [phoneOverride, setPhoneOverride] = useState('');
  const [lastNotifyResults, setLastNotifyResults] = useState(null);
  // WhatsApp status
  const [waStatus, setWaStatus] = useState(null);
  const [waBusy, setWaBusy] = useState(false);
  const [waQR, setWaQR] = useState('');
  const [showRawQR, setShowRawQR] = useState(false);
  const [waDisconnecting, setWaDisconnecting] = useState(false);

  // Helper: normalize phone for display/input
  const normalizePhoneLocal = (input) => {
    if (!input) return '';
    let s = String(input).replace(/[^\d+]/g, '');
    // Convert 00 to +
    if (s.startsWith('00')) s = '+' + s.slice(2);
    // Already international
    if (s.startsWith('+')) return s;
    // Egypt defaults: local -> +20 without leading 0
    if (s.startsWith('0')) return '+20' + s.slice(1);
    // Fallback: assume Egypt if bare digits provided
    return '+20' + s;
  };
  // Price editor
  const [priceEditorOpen, setPriceEditorOpen] = useState(false);
  const [newCurrency, setNewCurrency] = useState('USD');
  // For price updates, default to email only (no userpage message unless selected)
  const [priceNotifyChannels, setPriceNotifyChannels] = useState({ userpage: false, email: true, whatsapp: false });
  const [priceCustomMessage, setPriceCustomMessage] = useState('');
  const [updatingPriceAndNotify, setUpdatingPriceAndNotify] = useState(false);

  // Use centralized API client; no local base URL constants

  // Enhanced service order statistics
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => o.status === 'in-progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    readyForPayment: orders.filter(o => o.status === 'ready-for-payment').length
  };

  // Deprecated: kept for tooltip fallback only (will be updated from baseStats)
  const [globalStats, setGlobalStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0, confirmed: 0, readyForPayment: 0 });

  // Stats for what is currently visible in the list (respects search, status and service type filters and pagination)
  const filteredStats = React.useMemo(() => {
    const list = Array.isArray(filteredOrders) ? filteredOrders : [];
    return {
      total: list.length,
      pending: list.filter(o => o.status === 'pending').length,
      inProgress: list.filter(o => o.status === 'in-progress').length,
      completed: list.filter(o => o.status === 'completed').length,
      cancelled: list.filter(o => o.status === 'cancelled').length,
      confirmed: list.filter(o => o.status === 'confirmed').length,
      readyForPayment: list.filter(o => o.status === 'ready-for-payment').length,
    };
  }, [filteredOrders]);

  const syncGlobalFromBase = (bs) => {
    if (!bs) return;
    setGlobalStats({
      total: bs.total || 0,
      pending: bs.pending || 0,
      inProgress: bs.inProgress || 0,
      completed: bs.completed || 0,
      cancelled: bs.cancelled || 0,
      confirmed: bs.confirmed || 0,
      readyForPayment: bs.readyForPayment || 0,
    });
  };

  useEffect(() => {
    fetchServiceOrders();
    fetchServiceTypes();
  }, [page, pageSize]);

  useEffect(() => {
    setPage(1);
    fetchServiceOrders();
  }, [statusFilter, searchTerm, serviceTypeFilter]);

  // Helper: fetch WA status and QR
  const fetchWaStatusAndQR = async () => {
    try {
      const statusRes = await api.get('/api/admin/whatsapp/status');
      setWaStatus(statusRes);
      const ready = !!statusRes?.status?.isReady;
      const qrInline = statusRes?.qr;
      if (!ready && qrInline) setWaQR(qrInline);
      else if (ready) setWaQR('');
    } catch {
      setWaQR('');
    }
  };

  // Auto-refresh conversation when opening the modal or switching to the conversation tab
  useEffect(() => {
    const loadConversation = async () => {
      if (showModal && selectedOrder && activeTab === 'conversation') {
        try {
          const conv = await api.get(`/api/admin/service-orders/${selectedOrder._id}/conversation`);
          const messages = conv?.conversation?.messages || [];
          setSelectedOrder(prev => (prev ? { ...prev, messages } : prev));
          // Also load WhatsApp status when conversation tab is visible
          await fetchWaStatusAndQR();
          // Prefill phone override once per open if empty
          const existing = phoneOverride?.trim();
          if (!existing) {
            const candidate = selectedOrder?.customerInfo?.whatsapp || selectedOrder?.customerInfo?.phone || selectedOrder?.phone;
            if (candidate) setPhoneOverride(normalizePhoneLocal(candidate));
          }
        } catch (e) {
          console.error('Failed to load conversation:', e);
        }
      }
    };
    loadConversation();
  }, [showModal, activeTab, selectedOrder ? selectedOrder._id : null]);

  const initWhatsApp = async (force = false) => {
    try {
      setWaBusy(true);
      await api.post(`/api/admin/whatsapp/init${force ? '?force=1' : ''}`, {});
      // Poll status/QR up to 60s
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts += 1;
        try {
          const statusRes = await api.get('/api/admin/whatsapp/status');
          setWaStatus(statusRes);
          const ready = !!statusRes?.status?.isReady;
          if (!ready) {
            try {
              const q = await api.get('/api/admin/whatsapp/qr');
              if (q?.success && q.qr) setWaQR(q.qr);
            } catch {}
          } else {
            setWaQR('');
          }
          if (ready || attempts >= 30) {
            clearInterval(interval);
            setWaBusy(false);
          }
        } catch {
          if (attempts >= 30) {
            clearInterval(interval);
            setWaBusy(false);
          }
        }
      }, 2000);
    } catch (e) {
      setWaBusy(false);
      toast.error(e.message || 'Failed to start WhatsApp');
    }
  };

  const fetchServiceTypes = async () => {
    try {
      const data = await api.get('/api/services');
      const servicesArray = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      if (Array.isArray(servicesArray)) {
        setServiceTypes(servicesArray);
      }
    } catch (err) {
      console.error('Error fetching service types:', err);
      // Fallback service types if API fails
      setServiceTypes([
        { _id: 'research', name: 'Research' },
        { _id: 'translation', name: 'Translation' },
        { _id: 'editing', name: 'Editing' },
        { _id: 'consultation', name: 'Consultation' }
      ]);
    }
  };

  useEffect(() => {
    // Filter orders based on search term, status, and service type
    if (Array.isArray(orders)) {
      let filtered = orders.filter(order => {
        const matchesSearch = 
          order.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.projectDetails?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.fieldOfStudy?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesServiceType = serviceTypeFilter === 'all' || order.serviceType === serviceTypeFilter;

        return matchesSearch && matchesStatus && matchesServiceType;
      });
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders([]);
    }
  }, [orders, searchTerm, statusFilter, serviceTypeFilter]);

  const fetchServiceOrders = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
        status: statusFilter,
        search: searchTerm,
        serviceType: serviceTypeFilter,
        sortBy: 'submittedAt',
        sortOrder: 'desc'
      });

      const data = await api.getJson(`/api/admin/service-orders/enhanced?${params}`);
  if (data?.orders) {
        setOrders(Array.isArray(data.orders) ? data.orders : []);
        const p = data.pagination || {};
        // prefer totalItems if present (admin enhanced), else compute
        setTotal(parseInt(p.totalItems || p.total || 0));
        // set base stats (respect search/serviceType, ignore status)
        if (data.stats) {
          setBaseStats({
            total: parseInt(data.stats.total || 0),
            pending: parseInt(data.stats.pending || 0),
            confirmed: parseInt(data.stats.confirmed || 0),
            inProgress: parseInt(data.stats.inProgress || 0),
            readyForPayment: parseInt(data.stats.readyForPayment || 0),
            completed: parseInt(data.stats.completed || 0),
            cancelled: parseInt(data.stats.cancelled || 0),
          });
          syncGlobalFromBase(data.stats);
        }
      } else {
        // Fallback to basic API
        const basic = await api.get('/api/service-orders');
        const ordersArray = Array.isArray(basic) ? basic : (Array.isArray(basic?.data) ? basic.data : []);
        setOrders(Array.isArray(ordersArray) ? ordersArray : []);
        setTotal(Array.isArray(ordersArray) ? ordersArray.length : 0);
      }
  // sync fallback global from current list if server stats missing
  if (!data?.stats) syncGlobalFromBase({
    total: orders.length,
    pending: orderStats.pending,
    confirmed: orderStats.confirmed,
    inProgress: orderStats.inProgress,
    readyForPayment: orderStats.readyForPayment,
    completed: orderStats.completed,
    cancelled: orderStats.cancelled,
  });
    } catch (err) {
      console.error('Error fetching service orders:', err);
      setError(err.message || 'Failed to fetch service orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
    const ok = await confirm({ title: 'Delete service order?', message: 'This action cannot be undone.', confirmText: 'Delete' });
    if (!ok) return;

    try {
      await api.del(`/api/service-orders/${orderId}`);

      // Remove order from local state
      setOrders(orders.filter(order => order._id !== orderId));
      toast.success('Service order deleted successfully');
    } catch (err) {
      console.error('Error deleting service order:', err);
      toast.error('Failed to delete service order');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/api/service-orders/${orderId}`, { status: newStatus });
      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
  toast.success(`Order status updated to ${newStatus}`);
  fetchGlobalStats();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update status');
    }
  };

  const generatePurchaseLink = async (order) => {
    try {
      setGeneratingPurchaseLink(true);
      const data = await api.post(`/api/admin/service-orders/${order._id}/generate-purchase-link`, {
        adminEmail: 'admin@icsrt.com',
        expiryHours: 72,
      });
      
      if (data?.success) {
        const linkString = typeof data.purchaseLink === 'string' ? data.purchaseLink : (data.purchaseLink?.url || '');
        setGeneratedPurchaseLink(linkString);
        setShowPurchaseLinkModal(true);
        // Refresh orders to show updated status
  await fetchServiceOrders();
  fetchGlobalStats();
      } else {
        toast.error('Failed to generate purchase link: ' + (data?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating purchase link:', error);
      toast.error('Failed to generate purchase link');
    } finally {
      setGeneratingPurchaseLink(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedOrder) return;
    try {
      setSendingMessage(true);
      if (selectedChannel === 'userpage') {
        // Only log to userpage when selected explicitly
        const result = await api.post(`/api/admin/service-orders/${selectedOrder._id}/messages`, {
          message: newMessage,
          sender: 'admin',
          channel: 'userpage',
          type: 'text',
        });
        if (!result?.success) throw new Error(result?.error || 'Failed to send userpage message');
      } else {
        // For email or whatsapp, use notify endpoint with only that channel
        const body = {
          message: newMessage,
          channels: [selectedChannel],
          subject: 'ICSRT Update',
          emailOverride: emailOverride?.trim() || undefined,
          phoneOverride: phoneOverride?.trim() || undefined,
        };
        const result = await api.post(`/api/admin/service-orders/${selectedOrder._id}/notify`, body);
        if (!result?.success) throw new Error(result?.error || 'Failed to send notification');
      }

      // Clear inputs and refresh conversation (only userpage messages will appear)
      setNewMessage('');
      const conv = await api.get(`/api/admin/service-orders/${selectedOrder._id}/conversation`);
      const messages = conv?.conversation?.messages || [];
      setSelectedOrder(prev => (prev ? { ...prev, messages } : prev));
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // Multi-channel notify using new admin endpoint
  const sendNotify = async () => {
    if (!newMessage.trim() || !selectedOrder) return;
    try {
      setSendingNotify(true);
      setLastNotifyResults(null);
      const channels = Object.entries(notifyChannels).filter(([, v]) => v).map(([k]) => k);
      if (channels.length === 0) {
        toast.warning('Select at least one channel');
        return;
      }
      const result = await api.post(`/api/admin/service-orders/${selectedOrder._id}/notify`, {
        message: newMessage,
        channels,
        subject: 'ICSRT Update',
        emailOverride: emailOverride?.trim() || undefined,
        phoneOverride: phoneOverride?.trim() || undefined,
      });
      if (result?.success) {
        setNewMessage('');
        setEmailOverride('');
        setPhoneOverride('');
        setLastNotifyResults(result.results || null);
        // Refresh conversation
        const conv = await api.get(`/api/admin/service-orders/${selectedOrder._id}/conversation`);
        const messages = conv?.conversation?.messages || [];
        setSelectedOrder(prev => (prev ? { ...prev, messages } : prev));
      } else {
        toast.error('Failed to send notifications: ' + (result?.error || 'Unknown error'));
      }
    } catch (e) {
      console.error('Notify error:', e);
      toast.error('Failed to send notifications');
    } finally {
      setSendingNotify(false);
    }
  };

  const updatePriceAndNotify = async () => {
    if (!selectedOrder || !newPrice || !priceReason.trim()) return;
    try {
      setUpdatingPriceAndNotify(true);
      const channels = Object.entries(priceNotifyChannels).filter(([, v]) => v).map(([k]) => k);
      const body = { 
        newPrice: parseFloat(newPrice), 
        currency: newCurrency,
        reason: priceReason.trim(), 
        channels, 
        customMessage: priceCustomMessage 
      };
      const res = await api.post(`/api/admin/service-orders/${selectedOrder._id}/price-and-notify`, body);
      if (res?.success) {
        // Update local selected order and list
        setOrders(prev => prev.map(o => (o._id === selectedOrder._id ? res.order : o)));
        setSelectedOrder(res.order);
        setPriceEditorOpen(false);
        setNewPrice('');
        setNewCurrency('USD');
        setPriceReason('');
        setPriceCustomMessage('');
        toast.success('Price updated successfully');
      } else {
        toast.error('Failed to update price: ' + (res?.error || 'Unknown error'));
      }
    } catch (e) {
      console.error('Price update error:', e);
      toast.error('Failed to update price');
    } finally {
      setUpdatingPriceAndNotify(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-xl font-semibold text-gray-600">Loading service orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="bg-gradient-to-r from-red-100 to-rose-100 border border-red-200 text-red-700 p-6 rounded-xl shadow-lg max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⚠️</span>
              <span className="font-semibold text-lg">Error Loading Service Orders</span>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchServiceOrders}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      {/* Modern Header */}
  <div className="bg-white/80 rounded-xl border border-white/20 shadow-xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              🛒 Service Orders
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Manage customer service requests and project orders</p>
            {orderStats.pending > 0 && (
              <div className="mt-2 flex items-center gap-2 text-yellow-600">
                <FaClock />
                <span className="font-semibold">{orderStats.pending} order{orderStats.pending !== 1 ? 's' : ''} pending review</span>
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
              onClick={fetchServiceOrders}
              className="group bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white px-6 py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span className="text-xl">🔄</span>
              Refresh
            </button>
            <button className="group bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2">
              <FaDownload />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Modern Stats Cards (clickable to categorize by status) */}
  <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-8">
  <div
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter('all')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setStatusFilter('all')}
          aria-pressed={statusFilter === 'all'}
          className={`bg-white/80 rounded-xl border ${statusFilter==='all' ? 'border-blue-200 ring-1 ring-blue-100' : 'border-white/20'} shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
              {baseStats.total}
            </div>
            <div className="text-sm font-semibold text-gray-600" title={`All orders in DB: ${globalStats.total}`}>Total Orders</div>
            <div className="text-2xl mt-2">🛒</div>
          </div>
        </div>

  <div
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter('pending')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setStatusFilter('pending')}
          aria-pressed={statusFilter === 'pending'}
          className={`bg-white/80 rounded-xl border ${statusFilter==='pending' ? 'border-yellow-200 ring-1 ring-yellow-100' : 'border-white/20'} shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-1">
              {baseStats.pending}
            </div>
            <div className="text-sm font-semibold text-gray-600" title={`All pending in DB: ${globalStats.pending}`}>Pending</div>
            <div className="text-2xl mt-2">⏳</div>
          </div>
        </div>

  <div
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter('confirmed')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setStatusFilter('confirmed')}
          aria-pressed={statusFilter === 'confirmed'}
          className={`bg-white/80 rounded-xl border ${statusFilter==='confirmed' ? 'border-green-200 ring-1 ring-green-100' : 'border-white/20'} shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
              {baseStats.confirmed}
            </div>
            <div className="text-sm font-semibold text-gray-600" title={`All confirmed in DB: ${globalStats.confirmed}`}>Confirmed</div>
            <div className="text-2xl mt-2">✅</div>
          </div>
        </div>

  <div
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter('in-progress')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setStatusFilter('in-progress')}
          aria-pressed={statusFilter === 'in-progress'}
          className={`bg-white/80 rounded-xl border ${statusFilter==='in-progress' ? 'border-purple-200 ring-1 ring-purple-100' : 'border-white/20'} shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
              {baseStats.inProgress}
            </div>
            <div className="text-sm font-semibold text-gray-600" title={`All in-progress in DB: ${globalStats.inProgress}`}>In Progress</div>
            <div className="text-2xl mt-2">⚙️</div>
          </div>
        </div>

  <div
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter('ready-for-payment')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setStatusFilter('ready-for-payment')}
          aria-pressed={statusFilter === 'ready-for-payment'}
          className={`bg-white/80 rounded-xl border ${statusFilter==='ready-for-payment' ? 'border-cyan-200 ring-1 ring-cyan-100' : 'border-white/20'} shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-1">
              {baseStats.readyForPayment}
            </div>
            <div className="text-sm font-semibold text-gray-600" title={`All ready-to-pay in DB: ${globalStats.readyForPayment}`}>Ready to Pay</div>
            <div className="text-2xl mt-2">💳</div>
          </div>
        </div>

  <div
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter('completed')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setStatusFilter('completed')}
          aria-pressed={statusFilter === 'completed'}
          className={`bg-white/80 rounded-xl border ${statusFilter==='completed' ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-white/20'} shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-1">
              {baseStats.completed}
            </div>
            <div className="text-sm font-semibold text-gray-600" title={`All completed in DB: ${globalStats.completed}`}>Completed</div>
            <div className="text-2xl mt-2">🎉</div>
          </div>
        </div>

  <div
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter('cancelled')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setStatusFilter('cancelled')}
          aria-pressed={statusFilter === 'cancelled'}
          className={`bg-white/80 rounded-xl border ${statusFilter==='cancelled' ? 'border-rose-200 ring-1 ring-rose-100' : 'border-white/20'} shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent mb-1">
              {baseStats.cancelled}
            </div>
            <div className="text-sm font-semibold text-gray-600" title={`All cancelled in DB: ${globalStats.cancelled}`}>Cancelled</div>
            <div className="text-2xl mt-2">❌</div>
          </div>
        </div>
      </div>

      {/* Modern Search and Filters */}
  <div className="bg-white/80 rounded-xl border border-white/20 shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
            />
          </div>
          {/* Status select */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">📊</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="ready-for-payment">Ready for Payment</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          {/* Service type select */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">🛠️</span>
            <select
              value={serviceTypeFilter}
              onChange={(e) => setServiceTypeFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 appearance-none"
            >
              <option value="all">All Service Types</option>
              {serviceTypes.map((service) => (
                <option key={service._id} value={service._id || service.name?.toLowerCase()}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-blue-50/80 rounded-xl p-3 border border-blue-200 text-center">
            <span className="text-sm font-semibold text-blue-700">
              {filteredOrders.length} of {total || orders.length} {statusFilter === 'all' ? 'orders' : `${statusFilter} orders`}
            </span>
          </div>
        </div>
      </div>

      {/* Modern Orders Display */}
  <div className="bg-white/80 rounded-xl border border-white/20 shadow-lg overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No service orders found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || serviceTypeFilter !== 'all' 
                ? 'No orders match the current filters' 
                : 'No service orders have been created yet'}
            </p>
          </div>
        ) : (
          <div className="p-6">
            {/* Cards vs List */}
            {viewMode === 'list' ? (
              <div className="space-y-2">
                {filteredOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-gray-100 text-gray-800 rounded-md flex items-center justify-center text-sm font-bold">
                        {order.fullName?.charAt(0)?.toUpperCase() || order.email?.charAt(0)?.toUpperCase() || '🛒'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate max-w-[260px]">{order.fullName || 'No name'} • {order.serviceType || 'Service'}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[360px]">{order.email} • {formatDate(order.submittedAt || order.createdAt)}</div>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${order.status==='completed' ? 'bg-green-100 text-emerald-700' : order.status==='pending' ? 'bg-yellow-100 text-yellow-700' : order.status==='in-progress' ? 'bg-purple-100 text-purple-700' : order.status==='ready-for-payment' ? 'bg-cyan-100 text-cyan-700' : order.status==='confirmed' ? 'bg-green-100 text-green-700' : order.status==='cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{(order.status||'unknown').replaceAll('-', ' ')}</span>
                      {order.price && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                          {order.currency === 'EGP' ? 'EGP ' : order.currency === 'SAR' ? 'SAR ' : order.currency === 'AED' ? 'AED ' : '$'}
                          {order.price}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Link to={`/service-orders/view/${order._id}`} className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md">View</Link>
                      <Link to={`/service-orders/edit/${order._id}`} className="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-md">Edit</Link>
                      <button onClick={() => handleDelete(order._id)} className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md">Delete</button>
                      {(order.status === 'confirmed' || order.status === 'ready-for-payment') && (
                        <button onClick={() => generatePurchaseLink(order)} disabled={generatingPurchaseLink} className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50">Pay Link</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className={`${viewMode==='gradient'
                    ? 'group bg-white/60 rounded-xl border border-white/40 shadow-sm hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 p-6 relative overflow-hidden'
                    : 'bg-white rounded-xl border border-gray-200 shadow p-6'
                  }`}
                >
                  {viewMode==='gradient' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                  
                  <div className="relative z-10">
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${viewMode==='gradient' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-gray-100 text-gray-800'} rounded-xl flex items-center justify-center text-xl font-bold shadow-lg`}>
                          {order.fullName?.charAt(0)?.toUpperCase() || order.email?.charAt(0)?.toUpperCase() || '🛒'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors text-lg">
                            {order.fullName || 'No name provided'}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <FaEnvelope className="text-xs" />
                            {order.email}
                          </div>
                        </div>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${(() => {
                        const g = viewMode==='gradient';
                        switch (order.status) {
                          case 'pending': return g ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700' : 'bg-yellow-100 text-yellow-700';
                          case 'confirmed': return g ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' : 'bg-green-100 text-green-700';
                          case 'in-progress': return g ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700' : 'bg-purple-100 text-purple-700';
                          case 'ready-for-payment': return g ? 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700' : 'bg-cyan-100 text-cyan-700';
                          case 'completed': return g ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700' : 'bg-green-100 text-emerald-700';
                          case 'cancelled': return g ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700' : 'bg-red-100 text-red-700';
                          default: return g ? 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700' : 'bg-gray-100 text-gray-700';
                        }
                      })()}`}>
                        {order.status === 'pending' ? '⏳ Pending' :
                         order.status === 'confirmed' ? '✅ Confirmed' :
                         order.status === 'in-progress' ? '⚙️ In Progress' :
                         order.status === 'ready-for-payment' ? '💳 Ready to Pay' :
                         order.status === 'completed' ? '🎉 Completed' :
                         order.status === 'cancelled' ? '❌ Cancelled' : '📋 Unknown'}
                      </span>
                    </div>

                    {/* Service Type Badge */}
                    <div className="mb-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${(() => {
                        const g = viewMode==='gradient';
                        switch (order.serviceType) {
                          case 'research': return g ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700' : 'bg-purple-100 text-purple-700';
                          case 'translation': return g ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700' : 'bg-blue-100 text-blue-700';
                          case 'editing': return g ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700' : 'bg-green-100 text-emerald-700';
                          case 'consultation': return g ? 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700' : 'bg-orange-100 text-orange-700';
                          default: return g ? 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700' : 'bg-gray-100 text-gray-700';
                        }
                      })()}`}>
                        {order.serviceType === 'research' ? '🔬 Research' :
                         order.serviceType === 'translation' ? '🌐 Translation' :
                         order.serviceType === 'editing' ? '✏️ Editing' :
                         order.serviceType === 'consultation' ? '💬 Consultation' : `🛠️ ${(() => { const t = String(order.serviceType || 'Service').replaceAll('-', ' ').replaceAll('_', ' '); return t.charAt(0).toUpperCase() + t.slice(1); })()}`}
                      </span>
                    </div>

                    {/* Project Details */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-800 mb-2 text-lg">Project Details</h3>
                      <div className="text-gray-600 line-clamp-3 bg-gray-50/80 rounded-lg p-3">
                        {order.projectDetails || 'No project details provided'}
                      </div>
                    </div>

                    {/* Attachments Badge */}
                    {order.attachments && order.attachments.length > 0 && (
                      <div className="mb-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${viewMode==='gradient' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700' : 'bg-blue-100 text-blue-700'}`}>
                          <FaDownload />
                          {order.attachments.length} File{order.attachments.length !== 1 ? 's' : ''} Attached
                        </div>
                      </div>
                    )}

                    {/* Contact and Date Info */}
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      {order.phone && (
                        <div className="bg-gray-50/80 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <FaPhone className="text-green-500" />
                            <span className="font-semibold text-gray-700">Phone</span>
                          </div>
                          <p className="text-gray-600">{order.phone}</p>
                        </div>
                      )}

                      <div className="bg-gray-50/80 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <FaCalendarAlt className="text-blue-500" />
                          <span className="font-semibold text-gray-700">Submitted</span>
                        </div>
                        <p className="text-gray-600">{formatDate(order.submittedAt || order.createdAt)}</p>
                      </div>

                      {order.fieldOfStudy && (
                        <div className="bg-gray-50/80 rounded-lg p-3 col-span-2">
                          <div className="flex items-center gap-2 mb-1">
                            <FaBuilding className="text-purple-500" />
                            <span className="font-semibold text-gray-700">Field of Study</span>
                          </div>
                          <p className="text-gray-600">{order.fieldOfStudy}</p>
                        </div>
                      )}
                    </div>

                    {/* Quick Status Update */}
                    <div className="mb-4">
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Update Status</label>
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="confirmed">✅ Confirmed</option>
                        <option value="in-progress">⚙️ In Progress</option>
                        <option value="ready-for-payment">💳 Ready for Payment</option>
                        <option value="completed">🎉 Completed</option>
                        <option value="cancelled">❌ Cancelled</option>
                      </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {/* Main Action Buttons Row */}
                      <div className="flex gap-2">
                        <Link
                          to={`/service-orders/view/${order._id}`}
                          className={`flex-1 ${viewMode==='gradient' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${viewMode==='gradient' ? 'transform hover:scale-105' : ''} flex items-center justify-center gap-2`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaEye />
                          View
                        </Link>

                        <Link
                          to={`/service-orders/edit/${order._id}`}
                          className={`flex-1 ${viewMode==='gradient' ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${viewMode==='gradient' ? 'transform hover:scale-105' : ''} flex items-center justify-center gap-2`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaEdit />
                          Edit
                        </Link>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(order._id);
                          }}
                          className={`flex-1 ${viewMode==='gradient' ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700' : 'bg-red-600 hover:bg-red-700'} text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${viewMode==='gradient' ? 'transform hover:scale-105' : ''} flex items-center justify-center gap-2`}
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </div>

                      {/* Pay Link Button (only for confirmed/ready-for-payment orders) */}
                      {(order.status === 'confirmed' || order.status === 'ready-for-payment') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generatePurchaseLink(order);
                          }}
                          disabled={generatingPurchaseLink}
                          className={`w-full ${viewMode==='gradient' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${viewMode==='gradient' ? 'transform hover:scale-105' : ''} flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {generatingPurchaseLink ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              💳 Generate Pay Link
                            </>
                          )}
                        </button>
                      )}

                      {/* Enhanced Actions Row */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                            setShowModal(true);
                            setActiveTab('details');
                          }}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 text-sm"
                        >
                          💬 Message
                        </button>

                        {order.price && (
                          <div className="flex-1 bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 px-3 py-2 rounded-lg font-semibold text-center">
                            {order.currency === 'EGP' ? 'EGP ' : order.currency === 'SAR' ? 'SAR ' : order.currency === 'AED' ? 'AED ' : '$'}
                            {order.price}
                          </div>
                        )}
                      </div>
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
                total={total || orders.length}
                onPageChange={(p)=> setPage(p)}
                onPageSizeChange={(s)=> { setPageSize(s); setPage(1); }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Purchase Link Modal */}
      {showPurchaseLinkModal && generatedPurchaseLink && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 rounded-xl border border-white/20 shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">💳</div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                Payment Link Generated!
              </h3>
              <p className="text-gray-600">Share this link with the customer for payment</p>
            </div>

            <div className="bg-gray-50/80 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-700">Payment Link:</span>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200 break-all text-sm font-mono">
                {generatedPurchaseLink}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedPurchaseLink);
                  toast.success('Payment link copied to clipboard');
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                📋 Copy Link
              </button>
              
              <button
                onClick={() => {
                  setShowPurchaseLinkModal(false);
                  setGeneratedPurchaseLink(null);
                }}
                className="flex-1 bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 rounded-xl border border-white/20 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Order Details - {selectedOrder.fullName || 'Customer'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-gray-200">
                {['details', 'conversation'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    {tab === 'conversation' ? '💬 Messages' : '📋 Details'}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50/80 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Customer Info</h4>
                      <p><strong>Name:</strong> {selectedOrder.fullName || 'N/A'}</p>
                      <p><strong>Email:</strong> {selectedOrder.email}</p>
                      {selectedOrder.phone && <p><strong>Phone:</strong> {selectedOrder.phone}</p>}
                    </div>
                    <div className="bg-gray-50/80 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Order Info</h4>
                      <p><strong>Status:</strong> {selectedOrder.status}</p>
                      <p><strong>Service:</strong> {selectedOrder.serviceType || 'N/A'}</p>
                      {selectedOrder.price && (
                        <p>
                          <strong>Price:</strong> {selectedOrder.currency === 'EGP' ? 'EGP ' : selectedOrder.currency === 'SAR' ? 'SAR ' : selectedOrder.currency === 'AED' ? 'AED ' : '$'}
                          {selectedOrder.price}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50/80 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Project Details</h4>
                    <p>{selectedOrder.projectDetails || 'No details provided'}</p>
                  </div>
                  
                  {/* Attachments Section */}
                  {selectedOrder.attachments && selectedOrder.attachments.length > 0 && (
                    <div className="bg-gray-50/80 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FaDownload className="text-blue-600" />
                        Uploaded Files ({selectedOrder.attachments.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedOrder.attachments.map((file, index) => {
                          // Extract filename from URL or use stored filename
                          const filename = file.filename || file.url?.split('/').pop() || file.originalName;
                          const downloadUrl = `/api/download/${filename}`;
                          
                          return (
                            <a
                              key={index}
                              href={downloadUrl}
                              className="flex items-center gap-3 p-3 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 group"
                            >
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center text-blue-600">
                              {file.mimetype?.startsWith('image/') ? '🖼️' : 
                               file.mimetype?.includes('pdf') ? '📄' :
                               file.mimetype?.includes('word') || file.mimetype?.includes('document') ? '📝' :
                               file.mimetype?.includes('sheet') || file.mimetype?.includes('excel') ? '📊' :
                               file.mimetype?.includes('presentation') || file.mimetype?.includes('powerpoint') ? '📊' :
                               '📎'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-800 truncate group-hover:text-blue-600">
                                {file.originalName || file.filename}
                              </div>
                              <div className="text-xs text-gray-500">
                                {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                              </div>
                            </div>
                            <FaDownload className="text-gray-400 group-hover:text-blue-600" />
                          </a>
                        );})}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'conversation' && (
                <div className="space-y-4">
                  {/* Message History */}
                  <div className="bg-gray-50/80 rounded-lg p-4 h-64 overflow-y-auto">
                    <h4 className="font-semibold text-gray-800 mb-3">💬 Conversation History</h4>
                    {selectedOrder.messages && selectedOrder.messages.length > 0 ? (
                      selectedOrder.messages.map((message, index) => (
                        <div key={index} className={`mb-3 p-3 rounded-lg ${
                          message.sender === 'admin' 
                            ? 'bg-blue-100 text-blue-800 ml-4' 
                            : 'bg-white text-gray-800 mr-4'
                        }`}>
                          <div className="text-sm font-medium mb-1">
                            {message.sender === 'admin' ? '👨‍💼 Admin' : '👤 Customer'}
                          </div>
                          <div>{message.message}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(message.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center">No messages yet</p>
                    )}
                  </div>

                  {/* Send Message */}
                  <div className="bg-gray-50/80 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">📨 Send Message</h4>
                    <div className="space-y-3">
                      {/* WhatsApp status helper */}
                      <div className="bg-white/70 border border-gray-200 rounded-lg p-3 text-sm flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-800">WhatsApp status</div>
                          <div className="text-gray-600">
                            {waStatus?.status?.isReady ? 'Connected and ready' : waStatus?.status?.isInitializing ? 'Initializing…' : 'Not connected'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={fetchWaStatusAndQR}
                            className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300"
                          >Refresh</button>
                          <button
                            onClick={() => initWhatsApp(!!waStatus?.status?.isReady)}
                            disabled={waBusy}
                            className="px-3 py-1.5 rounded bg-emerald-600 text-white disabled:opacity-50"
                          >{waBusy ? 'Starting…' : (waStatus?.status?.isReady ? 'Re-init & Show QR' : 'Start & Show QR')}</button>
                          <button
                            onClick={async ()=>{ try { const q = await api.get('/api/admin/whatsapp/qr'); if (q?.success && q.qr) setWaQR(q.qr); } catch {} }}
                            className="px-3 py-1.5 rounded bg-indigo-600 text-white"
                          >Test QR</button>
                          {waStatus?.status?.clientExists && (
                            <button
                              onClick={async ()=>{ try { setWaDisconnecting(true); await api.post('/api/admin/whatsapp/disconnect', {}); await fetchWaStatusAndQR(); } finally { setWaDisconnecting(false);} }}
                              disabled={waDisconnecting}
                              className="px-3 py-1.5 rounded bg-red-600 text-white disabled:opacity-50"
                            >{waDisconnecting ? 'Disconnecting…' : 'Disconnect'}</button>
                          )}
                        </div>
                      </div>
                      {/* Inline QR display */}
                      {!waStatus?.status?.isReady && waQR && (
                        <div className="bg-white/70 border border-gray-200 rounded-lg p-3 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-sm text-gray-700 mb-2">Scan this QR in WhatsApp → Linked Devices</div>
                            <div className="bg-white p-3 inline-block rounded">
                              <QRCode value={waQR} size={164} />
                            </div>
                            <div className="mt-3 text-xs text-gray-600">
                              <button
                                onClick={() => setShowRawQR(v => !v)}
                                className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 border"
                              >{showRawQR ? 'Hide raw QR text' : 'Show raw QR text'}</button>
                              {showRawQR && (
                                <div className="mt-2">
                                  <div className="bg-gray-50 border rounded p-2 text-left break-all font-mono text-[11px] max-h-24 overflow-auto">
                                    {waQR}
                                  </div>
                                  <div className="mt-1">
                                    <button
                                      onClick={() => navigator.clipboard.writeText(waQR)}
                                      className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                                    >Copy</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Quick channel</label>
                          <select
                            value={selectedChannel}
                            onChange={(e) => setSelectedChannel(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="userpage">User Dashboard</option>
                            <option value="email">Email</option>
                            <option value="whatsapp">WhatsApp</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-700">Multi-channel</label>
                          <div className="flex items-center gap-4 px-3 py-2 border border-gray-200 rounded-lg">
                            {['userpage','email','whatsapp'].map(ch => (
                              <label key={ch} className="inline-flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={!!notifyChannels[ch]} onChange={(e)=> setNotifyChannels(prev=>({ ...prev, [ch]: e.target.checked }))} />
                                <span className="capitalize">{ch}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                      />
                      {/* Optional overrides for email/WhatsApp */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Email override (optional)</label>
                          <input
                            type="email"
                            value={emailOverride}
                            onChange={(e)=>setEmailOverride(e.target.value)}
                            placeholder={selectedOrder?.email || selectedOrder?.userEmail || 'name@example.com'}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
            <div>
                          <label className="text-sm font-medium text-gray-700">WhatsApp/Phone override (optional)</label>
                          <input
                            type="tel"
                            value={phoneOverride}
              onChange={(e)=>setPhoneOverride(e.target.value)}
              placeholder={normalizePhoneLocal(selectedOrder?.customerInfo?.whatsapp || selectedOrder?.customerInfo?.phone || selectedOrder?.phone) || '+201234567890'}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="text-xs text-gray-500 mt-1">
              Target used: { normalizePhoneLocal(phoneOverride?.trim() || selectedOrder?.customerInfo?.whatsapp || selectedOrder?.customerInfo?.phone || selectedOrder?.phone) || 'none' }
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={sendMessage}
                        disabled={sendingMessage || !newMessage.trim()}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {sendingMessage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <FaPaperPlane />
                            Send Message
                          </>
                        )}
                      </button>
                      <button
                        onClick={sendNotify}
                        disabled={sendingNotify || !newMessage.trim()}
                        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {sendingNotify ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Notifying...
                          </>
                        ) : (
                          <>
                            📣 Send via selected channels
                          </>
                        )}
                      </button>
                      {lastNotifyResults && (
                        <div className="mt-2 text-sm">
                          <div className="font-medium text-gray-700 mb-1">Delivery results:</div>
                          <ul className="list-disc pl-5 space-y-0.5 text-gray-700">
                            {Object.entries(lastNotifyResults).map(([k,v]) => (
                              <li key={k} className={v?.success ? 'text-emerald-700' : 'text-red-700'}>
                                {k}: {v?.success ? 'sent' : (v?.error || v?.reason || 'failed')}
                              </li>
                            ))}
                          </ul>
                          <div className="text-xs text-gray-500 mt-1">Note: Email requires EMAIL_USER and EMAIL_PASS in backend env. WhatsApp requires QR pairing.</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price & Notify */}
                  <div className="bg-gray-50/80 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">💰 Price & Notify</h4>
                      <button
                        onClick={() => {
                          if (!priceEditorOpen && selectedOrder) {
                            // Initialize with current values when opening
                            setNewPrice(selectedOrder.price || selectedOrder.totalAmount || '');
                            setNewCurrency(selectedOrder.currency || 'USD');
                          }
                          setPriceEditorOpen(v => !v);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {priceEditorOpen ? 'Hide' : 'Edit price'}
                      </button>
                    </div>
                    {priceEditorOpen && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700">New price</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={newPrice}
                              onChange={(e)=>setNewPrice(e.target.value)}
                              placeholder="e.g. 199.99"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Currency</label>
                            <select
                              value={newCurrency}
                              onChange={(e)=>setNewCurrency(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                              <option value="USD">💵 USD ($)</option>
                              <option value="EGP">🇪🇬 EGP (Egyptian Pound)</option>
                              <option value="SAR">🇸🇦 SAR (Saudi Riyal)</option>
                              <option value="AED">🇦🇪 AED (UAE Dirham)</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Reason (visible to user)</label>
                            <input
                              value={priceReason}
                              onChange={(e)=>setPriceReason(e.target.value)}
                              placeholder="Brief reason for the price change"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Optional custom message</label>
                          <textarea
                            value={priceCustomMessage}
                            onChange={(e)=>setPriceCustomMessage(e.target.value)}
                            placeholder="Extra context to include in notifications (optional)"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Notify via</label>
                          <div className="flex items-center gap-4 px-3 py-2 border border-gray-200 rounded-lg bg-white/70">
                            {['userpage','email','whatsapp'].map(ch => (
                              <label key={ch} className="inline-flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={!!priceNotifyChannels[ch]}
                                  onChange={(e)=> setPriceNotifyChannels(prev=>({ ...prev, [ch]: e.target.checked }))}
                                />
                                <span className="capitalize">{ch}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={updatePriceAndNotify}
                          disabled={updatingPriceAndNotify || !newPrice || !priceReason.trim()}
                          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingPriceAndNotify ? 'Updating price…' : 'Save price and notify'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceOrders;
