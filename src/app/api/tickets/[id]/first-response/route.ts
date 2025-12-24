import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { directusServer } from '@/lib/directus';
import { updateItem } from '@directus/sdk';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // Actualizar first_response_at si aún no está establecido
    const ticket = await directusServer.request(
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