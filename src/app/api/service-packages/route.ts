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

    const packages = await directusServer.request(
      readItems('service_packages', {
        filter: {
          is_active: { _eq: true },
        },
        fields: [
          'id',
          'name',
          'code',
          {
            service: ['name'],
          },
        ],
        sort: ['name'],
      })
    );

    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error fetching service packages:', error);
    return NextResponse.json(
      { error: 'Error al obtener paquetes de servicios' },
      { status: 500 }
    );
  }
}