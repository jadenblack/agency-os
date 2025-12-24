'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, X, Upload, File, Image } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploaderProps {
    messageId?: string;
    onUploadComplete?: (files: any[]) => void;
    maxFiles?: number;
    maxSizeMB?: number;
}

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

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];

export function FileUploader({
    messageId,
    onUploadComplete,
    maxFiles = 5,
    maxSizeMB = 10
}: FileUploaderProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const validateFiles = (filesToValidate: File[]): boolean => {
        if (files.length + filesToValidate.length > maxFiles) {
            toast.error(`Máximo ${maxFiles} archivos permitidos`);
            return false;
        }

        for (const file of filesToValidate) {
            if (file.size > maxSizeMB * 1024 * 1024) {
                toast.error(`${file.name} excede el tamaño máximo de ${maxSizeMB}MB`);
                return false;
            }

            if (!ALLOWED_TYPES.includes(file.type)) {
                toast.error(`Tipo de archivo no permitido: ${file.name}`);
                return false;
            }
        }

        return true;
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (validateFiles(droppedFiles)) {
            setFiles((prev) => [...prev, ...droppedFiles]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            if (validateFiles(selectedFiles)) {
                setFiles((prev) => [...prev, ...selectedFiles]);
            }
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const uploadFiles = async () => {
        if (!messageId) {
            toast.error('No se puede subir archivos sin un mensaje');
            return;
        }

        if (files.length === 0) {
            toast.error('No hay archivos para subir');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('files', file);
            });

            const response = await fetch(`/api/tickets/messages/${messageId}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al subir archivos');
            }

            const data = await response.json();
            toast.success(`${files.length} archivo(s) subido(s) correctamente`);

            setFiles([]);
            if (onUploadComplete) {
                onUploadComplete(data.files);
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            toast.error(error instanceof Error ? error.message : 'Error al subir archivos');
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) {
            return <Image className="h-4 w-4" />;
        }
        return <File className="h-4 w-4" />;
    };

    return (
        <div className="space-y-3">
            {/* Drop zone */}
            <div
                className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept={ALLOWED_EXTENSIONS.join(',')}
                    onChange={handleChange}
                    className="hidden"
                />

                <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="mt-2">
                        <Button
                            type="button"
                            variant="link"
                            onClick={() => inputRef.current?.click()}
                            className="text-sm"
                        >
                            Selecciona archivos
                        </Button>
                        <span className="text-sm text-gray-500"> o arrástralos aquí</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Máximo {maxFiles} archivos, {maxSizeMB}MB cada uno. Formatos: imágenes, PDF, Office
                    </p>
                </div>
            </div>

            {/* Selected files list */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <div className="text-sm font-medium">
                        Archivos seleccionados ({files.length}/{maxFiles})
                    </div>
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                {getFileIcon(file.type)}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                disabled={uploading}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}

                    {messageId && (
                        <Button
                            type="button"
                            onClick={uploadFiles}
                            disabled={uploading}
                            className="w-full"
                        >
                            <Paperclip className="h-4 w-4 mr-2" />
                            {uploading ? 'Subiendo...' : `Subir ${files.length} archivo(s)`}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}