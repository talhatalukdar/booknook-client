import { auth } from "@/lib/auth";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/validations";

/**
 * Server-side imgbb proxy. The imgbb API key lives only in IMGBB_API_KEY on the server and never
 * reaches the browser. Only logged-in users can upload; type, size and file signature are checked.
 */
const IMGBB_URL = process.env.IMGBB_API_URL || "https://api.imgbb.com/1/upload";
const hits = new Map<string, number[]>(); // simple per-user limiter: 10 uploads / minute

const fail = (status: number, message: string) => Response.json({ success: false, message }, { status });

function sniff(bytes: Uint8Array): string | null {
  const h = (...b: number[]) => b.every((v, i) => bytes[i] === v);
  if (h(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (h(0x89, 0x50, 0x4e, 0x47)) return "image/png";
  if (h(0x47, 0x49, 0x46, 0x38)) return "image/gif";
  if (h(0x52, 0x49, 0x46, 0x46) && bytes[8] === 0x57 && bytes[9] === 0x45) return "image/webp";
  return null;
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers }).catch(() => null);
  if (!session) return fail(401, "Please log in to upload an image");

  const key = process.env.IMGBB_API_KEY;
  if (!key) return fail(503, "Image upload is not configured on the server");

  const now = Date.now();
  const recent = (hits.get(session.user.id) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= 10) return fail(429, "Too many uploads. Please wait a minute.");
  hits.set(session.user.id, [...recent, now]);

  let file: FormDataEntryValue | null;
  try {
    file = (await req.formData()).get("image");
  } catch {
    return fail(400, "Invalid upload");
  }
  if (!(file instanceof File)) return fail(400, "No image was provided");
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return fail(400, "Use a JPG, PNG, WebP or GIF image");
  if (file.size > MAX_IMAGE_BYTES) return fail(400, "Image must be 4 MB or smaller");
  const detected = sniff(new Uint8Array(await file.slice(0, 12).arrayBuffer()));
  if (!detected) return fail(400, "That file does not look like a valid image");

  const body = new FormData();
  body.append("image", file);
  try {
    const res = await fetch(`${IMGBB_URL}?key=${encodeURIComponent(key)}`, { method: "POST", body });
    const json = (await res.json().catch(() => null)) as { success?: boolean; data?: { url?: string; display_url?: string } } | null;
    const url = json?.data?.display_url ?? json?.data?.url;
    if (!res.ok || !json?.success || !url) return fail(502, "The image host rejected the upload. Try again.");
    return Response.json({ success: true, message: "Image uploaded", data: { url } });
  } catch {
    return fail(502, "Could not reach the image host. Try again.");
  }
}
