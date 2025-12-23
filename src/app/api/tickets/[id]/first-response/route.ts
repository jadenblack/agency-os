import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createDirectus, rest, updateItem, authentication } from '@directus/sdk';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
      .with(authentication('json'))
      .with(rest());

    await directus.setToken(session.accessToken);

    // Actualizar first_response_at si aún no está establecido
    const ticket = await directus.request(
      updateItem('tickets', id, {
        first_response_at: new Date().toISOString(),
      })
    );

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error updating first response:', error);
    return NextResponse.json(
      { error: 'Error al actualizar primera respuesta' },
      { status: 500 }
    );
  }
}