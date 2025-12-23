import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createDirectus, rest, readItems, createItem, authentication } from '@directus/sdk';

export async function GET(request: NextRequest) {
  // ... código existente del GET ...
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.accessToken || !session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      subject,
      description,
      account,
      category,
      package: pkg,
      assigned_to,
      status,
      priority,
      channel,
      requester_contact,
    } = body;

    if (!subject || !description) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Crear cliente con el token del usuario
    const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
      .with(authentication('json'))
      .with(rest());

    await directus.setToken(session.accessToken);

    // Obtener el estado "open" por defecto si no se proporciona
    let defaultStatusId = status;
    if (!defaultStatusId) {
      const openStatus = await directus.request(
        readItems('statuses', {
          filter: {
            _and: [
              { scope: { _eq: 'ticket' } },
              { key: { _eq: 'open' } },
            ],
          },
          limit: 1,
        })
      );
      defaultStatusId = openStatus?.[0]?.id;
    }

    // Obtener la prioridad "medium" por defecto si no se proporciona
    let defaultPriorityId = priority;
    if (!defaultPriorityId) {
      const mediumPriority = await directus.request(
        readItems('priorities', {
          filter: {
            _and: [
              { scope: { _eq: 'ticket' } },
              { key: { _eq: 'medium' } },
            ],
          },
          limit: 1,
        })
      );
      defaultPriorityId = mediumPriority?.[0]?.id;
    }

    // Crear ticket con valores por defecto
    const ticketData: any = {
      subject,
      description,
      channel: channel || 'portal',
      status: defaultStatusId,
      priority: defaultPriorityId,
    };

    // Añadir campos opcionales solo si tienen valor
    if (account) ticketData.account = account;
    if (category) ticketData.category = category;
    if (pkg) ticketData.package = pkg;
    if (assigned_to) ticketData.assigned_to = assigned_to;
    if (requester_contact) ticketData.requester_contact = requester_contact;

    const ticket = await directus.request(
      createItem('tickets', ticketData)
    );

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Error al crear el ticket' },
      { status: 500 }
    );
  }
}