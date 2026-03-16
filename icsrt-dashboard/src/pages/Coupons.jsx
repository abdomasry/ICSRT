import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';
import { useLocation, useNavigate } from 'react-router-dom';

const Coupons = () => {
  const { hasPermission } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();
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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Sync state from URL (no eslint disable needed)
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const qsPage = parseInt(sp.get('page') || '1', 10);
    const qsLimit = parseInt(sp.get('limit') || '20', 10);
    const qsSearch = sp.get('search') || '';
    if (Number.isFinite(qsPage) && qsPage !== page) setPage(qsPage);
    if (Number.isFinite(qsLimit) && qsLimit !== limit) setLimit(qsLimit);
    if (qsSearch !== search) setSearch(qsSearch);
  }, [location.search]);

  const load = async (p = page, l = limit, q = search) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', String(l));
      if (q) params.set('search', q);
      const res = await api.getJson(`/api/admin/coupons?${params.toString()}`);
      setCoupons(res?.coupons || []);
      const pg = res?.pagination || {};
      setTotal(parseInt(pg.total || (res?.coupons?.length ?? 0)));
    } catch (e) {
      setError(e.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (canView) load(page, limit, search); }, [canView, page, limit, search]);

  // Sync URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (search) params.set('search', search);
    navigate({ search: params.toString() }, { replace: true });
  }, [page, limit, search, navigate]);

  const save = async () => {
    if (!form.code || !form.discountType || !form.discountValue) return;
  if (!(canCreate || canEdit)) { toast.warning('You do not have permission to save coupons.'); return; }
    try {
      setSaving(true);
      const body = { ...form };
      if (!body.expiresAt) delete body.expiresAt;
      if (body.minimumAmount === '') delete body.minimumAmount;
      body.discountValue = Number(body.discountValue);
      if (body.minimumAmount) body.minimumAmount = Number(body.minimumAmount);
      const res = await api.post('/api/admin/coupons', body);
      if (res?.success) {
  await load(1, limit, search);
        setForm({ code: '', discountType: 'percentage', discountValue: '', minimumAmount: '', expiresAt: '', isActive: true, description: '' });
        toast.success('Coupon saved');
      } else {
        toast.error('Failed to save coupon: ' + (res?.error || 'Unknown error'));
      }
    } catch (e) {
      toast.error(e.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (code) => {
    const ok = await confirm({ title: 'Deactivate this coupon?', message: `Coupon code: ${code}`, confirmText: 'Deactivate' });
    if (!ok) return;
    if (!canDelete && !canEdit) { toast.warning('You do not have permission to deactivate coupons.'); return; }
    try {
      await api.post(`/api/admin/coupons/${code}/deactivate`, {});
      await load(page, limit, search);
      toast.success('Coupon deactivated');
    } catch (e) {
      toast.error('Failed to deactivate');
    }
  };

  const reactivate = async (code) => {
    const ok = await confirm({ title: 'Reactivate this coupon?', message: `Coupon code: ${code}`, confirmText: 'Reactivate' });
    if (!ok) return;
    if (!canEdit) { toast.warning('You do not have permission to reactivate coupons.'); return; }
    try {
      await api.post(`/api/admin/coupons/${code}/reactivate`, {});
      await load(page, limit, search);
      toast.success('Coupon reactivated');
    } catch (e) {
      toast.error('Failed to reactivate');
    }
  };

  const removeCoupon = async (code) => {
    const ok = await confirm({ title: 'Delete coupon?', message: `Coupon code: ${code}\nThis cannot be undone.`, confirmText: 'Delete' });
    if (!ok) return;
    if (!canDelete) { toast.warning('You do not have permission to delete coupons.'); return; }
    try {
      await api.delJson(`/api/admin/coupons/${code}`);
      // If we deleted the last item on the page, move back a page if possible
      const nextCount = coupons.length - 1;
      if (nextCount <= 0 && page > 1) {
        setPage(page - 1);
      } else {
        await load(page, limit, search);
      }
      toast.success('Coupon deleted');
    } catch (e) {
      toast.error(e.message || 'Failed to delete');
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
          <input className="border rounded p-2" placeholder="Expiry Date (optional)" type="date" value={form.expiresAt} onChange={(e)=>setForm(f=>({...f, expiresAt:e.target.value}))} />
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold">Existing Coupons</h2>
          <div className="flex items-center gap-2">
            <input value={search} onChange={(e)=>{ setPage(1); setSearch(e.target.value); }} placeholder="Search code/description" className="border rounded px-3 py-2" />
            <select value={String(limit)} onChange={(e)=>{ setPage(1); setLimit(parseInt(e.target.value, 10)); }} className="border rounded px-3 py-2">
              {[10,20,50,100].map(n => (<option key={n} value={n}>{n}/page</option>))}
            </select>
          </div>
        </div>
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
                  {!c.isActive && canEdit && (
                    <button onClick={()=>reactivate(c.code)} className="px-3 py-1 bg-green-600 text-white rounded">Reactivate</button>
                  )}
                  {canDelete && (
                    <button onClick={()=>removeCoupon(c.code)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="pt-4">
          <Pagination
            page={page}
            pageSize={limit}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(n)=>{ setPage(1); setLimit(n); }}
          />
        </div>
      </div>
    </div>
  );
};

export default Coupons;
