const env = ((import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {});

export const DEFAULT_CONFIG = {
  supabase: {
    projectName: "Alrehla",
    projectId: "mqsmgtparbdpvnbyxokh",
    projectUrl: env.VITE_SUPABASE_URL,
    anonKey: env.VITE_SUPABASE_ANON_KEY,
  },
  cloudinary: {
    cloudName: env.VITE_CLOUDINARY_CLOUD_NAME,
    apiKey: env.VITE_CLOUDINARY_API_KEY,
    uploadPreset: env.VITE_CLOUDINARY_UPLOAD_PRESET,
  },
  storage: {
    bucketName: "receipts",
    allowedMimeTypes: [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
    ],
  },
  vercel: {
    environment: "production",
  },
};
