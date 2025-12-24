'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function SessionExpiredAlert() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const callbackUrl = searchParams.get('callbackUrl');

    if (errorParam === 'SessionExpired') {
      setMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      const newUrl = callbackUrl ? `/login?callbackUrl=${callbackUrl}` : '/login';
      router.replace(newUrl);
    }
  }, [searchParams, router]);

  if (!message) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}