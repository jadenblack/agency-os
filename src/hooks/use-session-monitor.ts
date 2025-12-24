'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function useSessionMonitor() {
  const { data: session, status } = useSession();
  const hasLoggedOut = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/login' || hasLoggedOut.current) {
      return;
    }

    if (
      status === 'authenticated' &&
      (session?.error === 'RefreshTokenExpired' || 
       session?.error === 'RefreshAccessTokenError')
    ) {
      console.warn('Sesión expirada, haciendo logout...');
      hasLoggedOut.current = true;
      
      signOut({ 
        redirect: false,
      }).then(() => {
        window.location.href = '/login?error=SessionExpired';
      });
    }
  }, [session, status, pathname]);

  return { session, status };
}