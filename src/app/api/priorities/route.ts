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

    const searchParams = request.nextUrl.searchParams;
    const scope = searchParams.get('scope');

    const filter: any = {
      is_active: { _eq: true },
    };

    if (scope) {
      filter.scope = { _eq: scope };
    }

    const priorities = await directusServer.request(
      readItems('priorities', {
        filter,
        sort: ['sort', 'label'],
      })
    );

    return NextResponse.json(priorities);
  } catch (error) {
    console.error('Error fetching priorities:', error);
    return NextResponse.json(
      { error: 'Error al obtener prioridades' },
      { status: 500 }
    );
  }
}