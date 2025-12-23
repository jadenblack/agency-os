import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    error?: string;
    user: {
      id: string;
      email: string;
      name?: string | null;  // ← Acepta null
      image?: string | null; // ← Acepta null
      role?: string | null;  // ← Acepta null
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;      // ← Acepta null
    image?: string | null;     // ← Acepta null
    role?: string | null;      // ← Acepta null
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    role?: string | null;      // ← Acepta null
    id: string;
    error?: string;
  }
}