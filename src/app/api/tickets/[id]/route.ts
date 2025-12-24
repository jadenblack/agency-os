import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { directusServer } from '@/lib/directus';
import { readItem, updateItem, deleteItem } from '@directus/sdk';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const ticket = await directusServer.request(
      readItem('tickets', id, {
        fields: [
          '*',
          {
            account: ['id', 'name'],
            assigned_to: ['id', 'first_name', 'last_name'],
            status: ['id', 'key', 'label'],
            priority: ['id', 'key', 'label'],
            category: ['id', 'key', 'label'],
            requester_contact: ['id', 'first_name', 'last_name', 'email'],
            package: ['id', 'name', 'code'],
          },
        ],
      })
    );

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Error al obtener el ticket' },
      { status: 500 }
    );
  }
}

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
    const body = await request.json();

    // Construir objeto de actualización solo con campos presentes
    const updateData: any = {};

    if (body.subject !== undefined) updateData.subject = body.subject;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.account !== undefined) updateData.account = body.account || null;
    if (body.category !== undefined) updateData.category = body.category || null;
    if (body.package !== undefined) updateData.package = body.package || null;
    if (body.assigned_to !== undefined) updateData.assigned_to = body.assigned_to || null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.channel !== undefined) updateData.channel = body.channel;
    if (body.requester_contact !== undefined) updateData.requester_contact = body.requester_contact || null;

    const ticket = await directusServer.request(
      updateItem('tickets', id, updateData)
    );

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el ticket' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    await directusServer.request(deleteItem('tickets', id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el ticket' },
      { status: 500 }
    );
  }
}