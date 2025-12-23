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

    const statuses = await directusServer.request(
      readItems('statuses', {
        filter,
        sort: ['sort', 'label'],
      })
    );

    return NextResponse.json(statuses);
  } catch (error) {
    console.error('Error fetching statuses:', error);
    return NextResponse.json(
      { error: 'Error al obtener estados' },
      { status: 500 }
    );
  }
}