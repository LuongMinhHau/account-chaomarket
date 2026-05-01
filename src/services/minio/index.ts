'use server';

import * as Minio from 'minio';
import sharp from 'sharp';

import { StorageType } from './types';

/**
 * Cloudflare R2 Storage Service (S3-compatible)
 * Uses the minio SDK since R2 implements the S3 API.
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

export async function uploadImage(file: File, type: StorageType) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = await sharp(Buffer.from(arrayBuffer)).webp().toBuffer();

        const client = getR2Client();
        const bucket = process.env.R2_BUCKET!;
        const objectName = processPath(type, file);

        try {
            await client.bucketExists(bucket);
        } catch {
            // R2 bucket should be pre-created on Cloudflare dashboard
            console.warn(
                '[R2] Bucket does not exist or is not accessible:',
                bucket
            );
        }

        // Upload
        await client.putObject(bucket, objectName, buffer, buffer.length, {
            'Content-Type': 'image/webp',
        });

        // Return public URL
        const publicUrl = `${process.env.R2_PUBLIC_URL}/${objectName}`;
        return { success: true, url: publicUrl, path: objectName };
    } catch (error) {
        console.error('[R2 Upload Error]:', error);
        return { error: (error as Error).message || 'Upload failed' };
    }
}

const processPath = (type: StorageType, file: File) => {
    switch (type) {
        case 'AVATAR':
            return `avatar/${new Date().getFullYear()}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        default:
            throw new Error(
                `process path failed due to type(${type}) not exist.`
            );
    }
};
