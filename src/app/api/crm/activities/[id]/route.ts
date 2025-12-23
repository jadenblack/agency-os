import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { directusServer } from '@/lib/directus';
import { deleteItem, updateItem, readItems } from '@directus/sdk';
import { activitySchema } from '@/lib/validations/activity';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = activitySchema.parse(body);

    // Si se proporciona un deal, obtener automáticamente el account asociado
    let accountId = validatedData.account;

    if (validatedData.deal && !accountId) {
      const deals = await directusServer.request(
        readItems('deals', {
          filter: {
            id: {
              _eq: validatedData.deal,
            },
          },
          fields: ['account'],
          limit: 1,
        })
      );

      if (deals && deals.length > 0) {
        accountId = deals[0].account as string;
      }
    }

    // Si is_completed es true, establecer completed_at a la fecha actual
    const completedAt = validatedData.is_completed ? new Date().toISOString() : null;

    const activity = await directusServer.request(
      updateItem('activities', id, {
        subject: validatedData.subject,
        type: validatedData.type || null,
        description: validatedData.description || null,
        owner: validatedData.owner,
        scheduled_at: validatedData.scheduled_at || null,
        completed_at: completedAt,
        deal: validatedData.deal || null,
        account: accountId || null,
        contact: validatedData.contact || null,
      })
    );

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json({ error: 'Error al actualizar la actividad' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    await directusServer.request(deleteItem('activities', id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json({ error: 'Error al eliminar la actividad' }, { status: 500 });
  }
}