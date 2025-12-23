import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createDirectus, rest, createItem, authentication } from '@directus/sdk';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.accessToken || !session?.user?.id) {
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

    const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
      .with(authentication('json'))
      .with(rest());

    await directus.setToken(session.accessToken);

    // Crear mensaje
    const message = await directus.request(
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