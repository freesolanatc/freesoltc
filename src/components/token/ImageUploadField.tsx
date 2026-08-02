"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export interface ImageUploadFieldProps {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export function ImageUploadField({ value, onChange, error }: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) {
        onChange(null);
        setPreview(null);
        return;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setLocalError("Use a PNG, JPEG, WEBP, or GIF image.");
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setLocalError("Image must be smaller than 2MB.");
        return;
      }
      setLocalError(null);
      onChange(file);
      setPreview(URL.createObjectURL(file));
    },
    [onChange]
  );

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">Token Image</label>
      <div
        className={cn(
          "flex items-center gap-4 rounded-lg border border-dashed border-border p-4 transition-colors",
          "hover:border-primary/60"
        )}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted"
          aria-label="Upload token image"
        >
          {preview ? (
            <Image
              src={preview}
              alt="Token preview"
              fill
              sizes="80px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          )}
        </button>
        <div className="flex-1 text-sm">
          <p className="font-medium">
            {value ? value.name : "PNG, JPEG, WEBP, or GIF, up to 2MB"}
          </p>
          <p className="text-muted-foreground">Square images look best (512x512 recommended).</p>
          {value && (
            <button
              type="button"
              onClick={() => handleFile(null)}
              className="mt-1 inline-flex items-center gap-1 text-xs text-destructive hover:underline"
            >
              <X className="h-3 w-3" /> Remove image
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>
      {(localError || error) && (
        <p className="mt-1.5 text-sm text-destructive">{localError ?? error}</p>
      )}
    </div>
  );
}
