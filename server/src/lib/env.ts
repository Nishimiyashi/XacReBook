import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET', process.env.NODE_ENV === 'production' ? undefined : 'dev-secret-change-me'),
  // Render injects RENDER_EXTERNAL_URL automatically — falling back to it
  // means CLIENT_ORIGIN doesn't need to be set by hand on Render, since the
  // client is served from this same service in production anyway.
  clientOrigin: process.env.CLIENT_ORIGIN ?? process.env.RENDER_EXTERNAL_URL ?? 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
  // Optional: when set, uploaded cover images go to Cloudinary instead of
  // local disk. Local disk doesn't survive a redeploy or a free-tier Render
  // spin-down (ephemeral filesystem), so production must set these.
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};
