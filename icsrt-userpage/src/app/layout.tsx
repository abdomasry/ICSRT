import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import '../index.css';
import ClientProviders from '../components/ClientProviders';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ICSRT - International Conference on Science, Research & Technology',
  description: 'Official Web Portal for ICSRT Conferences, Academic Publishing, and Services.',
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
