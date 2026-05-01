'use client';

import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/context/i18n/context';

interface AvatarCropDialogProps {
    open: boolean;
    imageSrc: string;
    onClose: () => void;
    onCropComplete: (croppedFile: File) => void;
}

/**
 * Crops the image using canvas and returns a File.
 */
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<File> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('No 2d context');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            const file = new File([blob], 'avatar-cropped.png', {
                type: 'image/png',
            });
            resolve(file);
        }, 'image/png');
    });
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });
}

export default function AvatarCropDialog({
    open,
    imageSrc,
    onClose,
    onCropComplete,
}: AvatarCropDialogProps) {
    const { locale } = useI18n();
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    const onCropCompleteInternal = useCallback(
        (_croppedArea: Area, croppedAreaPixels: Area) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        []
    );

    const handleConfirm = async () => {
        if (!croppedAreaPixels) return;
        setIsCropping(true);
        try {
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
            onCropComplete(croppedFile);
        } catch (err) {
            console.error('Crop failed:', err);
        } finally {
            setIsCropping(false);
        }
    };

    const handleClose = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
            <DialogContent
                className="sm:max-w-xl p-0 gap-0 overflow-hidden"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogHeader className="px-4 pt-4 pb-2">
                    <DialogTitle className="text-[20px]">
                        {locale === 'vi'
                            ? 'Canh chỉnh ảnh đại diện'
                            : 'Adjust Avatar'}
                    </DialogTitle>
                </DialogHeader>

                {/* Crop area */}
                <div className="relative w-full h-[300px] bg-black/90">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropCompleteInternal}
                    />
                </div>

                {/* Zoom control */}
                <div className="flex items-center gap-3 px-4 py-3">
                    <ZoomOut className="size-4 text-muted-foreground flex-shrink-0" />
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.05}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-4
                            [&::-webkit-slider-thumb]:h-4
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:bg-[var(--brand-color)]
                            [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-webkit-slider-thumb]:shadow-md
                            [&::-webkit-slider-thumb]:transition-transform
                            [&::-webkit-slider-thumb]:hover:scale-110"
                    />
                    <ZoomIn className="size-4 text-muted-foreground flex-shrink-0" />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 px-4 pb-4">
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        disabled={isCropping}
                        className="bg-transparent text-neutral-500 border border-neutral-300 dark:border-neutral-600 hover:text-brand-text hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                    >
                        {locale === 'vi' ? 'Hủy' : 'Cancel'}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isCropping}
                        className={cn(
                            'font-semibold px-6 border transition-all duration-300',
                            'bg-[var(--brand-color)] text-black border-[var(--brand-color)] hover:bg-[var(--brand-color)]/90 hover:scale-105'
                        )}
                    >
                        {isCropping && (
                            <Loader2 className="size-4 animate-spin mr-2" />
                        )}
                        {locale === 'vi' ? 'Xác nhận' : 'Confirm'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
