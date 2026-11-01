"use client";

import { ImagePlus, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadImage, validateImageFile } from "@/lib/upload";
import { cn } from "@/lib/utils";

export function ImageUploader({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (url: string) => void;
  error?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  async function pick(file?: File) {
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) {
      setLocalError(problem);
      return;
    }
    setLocalError(null);
    setPreview(URL.createObjectURL(file));
    setProgress(0);
    try {
      const url = await uploadImage(file, setProgress);
      onChange(url);
      toast.success("Cover uploaded");
    } catch (e) {
      setPreview(null);
      onChange("");
      setLocalError((e as Error).message);
      toast.error((e as Error).message);
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  }

  const shown = preview ?? (value || null);
  const uploading = progress !== null;
  const message = localError ?? error;

  return (
    <div>
      <div className="flex items-start gap-5">
        <div
          className={cn(
            "relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-cover border border-dashed bg-paper sm:w-32",
            message ? "border-danger" : "border-primary/40",
          )}
        >
          {shown ? (
            <Image src={shown} alt="Cover preview" fill unoptimized sizes="128px" className="object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-muted">
              <ImagePlus className="size-7" strokeWidth={1.4} />
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 grid place-items-center bg-night/60 text-canvas">
              <Loader2 className="size-6 animate-spin" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <input
            ref={input}
            id="cover"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => input.current?.click()}>
            {value ? <RefreshCw /> : <ImagePlus />}
            {value ? "Replace cover" : "Choose cover image"}
          </Button>
          <p className="mt-2 text-sm text-muted">JPG, PNG, WebP or GIF, up to 4 MB. Portrait covers look best.</p>
          {uploading && (
            <div className="mt-3" role="progressbar" aria-valuenow={progress ?? 0} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
              <div className="h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-sm text-muted">Uploading {progress}%</p>
            </div>
          )}
          {!uploading && value && !message && <p className="mt-3 text-sm font-medium text-success">Cover uploaded</p>}
          {message && (
            <p role="alert" className="mt-2 text-sm text-danger">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
