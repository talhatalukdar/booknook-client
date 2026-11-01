"use client";

import { Camera, Check, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/shared/avatar";
import { Button } from "@/components/ui/button";
import { clearJwt } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { uploadImage, validateImageFile } from "@/lib/upload";

/**
 * Change profile picture: pick a file, preview it, then save.
 * The file goes through our /api/upload proxy (imgbb key stays on the server) and the returned
 * URL is saved to the user's real BetterAuth profile.
 */
export function AvatarUploader({ name, image }: { name: string; image: string | null }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  function pick(f?: File) {
    if (!f) return;
    const problem = validateImageFile(f);
    if (problem) {
      setError(problem);
      toast.error(problem);
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function cancel() {
    setFile(null);
    setPreview(null);
    setError(null);
    if (input.current) input.current.value = "";
  }

  async function save() {
    if (!file) return;
    setSaving(true);
    setProgress(0);
    try {
      const url = await uploadImage(file, setProgress);
      const { error: updateError } = await authClient.updateUser({ image: url });
      if (updateError) throw new Error(updateError.message || "Could not save your new photo");
      clearJwt(); // next token carries the updated profile
      toast.success("Profile picture updated");
      cancel();
      router.refresh();
    } catch (e) {
      const msg = (e as Error).message || "Could not update your profile picture";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
      setProgress(null);
    }
  }

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="relative shrink-0">
        <Avatar name={name} src={preview ?? image} className="size-28 text-4xl ring-4 ring-mist" />
        {saving && (
          <span className="absolute inset-0 grid place-items-center rounded-full bg-night/60 text-canvas">
            <Loader2 className="size-7 animate-spin" />
          </span>
        )}
      </div>
      <div className="min-w-0">
        <input
          ref={input}
          id="avatar-file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => pick(e.target.files?.[0])}
        />
        {!file ? (
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}>
              <Camera /> {image ? "Change photo" : "Upload photo"}
            </Button>
            <p className="mt-2 text-sm text-muted">JPG, PNG, WebP or GIF, up to 4 MB.</p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-night">Preview. Save to use this photo.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={save} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" /> : <Check />}
                {saving ? `Uploading ${progress ?? 0}%` : "Save photo"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={cancel} disabled={saving}>
                <X /> Cancel
              </Button>
            </div>
          </>
        )}
        {error && (
          <p role="alert" className="mt-2 text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
