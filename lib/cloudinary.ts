import { Cloudinary } from '@cloudinary/url-gen';

// Initialize Cloudinary
export const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''
  }
});

// Upload preset (you'll set this in Cloudinary dashboard)
export const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

