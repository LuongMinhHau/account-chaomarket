'use client';

import {
    formatBytes,
    useFileUpload,
    type FileWithPreview,
} from '@/hooks/use-file-upload';
import { Button } from '@/components/ui/button';
import { Check, Pencil, TriangleAlert, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useState } from 'react';
import { useI18n } from '@/context/i18n/context';
import AvatarCropDialog from '@/components/avatar-crop-dialog';

interface AvatarUploadProps {
    maxSize?: number;
    className?: string;
    onFileChange?: (file: FileWithPreview | null) => void;
    defaultAvatar?: string;
    previewOnly?: boolean;
    hideActions?: boolean;
    onPendingChange?: (pending: boolean, actions?: { confirm: () => void; cancel: () => void; isUploading: boolean }) => void;
    onErrorChange?: (errors: string[]) => void;
}

export default function AvatarUpload({
    maxSize = 5 * 1024 * 1024,
    className,
    onFileChange,
    defaultAvatar,
    previewOnly = false,
    hideActions = false,
    onPendingChange,
    onErrorChange,
}: AvatarUploadProps) {
    const [pendingFile, setPendingFile] = useState<FileWithPreview | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Crop dialog state
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [rawSelectedFile, setRawSelectedFile] = useState<FileWithPreview | null>(null);

    const onFileSelectCallback = useCallback((files: FileWithPreview[]) => {
        // Open crop dialog instead of directly staging
        setTimeout(() => {
            if (files[0] && files[0].preview) {
                setRawSelectedFile(files[0]);
                setCropImageSrc(files[0].preview);
            }
        }, 0);
    }, []);

    const { t } = useI18n();

    const [
        { files, isDragging, errors },
        {
            removeFile,
            clearErrors,
            handleDragEnter,
            handleDragLeave,
            handleDragOver,
            handleDrop,
            openFileDialog,
            getInputProps,
        },
    ] = useFileUpload({
        maxFiles: 1,
        maxSize,
        accept: 'image/png,image/jpeg,image/webp,image/avif',
        multiple: false,
        onFilesChange: onFileSelectCallback,
    });

    const currentFile = files[0];
    const previewUrl =
        currentFile?.preview ||
        (defaultAvatar ? `${defaultAvatar}` : undefined);

    // Translate hardcoded English error strings from the hook to the current locale
    const translateError = useCallback(
        (error: string): string => {
            // Match "File exceeds the maximum size of X." or "Some files exceed..."
            if (error.includes('exceeds the maximum size of') || error.includes('exceed the maximum size of')) {
                const sizeMatch = error.match(/(\d[\d.]*\s*\w+)\.$/);
                const size = sizeMatch ? sizeMatch[1] : formatBytes(maxSize);
                return `${t('common.fileExceedsMaxSize')} ${size}.`;
            }
            // Match "File "xxx" is not an accepted file type."
            if (error.includes('is not an accepted file type')) {
                return t('common.fileTypeNotAccepted');
            }
            return error;
        },
        [t, maxSize]
    );



    const handleConfirmUpload = async () => {
        if (!pendingFile) return;
        setIsUploading(true);
        try {
            await onFileChange?.(pendingFile);
            setPendingFile(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        if (currentFile) {
            removeFile(currentFile.id);
        }
        setPendingFile(null);
    };

    // Crop dialog handlers
    const handleCropComplete = (croppedFile: File) => {
        const preview = URL.createObjectURL(croppedFile);
        const fileWithPreview: FileWithPreview = {
            file: croppedFile,
            id: `cropped-${Date.now()}`,
            preview,
        };
        setPendingFile(fileWithPreview);
        setCropImageSrc(null);
        setRawSelectedFile(null);
    };

    const handleCropClose = () => {
        setCropImageSrc(null);
        if (rawSelectedFile) {
            removeFile(rawSelectedFile.id);
            setRawSelectedFile(null);
        }
    };

    // Notify parent of pending state changes
    useEffect(() => {
        if (onPendingChange) {
            if (pendingFile) {
                onPendingChange(true, {
                    confirm: handleConfirmUpload,
                    cancel: handleRemove,
                    isUploading,
                });
            } else {
                onPendingChange(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingFile, isUploading]);

    // Notify parent of error changes
    useEffect(() => {
        if (onErrorChange) {
            onErrorChange(errors);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [errors]);

    return (
        <div
            className={cn(
                'flex flex-col items-center gap-3',
                previewOnly && 'pointer-events-none',
                className
            )}
        >
            {/* Avatar Preview */}
            <div className="relative">
                <div
                    className={cn(
                        'group/avatar relative h-32 w-32 cursor-pointer overflow-hidden rounded-full border' +
                        ' border-dashed transition-colors',
                        isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-[var(--brand-grey-foreground)]/40 hover:border-[var(--brand-grey-foreground)]/60',
                        previewUrl && 'border-solid'
                    )}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={openFileDialog}
                >
                    <input {...getInputProps()} className="sr-only" />

                    {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={previewUrl}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <User className="size-6 text-muted-foreground" />
                        </div>
                    )}

                    {/* Hover Edit Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center rounded-full backdrop-blur-[2px] bg-black/20 opacity-0 transition-opacity group-hover/avatar:opacity-100">
                        <Pencil className="size-7 text-white drop-shadow-lg" />
                    </div>
                </div>
            </div>

            {/* Action Buttons - Cancel & Confirm side by side when file is pending */}
            {pendingFile && !hideActions && (
                <div className="flex items-center gap-2 text-xs animate-collapsible-down">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRemove}
                        disabled={isUploading}
                        className="h-7 px-2 gap-0 text-xs md:text-xs font-semibold transition-all duration-300"
                    >
                        <X className="size-4" />
                        {t('common.cancel')}
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleConfirmUpload}
                        disabled={isUploading}
                        className="h-7 px-2 gap-0 text-xs md:text-xs bg-[var(--brand-color)] text-black hover:bg-[var(--brand-color)]/90 font-semibold transition-all duration-300"
                    >
                        <Check className="size-4" />
                        {isUploading
                            ? t('common.saving')
                            : t('common.confirm')
                        }
                    </Button>
                </div>
            )}

            {/* Upload Instructions */}
            {!hideActions && (
                <div
                    className={cn(
                        'text-center space-y-0.5',
                        previewOnly && 'hidden'
                    )}
                >
                    <p className="text-xs text-muted-foreground">
                        {t('common.avatarUploadLimit')} {formatBytes(maxSize)}
                    </p>
                </div>
            )}

            {/* Error Messages */}
            {errors.length > 0 && !hideActions && (
                <div className="mt-2 text-destructive text-sm">
                    <p className="font-semibold flex items-center gap-1">
                        <TriangleAlert className="size-4" />
                        {t('common.avatarUploadErrorTitle')}
                        <button
                            type="button"
                            onClick={clearErrors}
                            className="ml-auto p-0.5 rounded-full hover:bg-destructive/10 transition-colors"
                            aria-label="Dismiss error"
                        >
                            <X className="size-3.5" />
                        </button>
                    </p>
                    {errors.map((error, index) => (
                        <p key={index}>
                            {translateError(error)}
                        </p>
                    ))}
                </div>
            )}

            {/* Crop Dialog */}
            {cropImageSrc && (
                <AvatarCropDialog
                    open={!!cropImageSrc}
                    imageSrc={cropImageSrc}
                    onClose={handleCropClose}
                    onCropComplete={handleCropComplete}
                />
            )}
        </div>
    );
}
