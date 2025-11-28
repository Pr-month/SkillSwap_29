import { registerAs } from '@nestjs/config';

export const fileConfig = registerAs('FILE_CONFIG', () => ({
  fileSize: Number(process.env.LIMIT_FILE_SIZE) || 2 * 1024 * 1024,
  allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/gif',
  ],
  imageCDN: process.env.IMAGE_CDN || 'http://localhost:3000/public/',
}));
