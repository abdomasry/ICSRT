'use client';

import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ConfirmProvider } from '../context/ConfirmContext';
import Layout from '../Layout';
import ProtectedRoute from '../ProtectedRoute';
import { usePathname } from 'next/navigation';

interface ClientProvidersProps {
  children: React.ReactNode;
}

function InnerAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <main className="min-h-screen bg-gray-50">{children}</main>;
  }

  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <InnerAppLayout>{children}</InnerAppLayout>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
