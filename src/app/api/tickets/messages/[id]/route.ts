import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadFiles, createItem, readItems } from '@directus/sdk';
import { directusServer } from '@/lib/directus';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];
const MAX_FILES = 5;

// GET - Listar archivos de un mensaje
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: messageId } = await params;

    // Obtener archivos del mensaje
    const files = await directusServer.request(
      readItems('ticket_message_files', {
        filter: { ticket_message: { _eq: messageId } },
        fields: [
          'id',
          'sort',
          'date_created',
          {
            file: [
              'id',
              'filename_download',
              'type',
              'filesize',
              'title',
            ],
          },
        ],
        sort: ['sort'],
      })
    );

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Error al obtener archivos' },
      { status: 500 }
    );
  }
}

// POST - Subir archivos a un mensaje
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: messageId } = await params;

    // Verificar que el mensaje existe y el usuario tiene acceso
    const messages = await directusServer.request(
      readItems('tickets_messages', {
        filter: { id: { _eq: messageId } },
        fields: [
          'id',
          {
            ticket: [
              'id',
              {
                account: [
                  'id',
                  {
                    account_members: ['user'],
                  },
                ],
              },
            ],
          },
        ],
      })
    );

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 });
    }

    // Verificar acceso del usuario al ticket
    const message = messages[0];
    const ticket = message.ticket as any;
    const accountMembers = ticket?.account?.account_members || [];
    const hasAccess = accountMembers.some((m: any) => 
      (typeof m.user === 'string' ? m.user : m.user?.id) === session.user.id
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Verificar cuántos archivos ya tiene el mensaje
    const existingFiles = await directusServer.request(
      readItems('ticket_message_files', {
        filter: { ticket_message: { _eq: messageId } },
      })
    );

    if (existingFiles.length >= MAX_FILES) {
      return NextResponse.json(
        { error: `Máximo ${MAX_FILES} archivos por mensaje` },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No se proporcionaron archivos' }, { status: 400 });
    }

    if (existingFiles.length + files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Máximo ${MAX_FILES} archivos por mensaje. Ya tienes ${existingFiles.length}` },
        { status: 400 }
      );
    }

    // Validar archivos
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `El archivo ${file.name} excede el tamaño máximo de 10MB` },
          { status: 400 }
        );
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Tipo de archivo no permitido: ${file.name}` },
          { status: 400 }
        );
      }
    }

    // Subir archivos a Directus
    const uploadedFiles: Array<{
      id: string;
      file: any;
    }> = [];
    
    for (const file of files) {
      const fileFormData = new FormData();
      fileFormData.append('file', file);

      const uploadedFile = await directusServer.request(uploadFiles(fileFormData));

      // Crear relación con el mensaje
      const messageFile = await directusServer.request(
        createItem('ticket_message_files', {
          ticket_message: messageId,
          file: uploadedFile.id,
          sort: existingFiles.length + uploadedFiles.length,
        })
      );

      uploadedFiles.push({
        id: messageFile.id as string,
        file: uploadedFile,
      });
    }

    return NextResponse.json({ files: uploadedFiles });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Error al subir archivos' },
      { status: 500 }
    );
  }
}