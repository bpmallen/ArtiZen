// src/cloudinary.ts
export function assetUrl(publicId: string, version?: string, format: string = "jpg"): string {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const v = version ? `v${version}/` : "";
  return `https://res.cloudinary.com/${cloud}/image/upload/${v}${publicId}.${format}`;
}
