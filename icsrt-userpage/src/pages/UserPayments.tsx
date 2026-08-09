import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';

export default function UserPayments() {
  const { user, isLoggedIn } = useUser();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const badge = (status) => {
    const s = String(status || 'pending').toLowerCase();
    const map = {
      completed: 'bg-emerald-100 text-emerald-700',
      paid: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
    };
    const cls = map[s] || 'bg-gray-100 text-gray-700';
    const label = t(`payments.status.${s}`) || s.replaceAll('-', ' ');
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label}</span>;
  };

  const fetchPayments = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/api/user/payments?userEmail=${encodeURIComponent(user.email)}&limit=200`);
      const arr = res?.payments || (Array.isArray(res) ? res : []);
      setPayments(arr);
    } catch (e) {
      setError(e.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white shadow rounded-xl p-8 border border-gray-100 text-center max-w-md">
          <div className="text-4xl mb-3">🔒</div>
          <div className="text-lg font-semibold mb-2">{t('payments.loginRequired')}</div>
          <a href="/login" className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg">{t('payments.loginButton')}</a>
        </div>
      </div>
    );
  }

  const total = payments.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const current = payments.slice(start, start + pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white/80 rounded-xl border border-white/20 shadow-xl p-6 md:p-8 mb-6">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">💳 {t('payments.title')}</h1>
        <p className="text-gray-600 mt-2">{t('payments.subtitle')}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-white/80 rounded-xl border border-red-200 text-red-700 p-6 shadow">
          {error}
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white/80 rounded-xl border border-white/20 shadow p-8 text-center">
          <div className="text-5xl mb-3">🧾</div>
          <div className="text-gray-700 font-medium">{t('payments.noPayments')}</div>
        </div>
      ) : (
        <div className="bg-white/80 rounded-xl border border-white/20 shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className={`${isRTL ? 'text-right' : 'text-left'} text-gray-600`}>
                  <th className="px-4 py-3">{t('payments.table.date')}</th>
                  <th className="px-4 py-3">{t('payments.table.order')}</th>
                  <th className="px-4 py-3">{t('payments.table.service')}</th>
                  <th className="px-4 py-3">{t('payments.table.amount')}</th>
                  <th className="px-4 py-3">{t('payments.table.status')}</th>
                  <th className="px-4 py-3">{t('payments.table.method')}</th>
                </tr>
              </thead>
              <tbody>
                {current.map((p) => (
                  <tr key={p._id || p.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{new Date(p.createdAt || p.updatedAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-700">{p.orderNumber || (p.order?._id || '').toString().slice(-6)}</td>
                    <td className="px-4 py-3 text-gray-700">{p.order?.serviceName || 'Service Order'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{p.amount} {p.currency || 'EGP'}</td>
                    <td className="px-4 py-3">{badge(p.paymentStatus)}</td>
                    <td className="px-4 py-3 text-gray-700">{(p.paymentMethod || 'paymob').toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">{t('payments.pagination.showing')} {start + 1}-{Math.min(start + pageSize, total)} {t('payments.pagination.of')} {total}</div>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1.5 rounded bg-gray-100 disabled:opacity-50">{t('payments.pagination.prev')}</button>
              <span className="text-sm text-gray-700">{t('payments.pagination.page')} {page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1.5 rounded bg-gray-100 disabled:opacity-50">{t('payments.pagination.next')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
