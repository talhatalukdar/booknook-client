import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/validations";

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Use a JPG, PNG, WebP or GIF image";
  if (file.size > MAX_IMAGE_BYTES) return "Image must be 4 MB or smaller";
  return null;
}

/** Uploads through our own /api/upload route (which holds the imgbb key) with progress events. */
export function uploadImage(file: File, onProgress: (percent: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onerror = () => reject(new Error("Network error while uploading. Try again."));
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && json?.data?.url) return resolve(json.data.url as string);
        reject(new Error(json?.message || "Upload failed"));
      } catch {
        reject(new Error("Upload failed"));
      }
    };
    const body = new FormData();
    body.append("image", file);
    xhr.send(body);
  });
}
