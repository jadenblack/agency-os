import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const session = await auth();

  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/login', '/api/auth'];
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));

  // Si es ruta pública, permitir acceso
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Si no hay sesión, redirigir a login
  if (!session) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Si hay error de refresh token expirado, forzar logout
  if (session.error === 'RefreshTokenExpired' || session.error === 'RefreshAccessTokenError') {
    const url = new URL('/login', request.url);
    url.searchParams.set('error', 'SessionExpired');
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);

    const response = NextResponse.redirect(url);

    // Limpiar cookies de sesión - TODAS las variantes
    response.cookies.set('next-auth.session-token', '', { maxAge: 0 });
    response.cookies.set('__Secure-next-auth.session-token', '', { maxAge: 0 });
    response.cookies.set('next-auth.csrf-token', '', { maxAge: 0 });
    response.cookies.set('__Host-next-auth.csrf-token', '', { maxAge: 0 });

    return response;
  }

  // Redirección basada en rol
  const pathname = request.nextUrl.pathname;
  const userRole = session.user?.role;

  // Si es cliente intentando acceder a dashboard, redirigir a portal
  if (pathname.startsWith('/dashboard') && userRole === 'Cliente') {
    return NextResponse.redirect(new URL('/portal', request.url));
  }

  // Si es empleado/admin intentando acceder a portal, redirigir a dashboard
  if (pathname.startsWith('/portal') && userRole !== 'Cliente') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/portal/:path*',
    '/',
  ],
};