"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Camera, ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

function validateFaceImage(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(false);
      return;
    }
    const img = new Image();
    img.onload = () => {
      // Basic heuristic: image should be at least 200x200 and roughly portrait-ish
      const valid = img.width >= 200 && img.height >= 200;
      URL.revokeObjectURL(img.src);
      resolve(valid);
    };
    img.onerror = () => resolve(false);
    img.src = URL.createObjectURL(file);
  });
}

export function PhotoUpload({ onFileSelected, disabled, className }: PhotoUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        setError("File too large. Maximum size is 10MB.");
        return;
      }

      const valid = await validateFaceImage(file);
      if (!valid) {
        setError("Please upload a clear photo (minimum 200x200px).");
        return;
      }

      setPreview(URL.createObjectURL(file));
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    disabled,
  });

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          preview && "border-solid border-primary"
        )}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="relative w-full max-w-[300px] aspect-[3/4]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Uploaded preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
              <p className="text-white text-sm font-medium">Click or drop to replace</p>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium mb-1">
              {isDragActive ? "Drop your photo here" : "Upload your photo"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Drag & drop or click to browse. JPG, PNG, WebP up to 10MB.
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" disabled={disabled}>
                <ImageIcon className="h-4 w-4 mr-1" />
                Browse Files
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.capture = "user";
                  input.onchange = (ev) => {
                    const f = (ev.target as HTMLInputElement).files?.[0];
                    if (f) onDrop([f]);
                  };
                  input.click();
                }}
              >
                <Camera className="h-4 w-4 mr-1" />
                Take Photo
              </Button>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
