import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createItem } from '@directus/sdk';
import { directusServer } from '@/lib/directus';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { ticket, body: messageBody, is_internal, source } = body;

    if (!ticket || !messageBody) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Crear mensaje
    const message = await directusServer.request(
      createItem('tickets_messages', {
        ticket,
        body: messageBody,
        is_internal: is_internal || false,
        source: source || 'portal',
        author: session.user.id,
      })
    );

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating ticket message:', error);
    return NextResponse.json(
      { error: 'Error al crear el mensaje' },
      { status: 500 }
    );
  }
}