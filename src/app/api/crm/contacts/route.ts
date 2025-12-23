import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { directusServer } from '@/lib/directus';
import { createItem, readItems } from '@directus/sdk';
import { contactSchema } from '@/lib/validations/contact';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const contacts = await directusServer.request(
      readItems('contacts', {
        fields: ['id', 'first_name', 'last_name', 'email', 'phone'],
        sort: ['first_name', 'last_name'],
      })
    );

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Error al obtener contactos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = contactSchema.parse(body);

    const contact = await directusServer.request(
      createItem('contacts', {
        first_name: validatedData.first_name,
        last_name: validatedData.last_name || undefined,
        email: validatedData.email,
        phone: validatedData.phone || undefined,
        notes: validatedData.notes || undefined,
      })
    );

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Error al crear el contacto' },
      { status: 500 }
    );
  }
}