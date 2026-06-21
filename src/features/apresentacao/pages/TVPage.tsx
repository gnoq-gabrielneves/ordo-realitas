"use client";

import { useActivePresentationRealtime } from "@/features/apresentacao/hooks/useApresentacao";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export function TVPage() {
  const { state, loading } = useActivePresentationRealtime();
  const carouselScope = `${state?.mode ?? "placeholder"}:${state?.active_preset_id ?? "manual"}`;
  const [carousel, setCarousel] = useState({ scope: carouselScope, index: 0 });
  const carouselIndex = carousel.scope === carouselScope ? carousel.index : 0;
  const [fade, setFade] = useState(true);

  const activePreset = state?.active_preset_id
    ? (state.carousel_presets ?? []).find((p) => p.id === state.active_preset_id)
    : null;

  const interval = activePreset?.interval ?? state?.carousel_interval ?? 5;
  const images = activePreset?.images ?? state?.carousel_images ?? [];

  useEffect(() => {
    if (state?.mode !== "carousel" || images.length <= 1) return;

    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCarousel((current) => ({
          scope: carouselScope,
          index: ((current.scope === carouselScope ? current.index : 0) + 1) % images.length,
        }));
        setFade(true);
      }, 400);
    }, interval * 1000);

    return () => clearInterval(timer);
  }, [state?.mode, images.length, interval, carouselScope]);

  if (loading) return (
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-white/20 animate-spin" />
    </div>
  );

  const currentImage = (() => {
    if (!state) return null;
    if (state.mode === "placeholder") return state.placeholder_url;
    if (state.mode === "single") return state.single_image_url;
    if (state.mode === "carousel") return images[carouselIndex]?.url ?? null;
    return null;
  })();

  const currentTitle = (() => {
    if (!state?.show_title) return null;
    if (state.mode === "single") return state.single_title;
    if (state.mode === "carousel") return images[carouselIndex]?.title ?? null;
    return null;
  })();

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative">
      {currentImage ? (
        <div
          className="absolute inset-0 transition-opacity duration-400"
          style={{ opacity: fade ? 1 : 0 }}
        >
          <Image
            src={currentImage}
            alt={currentTitle ?? "Apresentação"}
            fill
            className={(state?.image_fit ?? "cover") === "contain" ? "object-contain" : "object-cover"}
            priority
            unoptimized
          />
          {/* Gradiente sutil no rodapé se tiver título */}
          {currentTitle && (
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />
          )}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-3 opacity-20">
            <p className="text-white text-xs uppercase tracking-widest font-mono">ORDO REALITAS</p>
            <p className="text-white/60 text-[10px] uppercase tracking-widest">Sistema de Apresentação</p>
          </div>
        </div>
      )}

      {/* Título sobreposto */}
      {currentTitle && (
        <div className="absolute bottom-12 left-12 right-12">
          <p className="text-white text-3xl font-semibold drop-shadow-lg">{currentTitle}</p>
        </div>
      )}

      {/* Indicador de modo (canto superior direito) */}
      {state && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-white/60 uppercase tracking-wider font-mono">{state.mode}</span>
        </div>
      )}

      {/* Indicador carrossel */}
      {state?.mode === "carousel" && images.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: i === carouselIndex ? "24px" : "6px",
                backgroundColor: i === carouselIndex ? "white" : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
