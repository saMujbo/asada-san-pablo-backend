import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { InternalServerErrorException } from '@nestjs/common';

export function uploadBufferToCloudinary(
    buffer: Buffer,
    folder: string
    ): Promise<{ secure_url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error || !result) {
            return reject(new InternalServerErrorException('Error subiendo la imagen a Cloudinary'));
            }
            resolve({ secure_url: result.secure_url, public_id: result.public_id });
        },
        );

        const stream = new Readable();
        stream._read = () => {};
        stream.push(buffer);
        stream.push(null);
        stream.pipe(uploadStream);
    });
}