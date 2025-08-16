import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, title: '', message: '', confirmText: 'Confirm', cancelText: 'Cancel' });
  const [resolver, setResolver] = useState(null);

  const confirm = useCallback(({ title, message, confirmText = 'Confirm', cancelText = 'Cancel' } = {}) => {
    return new Promise((resolve) => {
      setResolver(() => resolve);
      setState({ open: true, title: title || 'Please confirm', message: message || '', confirmText, cancelText });
    });
  }, []);

  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolver) resolver(true);
    setResolver(null);
    close();
  }, [resolver, close]);

  const handleCancel = useCallback(() => {
    if (resolver) resolver(false);
    setResolver(null);
    close();
  }, [resolver, close]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {state.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
            {state.title ? (
              <div className="px-5 pt-5 pb-2 text-lg font-semibold text-gray-800">{state.title}</div>
            ) : null}
            {state.message ? (
              <div className="px-5 pb-4 text-gray-700 whitespace-pre-line">{state.message}</div>
            ) : null}
            <div className="px-5 py-4 flex gap-3 justify-end border-t">
              <button onClick={handleCancel} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">{state.cancelText}</button>
              <button onClick={handleConfirm} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">{state.confirmText}</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}
