import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { directusServer } from '@/lib/directus';
import { createItem, readItems } from '@directus/sdk';
import { activitySchema } from '@/lib/validations/activity';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

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
    const completedAt = validatedData.is_completed ? new Date().toISOString() : undefined;

    const activity = await directusServer.request(
      createItem('activities', {
        subject: validatedData.subject,
        type: validatedData.type || undefined,
        description: validatedData.description || undefined,
        owner: validatedData.owner,
        scheduled_at: validatedData.scheduled_at || undefined,
        completed_at: completedAt,
        deal: validatedData.deal || undefined,
        account: accountId || undefined,
        contact: validatedData.contact || undefined,
      })
    );

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: 'Error al crear la actividad' }, { status: 500 });
  }
}