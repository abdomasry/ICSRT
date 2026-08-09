'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaShieldAlt, FaCreditCard, FaLock, FaSpinner, FaCheckCircle, 
  FaExclamationTriangle, FaClock, FaFileAlt, FaUser
} from 'react-icons/fa';
import { api } from "../lib/api";

const PurchasePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchaseData, setPurchaseData] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Billing form state
  const [billingInfo, setBillingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!purchaseData?.order) return `$${amount}`;
    const currency = purchaseData.order.currency || 'USD';
    const currencySymbols = {
      'USD': '$',
      'EGP': 'EGP ',
      'SAR': 'SAR ',
      'AED': 'AED '
    };
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${amount}`;
  };

  // Use centralized API helper base

  useEffect(() => {
    if (token) {
      // call without adding function to deps to avoid unnecessary re-creates
      fetchPurchaseData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchPurchaseData = async () => {
    try {
      setLoading(true);
      setError('');
      
  const data = await api.get(`/api/purchase-link/${token}`);
      
      if (data.success) {
        setPurchaseData(data);
        // Pre-fill billing info if available
        if (data.order?.customerInfo) {
          setBillingInfo({
            fullName: data.order.customerInfo.name || '',
            email: data.order.customerInfo.email || '',
            phone: data.order.customerInfo.phone || '',
            address: '',
            city: '',
            country: data.order.customerInfo.country || ''
          });
        }
      } else {
        setError(data.error || 'Invalid purchase link');
      }
    } catch (error) {
      console.error('Error fetching purchase data:', error);
      setError('Failed to load purchase information');
    } finally {
      setLoading(false);
    }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim() || !purchaseData) return;
    
    setValidatingCoupon(true);
    try {
      const data = await api.post(`/api/user/coupons/validate`, {
        couponCode: couponCode,
        orderAmount: purchaseData.order.totalAmount
      });
      
      if (data.success && data.valid) {
        setAppliedCoupon(data.coupon);
      } else {
        alert(data.error || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      alert('Failed to validate coupon');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const getFinalAmount = () => {
    if (!purchaseData) return 0;
    const baseAmount = purchaseData.order.totalAmount;
    if (!appliedCoupon) return baseAmount;
    
    if (appliedCoupon.discountType === 'percentage') {
      return baseAmount - (baseAmount * appliedCoupon.discountValue / 100);
    } else {
      return Math.max(0, baseAmount - appliedCoupon.discountValue);
    }
  };

  const processPurchase = async () => {
    if (!purchaseData || processing) return;
    
    setProcessing(true);
    try {
      const data = await api.post(`/api/user/service-orders/${purchaseData.order._id}/purchase`, {
        userEmail: purchaseData.order.customerInfo?.email || billingInfo.email,
        paymentMethod: 'paymob',
        billingInfo: billingInfo,
        couponCode: appliedCoupon?.code,
        // Paymob supports EGP; backend template uses EGP in payment key
        currency: 'EGP',
        purchaseToken: token
      });
      
      if (data?.success) {
        // If Paymob iframe URL is available, redirect the user to complete payment
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
          return;
        }
        // Fallback: show success initiation but no redirect (e.g., sandbox keys not set)
        setSuccess(true);
        // Keep the user on this page; don’t auto-redirect to home so they can retry
      } else {
        alert(data.error || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading purchase information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Purchase Link Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Initiated!</h2>
          <p className="text-gray-600 mb-4">
            Your payment has been successfully initiated. You will be redirected shortly.
          </p>
          <div className="text-sm text-gray-500">
            Redirecting in 3 seconds...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <FaShieldAlt className="text-2xl text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Secure Payment</h1>
          </div>
          
          {/* Expiry Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <FaClock className="text-amber-600" />
              <p className="text-amber-800 text-sm">
                This payment link expires on {formatDate(purchaseData.purchaseLink.expiresAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <FaFileAlt />
            <span>Order Summary</span>
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">{purchaseData.order.serviceName}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Description:</span>
              <span className="font-medium text-right max-w-xs">
                {purchaseData.order.description}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{purchaseData.order.customerInfo?.name}</span>
            </div>
            
            <hr className="my-3" />
            
            <div className="flex justify-between text-lg">
              <span className="text-gray-600">Original Amount:</span>
              <span className="font-semibold">{formatCurrency(purchaseData.order.totalAmount)}</span>
            </div>
            
            {appliedCoupon && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({appliedCoupon.code}):</span>
                <span>-{formatCurrency((purchaseData.order.totalAmount - getFinalAmount()).toFixed(2))}</span>
              </div>
            )}
            
            <hr className="my-3" />
            
            <div className="flex justify-between text-xl font-bold text-green-600">
              <span>Final Amount:</span>
              <span>{formatCurrency(getFinalAmount().toFixed(2))}</span>
            </div>
          </div>
        </div>

        {/* Coupon Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Promo Code</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter promo code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={validateCoupon}
              disabled={validatingCoupon || !couponCode.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition flex items-center space-x-2"
            >
              {validatingCoupon ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <span>Apply</span>
              )}
            </button>
          </div>
          
          {appliedCoupon && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                ✅ Coupon "{appliedCoupon.code}" applied! 
                {appliedCoupon.discountType === 'percentage' 
                  ? ` ${appliedCoupon.discountValue}% discount`
                  : ` ${formatCurrency(appliedCoupon.discountValue)} off`
                }
              </p>
            </div>
          )}
        </div>

        {/* Billing Information */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <FaUser />
            <span>Billing Information</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={billingInfo.fullName}
                onChange={(e) => setBillingInfo({...billingInfo, fullName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={billingInfo.email}
                onChange={(e) => setBillingInfo({...billingInfo, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                value={billingInfo.phone}
                onChange={(e) => setBillingInfo({...billingInfo, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
              <input
                type="text"
                value={billingInfo.country}
                onChange={(e) => setBillingInfo({...billingInfo, country: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={billingInfo.address}
                onChange={(e) => setBillingInfo({...billingInfo, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={billingInfo.city}
                onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FaLock className="text-gray-500" />
            <span className="text-sm text-gray-600">Secure SSL Encrypted Payment</span>
          </div>
          
          <button
            onClick={processPurchase}
            disabled={processing || !billingInfo.fullName || !billingInfo.email || !billingInfo.phone || !billingInfo.country}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold text-lg transition flex items-center justify-center space-x-2"
          >
            {processing ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FaCreditCard />
                <span>Pay ${getFinalAmount().toFixed(2)} Now</span>
              </>
            )}
          </button>
          
          <p className="text-center text-sm text-gray-500 mt-3">
            By clicking "Pay Now", you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;
