"use client";

import { createClient } from "@/shared/lib/supabase/client";
import { requireCurrentUserId } from "@/shared/lib/supabase/auth";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

interface ImageUploadProps {
  bucket: string;
  value: string | null;
  onChange: (url: string | null) => void;
  className?: string;
  label?: string;
}

export function ImageUpload({ bucket, value, onChange, className = "h-32 w-32", label = "Imagem" }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Arquivo inválido. Envie uma imagem.");
      return;
    }

    setError(null);
    setLoading(true);

    const supabase = createClient();
    const userId = await requireCurrentUserId(supabase);
    const ext = file.name.split(".").pop();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.error("[ImageUpload] upload error:", uploadError);
      setError(uploadError.message ? `Erro ao enviar imagem: ${uploadError.message}` : "Erro ao enviar imagem.");
      setLoading(false);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(data.publicUrl);
    setLoading(false);
  }

  async function handleRemove() {
    if (!value) return;
    const supabase = createClient();
    const path = value.split(`/${bucket}/`)[1];
    if (path) await supabase.storage.from(bucket).remove([path]);
    onChange(null);
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {value ? (
        <div className={`group relative overflow-hidden border border-border ${className}`}>
          <Image
            src={value}
            alt={label}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-8 w-8 items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors"
              title="Trocar imagem"
            >
              <Upload className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="flex h-8 w-8 items-center justify-center bg-white/10 text-white hover:bg-destructive/80 transition-colors"
              title="Remover imagem"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className={`flex flex-col items-center justify-center gap-2 border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50 ${className}`}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <ImageIcon className="h-5 w-5" />
              <span className="text-[10px] uppercase tracking-wider">{label}</span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
