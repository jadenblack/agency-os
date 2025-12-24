import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { readItems } from '@directus/sdk';
import { directusServer } from '@/lib/directus';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener cuenta del usuario
    const accountMembers = await directusServer.request(
      readItems('account_members', {
        filter: {
          user: { _eq: session.user.id },
        },
        fields: ['id', { account: ['id', 'name'] }],
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