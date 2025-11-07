'use client';

import { AuthProvider } from '@/lib/auth-context';
import Script from 'next/script';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      {children}
    </AuthProvider>
  );
}
