import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { cloudinary, cloudinaryConfigured } from './cloudinary.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Cover images must survive redeploys and Render's free-tier spin-downs,
// which wipe anything written to local disk at runtime — so when Cloudinary
// is configured (required in production), uploads go there instead. Local
// disk stays as the fallback for local dev, where no Cloudinary account is
// needed to just try the app out.
export async function storeCoverImage(file: Express.Multer.File): Promise<string> {
  if (cloudinaryConfigured) {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'xacrebook/covers', resource_type: 'image' },
        (err, result) => {
          if (err || !result) {
            reject(err ?? new Error('Cloudinary upload returned no result'));
            return;
          }
          resolve(result);
        },
      );
      stream.end(file.buffer);
    });
    return result.secure_url;
  }

  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `${crypto.randomUUID()}${ext}`;
  await fs.promises.writeFile(path.join(UPLOADS_DIR, filename), file.buffer);
  return `/uploads/${filename}`;
}
