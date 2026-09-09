import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import '../index.css';
import ClientProviders from '../components/ClientProviders';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ICSRT Admin Dashboard',
  description: 'Management portal for ICSRT conferences, publications, services, and users.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ClientProviders>
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </ClientProviders>
      </body>
    </html>
  );
}
