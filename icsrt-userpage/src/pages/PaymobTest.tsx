import React, { useState } from 'react';
import { api } from '../lib/api';

export default function PaymobTest() {
  const [email, setEmail] = useState('test@example.com');
  const [amount, setAmount] = useState<any>(10);
  const [phone, setPhone] = useState('');
  const [iframeUrl, setIframeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startTestPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIframeUrl('');
    try {
      const res = await api.post('/api/payments/test-initiate', {
        amount: Number(amount),
        currency: 'EGP',
        billingInfo: {
          email,
          fullName: 'ICSRT Test User',
          phone
        }
      });
      if (res?.iframeUrl) setIframeUrl(res.iframeUrl);
      else setError(res?.error || 'Did not receive iframe URL');
    } catch (err) {
      setError(err?.message || 'Failed to initiate test payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Paymob Test Payment</h1>
      <p className="text-gray-600 mb-6">Use this page to run a sandbox test payment via Paymob iframe.</p>

      <form onSubmit={startTestPayment} className="space-y-4 bg-white p-4 rounded shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Amount (EGP)</label>
          <input type="number" min="1" className="border p-2 rounded w-full" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" className="border p-2 rounded w-full" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone (optional)</label>
          <input type="tel" className="border p-2 rounded w-full" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? 'Starting…' : 'Start Test Payment'}
        </button>
      </form>

      {error ? (
        <div className="mt-4 p-3 rounded bg-red-50 text-red-700 text-sm">{String(error)}</div>
      ) : null}

      {iframeUrl ? (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Payment</h2>
          <iframe title="Paymob Payment" src={iframeUrl} className="w-full h-[720px] border rounded" allow="payment" />
        </div>
      ) : null}
    </div>
  );
}
