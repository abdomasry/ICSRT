'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const statusColors = {
  submitted: 'bg-gray-100 text-gray-800',
  review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function Collaborations() {
  const toast = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState({ submitted: 0, review: 0, approved: 0, rejected: 0 });
  const location = useLocation();
  const navigate = useNavigate();

  // derive query params
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    const qsStatus = query.get('status');
    const qsPage = parseInt(query.get('page') || '1', 10);
    const qsLimit = parseInt(query.get('limit') || '20', 10);
    if (qsStatus && ['all','submitted','review','approved','rejected'].includes(qsStatus) && qsStatus !== status) {
      setStatus(qsStatus);
    }
    if (Number.isFinite(qsPage) && qsPage !== page) setPage(qsPage);
    if (Number.isFinite(qsLimit) && qsLimit !== limit) setLimit(qsLimit);
  }, [query]);

  const load = async (p = page, s = status, q = search, l = limit) => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', String(l));
      params.set('sortBy', 'createdAt');
      params.set('sortOrder', 'desc');
      if (q) params.set('search', q);
      if (s && s !== 'all') params.set('status', s);
      const res = await api.getJson(`/api/collaborations?${params.toString()}`);
      const rows = Array.isArray(res?.data) ? res.data : [];
      setItems(rows);
      const pg = res?.pagination || {};
      setTotal(parseInt(pg.total || rows.length || 0));
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(page, status, search, limit); }, [page, status, search, limit]);

  const refresh = () => load(1, status, search, limit);

  // sync URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('status', status);
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (search) params.set('search', search);
    navigate({ search: params.toString() }, { replace: true });
  }, [status, page, limit, search]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Fetch global counts for cards
  useEffect(() => {
    (async () => {
      try {
        const s = await api.get('/api/dashboard-stats');
        if (s) {
          setStatusCounts({
            submitted: parseInt(s.collaborationsSubmitted || 0),
            review: parseInt(s.collaborationsReview || 0),
            approved: parseInt(s.collaborationsApproved || 0),
            rejected: parseInt(s.collaborationsRejected || 0),
          });
          if (!total && s.totalCollaborations != null) {
            setTotal(parseInt(s.totalCollaborations));
          }
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const updateStatus = async (item, newStatus) => {
    setUpdating(true);
    try {
      await api.putJson(`/api/collaborations/${item._id}`, { status: newStatus });
      setSelected(null);
      await refresh();
  toast.success(`Submission marked as ${newStatus}`);
    } catch (e) {
  toast.error(e.message || 'Update failed');
    } finally { setUpdating(false); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Collaborations</h1>
        <div className="flex gap-2">
          <input value={search} onChange={e=>{ setPage(1); setSearch(e.target.value); }} placeholder="Search title/email" className="border rounded px-3 py-2" />
          <select value={status} onChange={e=>{ setPage(1); setStatus(e.target.value); }} className="border rounded px-3 py-2">
            <option value="all">All</option>
            <option value="submitted">Submitted</option>
            <option value="review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={String(limit)} onChange={(e)=>{ setPage(1); setLimit(parseInt(e.target.value, 10)); }} className="border rounded px-3 py-2">
            {[10,20,50,100].map(n => (<option key={n} value={n}>{n}/page</option>))}
          </select>
          <button onClick={refresh} className="px-4 py-2 bg-blue-600 text-white rounded">Refresh</button>
        </div>
      </div>

      {/* Global Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {[
          { key: 'all', label: 'Total', color: 'from-gray-100 to-gray-50', value: total },
          { key: 'submitted', label: 'Submitted', color: 'from-blue-100 to-blue-50' },
          { key: 'review', label: 'In Review', color: 'from-cyan-100 to-cyan-50' },
          { key: 'approved', label: 'Approved', color: 'from-green-100 to-green-50' },
          { key: 'rejected', label: 'Rejected', color: 'from-red-100 to-red-50' }
        ].map(card => (
          <div
            key={card.key}
            role="button"
            tabIndex={0}
            onClick={() => { setStatus(card.key); setPage(1); }}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setStatus(card.key)}
            className={`bg-gradient-to-br ${card.color} rounded-xl border ${status===card.key ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'} shadow p-4 text-center cursor-pointer`}
          >
            <div className="text-xs text-gray-600">{card.label}</div>
            <div className="text-2xl font-semibold text-gray-800">
              {card.key === 'all' ? total : (statusCounts[card.key] ?? '—')}
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Author</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((it) => (
                <tr key={it._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className="font-medium">{it.title || '—'}</div>
                    <div className="text-sm text-gray-500 max-w-md truncate">{it.summary}</div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="font-medium">{it.userEmail || '—'}</div>
                    <div className="text-xs text-gray-500">{it.userId}</div>
                  </td>
                  <td className="px-4 py-2 capitalize">{it.category || 'idea'}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs px-2 py-1 rounded ${statusColors[(it.status || 'submitted')] || statusColors.submitted}`}>{(it.status || 'submitted').replace('-', ' ')}</span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">{new Date(it.createdAt || it.updatedAt || Date.now()).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <button onClick={()=>setSelected(it)} className="text-blue-600 hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Page {page} of {totalPages} • {total} total</div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-2 rounded border bg-white disabled:opacity-50"
          >Prev</button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-2 rounded border bg-white disabled:opacity-50"
          >Next</button>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">Submission Details</h2>
              <button onClick={()=>setSelected(null)} className="text-gray-500 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <div className="text-sm text-gray-500">Title</div>
                <div className="font-medium">{selected.title || '—'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Author</div>
                <div className="font-medium">{selected.userEmail || '—'}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">First Name</div>
                  <div className="font-medium">{selected.firstName || '—'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Last Name</div>
                  <div className="font-medium">{selected.lastName || '—'}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-medium">{selected.contact?.phone || selected.phone || '—'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Social</div>
                  <div className="text-sm text-gray-600">
                    {selected.social?.facebook && (<div>Facebook: <a className="text-blue-600 hover:underline" href={selected.social.facebook} target="_blank" rel="noreferrer">{selected.social.facebook}</a></div>)}
                    {selected.social?.instagram && (<div>Instagram: <a className="text-blue-600 hover:underline" href={selected.social.instagram} target="_blank" rel="noreferrer">{selected.social.instagram}</a></div>)}
                    {selected.social?.linkedin && (<div>LinkedIn: <a className="text-blue-600 hover:underline" href={selected.social.linkedin} target="_blank" rel="noreferrer">{selected.social.linkedin}</a></div>)}
                    {!(selected.social?.facebook||selected.social?.instagram||selected.social?.linkedin) && '—'}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Type</div>
                <div className="font-medium capitalize">{selected.category || 'idea'}</div>
              </div>
              {selected.link && (
                <div>
                  <div className="text-sm text-gray-500">Link</div>
                  <a href={selected.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{selected.link}</a>
                </div>
              )}
              {selected.attachment?.url && (
                <div>
                  <div className="text-sm text-gray-500">Attachment</div>
                  <a href={selected.attachment.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{selected.attachment.filename || 'Open file'}</a>
                  <div className="text-xs text-gray-500">{selected.attachment.mimetype} · {Math.round((selected.attachment.size||0)/1024)} KB</div>
                </div>
              )}
              {selected.cv?.url && (
                <div>
                  <div className="text-sm text-gray-500">CV</div>
                  <a href={selected.cv.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{selected.cv.filename || 'Open CV'}</a>
                  <div className="text-xs text-gray-500">{selected.cv.mimetype} · {Math.round((selected.cv.size||0)/1024)} KB</div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-500">Summary</div>
                <div className="whitespace-pre-wrap">{selected.summary || '—'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div>
                  <span className={`text-xs px-2 py-1 rounded ${statusColors[(selected.status || 'submitted')] || statusColors.submitted}`}>{(selected.status || 'submitted').replace('-', ' ')}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex items-center justify-end gap-2">
              <button disabled={updating} onClick={()=>updateStatus(selected, 'review')} className="px-3 py-2 bg-blue-100 text-blue-800 rounded">Mark In Review</button>
              <button disabled={updating} onClick={()=>updateStatus(selected, 'approved')} className="px-3 py-2 bg-green-600 text-white rounded">Approve</button>
              <button disabled={updating} onClick={()=>updateStatus(selected, 'rejected')} className="px-3 py-2 bg-red-600 text-white rounded">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
