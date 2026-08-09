import React from 'react';

// Reusable pagination component
// Props:
// - page (number, 1-based)
// - pageSize (number)
// - total (number)
// - onPageChange(newPage)
// - onPageSizeChange(newSize) optional
// - className optional
export default function Pagination({
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  onPageSizeChange,
  className = ''
}) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const sizes = [10, 20, 50, 100];

  // Build compact page number range (1 ... x-1 x x+1 ... total)
  const pages = [];
  const add = (p) => { if (p >= 1 && p <= totalPages && !pages.includes(p)) pages.push(p); };
  add(1);
  add(2);
  for (let p = page - 1; p <= page + 1; p++) add(p);
  add(totalPages - 1);
  add(totalPages);
  pages.sort((a,b)=>a-b);

  const renderPages = [];
  let prev = 0;
  pages.forEach((p) => {
    if (prev && p - prev > 1) {
      renderPages.push(
        <span key={`gap-${prev}`} className="px-2 text-gray-500">…</span>
      );
    }
    renderPages.push(
      <button
        key={p}
        onClick={() => onPageChange && onPageChange(p)}
        className={`px-3 py-1 rounded-lg font-medium ${p === page ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
      >
        {p}
      </button>
    );
    prev = p;
  });

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
      <div className="text-sm text-gray-700 font-semibold">
        Showing {start} to {end} of {total} items
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => canPrev && onPageChange && onPageChange(page - 1)}
          disabled={!canPrev}
          className="px-3 py-2 bg-gray-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        <div className="hidden md:flex items-center gap-1">
          {renderPages}
        </div>
        <span className="md:hidden px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => canNext && onPageChange && onPageChange(page + 1)}
          disabled={!canNext}
          className="px-3 py-2 bg-gray-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e)=> onPageSizeChange && onPageSizeChange(parseInt(e.target.value))}
            className="ml-2 border border-gray-200 rounded-lg px-2 py-2 bg-white"
          >
            {sizes.map(s => (
              <option key={s} value={s}>{s} / page</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
