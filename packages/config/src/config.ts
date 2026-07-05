declare const process: { env?: Record<string, string | undefined> } | undefined;

type PublicEnv = Record<string, string | undefined>;

const getPublicEnv = (nextKey: string, viteKey: string): string | undefined => {
  const nodeVal = 
    nextKey === "NEXT_PUBLIC_SUPABASE_URL" ? (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined) :
    nextKey === "NEXT_PUBLIC_SUPABASE_ANON_KEY" ? (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined) :
    nextKey === "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" ? (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY : undefined) :
    nextKey === "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" ? (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME : undefined) :
    nextKey === "NEXT_PUBLIC_CLOUDINARY_API_KEY" ? (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY : undefined) :
    nextKey === "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET" ? (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET : undefined) :
    undefined;

  const viteVal = 
    viteKey === "VITE_SUPABASE_URL" ? ((import.meta as any).env?.VITE_SUPABASE_URL) :
    viteKey === "VITE_SUPABASE_ANON_KEY" ? ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) :
    viteKey === "VITE_SUPABASE_PUBLISHABLE_KEY" ? ((import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY) :
    viteKey === "VITE_CLOUDINARY_CLOUD_NAME" ? ((import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME) :
    viteKey === "VITE_CLOUDINARY_API_KEY" ? ((import.meta as any).env?.VITE_CLOUDINARY_API_KEY) :
    viteKey === "VITE_CLOUDINARY_UPLOAD_PRESET" ? ((import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET) :
    undefined;

  return nodeVal || viteVal;
};

export const DEFAULT_CONFIG = {
  supabase: {
    projectName: "Alrehla",
    projectId: "mqsmgtparbdpvnbyxokh",
    projectUrl: getPublicEnv("NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL"),
    anonKey:
      getPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY") ||
      getPublicEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY"),
  },
  cloudinary: {
    cloudName: getPublicEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "VITE_CLOUDINARY_CLOUD_NAME"),
    apiKey: getPublicEnv("NEXT_PUBLIC_CLOUDINARY_API_KEY", "VITE_CLOUDINARY_API_KEY"),
    uploadPreset: getPublicEnv("NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET", "VITE_CLOUDINARY_UPLOAD_PRESET"),
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
