import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Coupons = () => {
  const { hasPermission } = useAuth();
  const { hasPermission: checkPerm } = useAuth();
  const canView = checkPerm('coupons', 'view');
  const canCreate = checkPerm('coupons', 'create');
  const canEdit = checkPerm('coupons', 'edit');
  const canDelete = checkPerm('coupons', 'delete');

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ code: '', discountType: 'percentage', discountValue: '', minimumAmount: '', expiresAt: '', isActive: true, description: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/admin/coupons');
      setCoupons(res?.coupons || []);
    } catch (e) {
      setError(e.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (canView) load(); }, [canView]);

  const save = async () => {
    if (!form.code || !form.discountType || !form.discountValue) return;
    if (!(canCreate || canEdit)) { alert('You do not have permission to save coupons.'); return; }
    try {
      setSaving(true);
      const body = { ...form };
      if (!body.expiresAt) delete body.expiresAt;
      if (body.minimumAmount === '') delete body.minimumAmount;
      body.discountValue = Number(body.discountValue);
      if (body.minimumAmount) body.minimumAmount = Number(body.minimumAmount);
      const res = await api.post('/api/admin/coupons', body);
      if (res?.success) {
        await load();
        setForm({ code: '', discountType: 'percentage', discountValue: '', minimumAmount: '', expiresAt: '', isActive: true, description: '' });
        alert('Coupon saved');
      } else {
        alert('Failed to save coupon: ' + (res?.error || 'Unknown error'));
      }
    } catch (e) {
      alert(e.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (code) => {
    if (!window.confirm('Deactivate this coupon?')) return;
    if (!canDelete && !canEdit) { alert('You do not have permission to deactivate coupons.'); return; }
    try {
      await api.post(`/api/admin/coupons/${code}/deactivate`, {});
      await load();
    } catch (e) {
      alert('Failed to deactivate');
    }
  };

  // Route-level guard for Coupons permissions
  if (!hasPermission('coupons', 'view')) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          403 – You don't have permission to view Coupons.
        </div>
      </div>
    );
  }

  if (!canView) return <div className="p-6 text-gray-600">You do not have permission to view coupons.</div>;
  if (loading) return <div className="p-6">Loading coupons…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🎟️ Coupons</h1>

  {(canCreate || canEdit) && (
  <div className="bg-white rounded-xl border p-4 mb-8">
        <h2 className="text-lg font-semibold mb-3">Create / Update Coupon</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border rounded p-2" placeholder="CODE" value={form.code} onChange={(e)=>setForm(f=>({...f, code:e.target.value.toUpperCase()}))} />
          <select className="border rounded p-2" value={form.discountType} onChange={(e)=>setForm(f=>({...f, discountType:e.target.value}))}>
            <option value="percentage">Percentage %</option>
            <option value="fixed">Fixed amount</option>
          </select>
          <input className="border rounded p-2" placeholder={form.discountType==='percentage'? '% value' : 'amount'} type="number" value={form.discountValue} onChange={(e)=>setForm(f=>({...f, discountValue:e.target.value}))} />
          <input className="border rounded p-2" placeholder="Minimum amount (optional)" type="number" value={form.minimumAmount} onChange={(e)=>setForm(f=>({...f, minimumAmount:e.target.value}))} />
          <input className="border rounded p-2" placeholder="Expiry (YYYY-MM-DD) optional" value={form.expiresAt} onChange={(e)=>setForm(f=>({...f, expiresAt:e.target.value}))} />
          <label className="inline-flex items-center gap-2 p-2">
            <input type="checkbox" checked={form.isActive} onChange={(e)=>setForm(f=>({...f, isActive:e.target.checked}))} /> Active
          </label>
          <input className="md:col-span-3 border rounded p-2" placeholder="Description (optional)" value={form.description} onChange={(e)=>setForm(f=>({...f, description:e.target.value}))} />
        </div>
        <div className="mt-3">
          <button onClick={save} disabled={saving || !form.code || !form.discountValue} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{saving? 'Saving…':'Save Coupon'}</button>
        </div>
  </div>
  )}

      <div className="bg-white rounded-xl border p-4">
        <h2 className="text-lg font-semibold mb-3">Existing Coupons</h2>
        {coupons.length === 0 ? (
          <div className="text-gray-500">No coupons yet</div>
        ) : (
          <div className="space-y-2">
            {coupons.map(c => (
              <div key={c._id || c.code} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-mono font-semibold">{c.code}</div>
                  <div className="text-sm text-gray-600">{c.discountType} {c.discountValue}{c.discountType==='percentage' ? '%' : ''} • min {c.minimumAmount || 0}</div>
                  {c.expiresAt && (
                    <div className="text-xs text-gray-500">Expires: {new Date(c.expiresAt).toLocaleDateString()}</div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${c.isActive ? 'text-green-700' : 'text-gray-500'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                  {c.isActive && (canDelete || canEdit) && (
                    <button onClick={()=>deactivate(c.code)} className="px-3 py-1 bg-gray-200 rounded">Deactivate</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupons;
