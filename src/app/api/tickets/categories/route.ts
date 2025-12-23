import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { directusServer } from '@/lib/directus';
import { readItems } from '@directus/sdk';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const categories = await directusServer.request(
      readItems('ticket_categories', {
        filter: {
          is_active: { _eq: true },
        },
        sort: ['sort', 'label'],
      })
    );

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching ticket categories:', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}