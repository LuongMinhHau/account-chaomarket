import { StorageType } from '@/services/minio/types';

/**
 * Generate public URL for R2-stored objects.
 */
export const processFinalUrl = (
    type: StorageType,
    _bucket: string,
    objectName: string
) => {
    switch (type) {
        case 'AVATAR':
            return `${process.env.R2_PUBLIC_URL}/${objectName}`;
        default:
            throw new Error(
                `process path failed due to type(${type}) not exist.`
            );
    }
};
