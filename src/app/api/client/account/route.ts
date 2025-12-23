import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createDirectus, rest, readItems, authentication } from '@directus/sdk';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.accessToken || !session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
      .with(authentication('json'))
      .with(rest());

    await directus.setToken(session.accessToken);

    // Obtener cuenta del usuario
    const accountMembers = await directus.request(
      readItems('account_members', {
        filter: {
          user: { _eq: session.user.id },
        },
        fields: ['account.id', 'account.name'],
        limit: 1,
      })
    );

    if (!accountMembers || accountMembers.length === 0) {
      return NextResponse.json(
        { error: 'No se encontró cuenta asociada' },
        { status: 404 }
      );
    }

    return NextResponse.json(accountMembers[0].account);
  } catch (error) {
    console.error('Error fetching client account:', error);
    return NextResponse.json(
      { error: 'Error al obtener la cuenta' },
      { status: 500 }
    );
  }
}