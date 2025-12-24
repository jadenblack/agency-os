'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { useSessionMonitor } from '@/hooks/use-session-monitor';

function SessionMonitor({ children }: { children: React.ReactNode }) {
  useSessionMonitor();
  return <>{children}</>;
}

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <SessionMonitor>
        {children}
      </SessionMonitor>
    </NextAuthSessionProvider>
  );
}