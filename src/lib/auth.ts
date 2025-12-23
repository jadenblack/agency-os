import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { createDirectus, rest, authentication } from '@directus/sdk';
import { jwtDecode } from 'jwt-decode';
import { directusServer } from '@/lib/directus';
import { readRoles, readUsers } from '@directus/sdk';

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

interface DirectusJWT {
  id: string;
  role: string;
  app_access: boolean;
  admin_access: boolean;
  iat: number;
  exp: number;
  iss: string;
}

async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(`${directusUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.data.access_token,
      refreshToken: refreshedTokens.data.refresh_token ?? token.refreshToken,
      accessTokenExpires: Date.now() + 15 * 60 * 1000,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Crear cliente Directus
          const directus = createDirectus(directusUrl)
            .with(authentication('json'))
            .with(rest());

          // Login
          const loginResult = await directus.login({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          const accessToken = loginResult.access_token;
          const refreshToken = loginResult.refresh_token;

          if (!accessToken || !refreshToken) {
            console.error('No tokens received');
            return null;
          }

          // Decodificar el JWT para obtener el roleId y userId
          const decodedToken = jwtDecode<DirectusJWT>(accessToken);
          console.log('Decoded JWT:', decodedToken); // DEBUG

          // Usar directusServer (token admin) para obtener el nombre del rol
          const roles = await directusServer.request(
            readRoles({
              filter: {
                id: { _eq: decodedToken.role },
              },
              fields: ['id', 'name'],
              limit: 1,
            })
          );

          const roleName = roles && roles.length > 0 ? roles[0].name : null;
          console.log('Role name from directus_roles:', roleName); // DEBUG

          // Usar directusServer para obtener datos del usuario
          const users = await directusServer.request(
            readUsers({
              filter: {
                id: { _eq: decodedToken.id },
              },
              fields: ['email', 'first_name', 'last_name', 'avatar'],
              limit: 1,
            })
          );

          const user = users && users.length > 0 ? users[0] : null;
          console.log('User data from directus_users:', user); // DEBUG

          return {
            id: decodedToken.id,
            email: user?.email || credentials.email as string,
            name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : undefined,
            image: user?.avatar ? `${directusUrl}/assets/${user.avatar}` : null,
            role: roleName,
            accessToken: accessToken,
            refreshToken: refreshToken,
            accessTokenExpires: Date.now() + 15 * 60 * 1000,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('JWT callback - user:', user); // DEBUG
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = user.accessTokenExpires;
        token.role = user.role;
        token.id = user.id;
        return token;
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
        session.error = token.error as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
});