'use server';

import * as Minio from 'minio';
import sharp from 'sharp';

/**
 * Cloudflare R2 Storage Service (S3-compatible)
 * Shared with ChaoMarket Web — same bucket for avatars.
 */
const getR2Client = () => {
    return new Minio.Client({
        endPoint: process.env.R2_ENDPOINT!.replace('https://', ''),
        useSSL: true,
        port: 443,
        accessKey: process.env.R2_ACCESS_KEY_ID!,
        secretKey: process.env.R2_SECRET_ACCESS_KEY!,
        region: 'auto',
        pathStyle: true,
    });
};

export async function uploadAvatar(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = await sharp(Buffer.from(arrayBuffer))
            .resize(256, 256, { fit: 'cover' })
            .webp({ quality: 85 })
            .toBuffer();

        const client = getR2Client();
        const bucket = process.env.R2_BUCKET!;
        const objectName = `avatar/${new Date().getFullYear()}/${Date.now()}_${file.name.replace(/\s+/g, '_').replace(/\.[^.]+$/, '')}.webp`;

        await client.putObject(bucket, objectName, buffer, buffer.length, {
            'Content-Type': 'image/webp',
        });

        const publicUrl = `${process.env.R2_PUBLIC_URL}/${objectName}`;
        return { success: true, url: publicUrl };
    } catch (error) {
        console.error('[Avatar Upload Error]:', error);
        return { success: false, error: (error as Error).message || 'Upload failed' };
    }
}
