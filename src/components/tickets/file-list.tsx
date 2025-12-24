'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Trash2, File, Image } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface FileListProps {
  messageId: string;
  files: any[];
  canDelete?: boolean;
  onFileDeleted?: () => void;
}

export function FileList({ messageId, files, canDelete = false, onFileDeleted }: FileListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const handleDelete = async (fileId: string) => {
    setDeletingId(fileId);
    try {
      const response = await fetch(`/api/tickets/messages/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar archivo');
      }

      toast.success('Archivo eliminado correctamente');
      if (onFileDeleted) {
        onFileDeleted();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar archivo');
    } finally {
      setDeletingId(null);
      setFileToDelete(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type?.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    }
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const getDownloadUrl = (fileId: string) => {
    return `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${fileId}`;
  };

  if (!files || files.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-2 mt-3">
        <div className="text-sm font-medium text-gray-700">
          Archivos adjuntos ({files.length})
        </div>
        {files.map((fileItem) => {
          const file = typeof fileItem.file === 'object' ? fileItem.file : null;
          if (!file) return null;

          return (
            <div
              key={fileItem.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded border hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {file.title || file.filename_download}
                  </p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.filesize)}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  
                    <a href={getDownloadUrl(file.id)}
                    download={file.filename_download}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </Button>

                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFileToDelete(fileItem.id)}
                    disabled={deletingId === fileItem.id}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El archivo será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => fileToDelete && handleDelete(fileToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}