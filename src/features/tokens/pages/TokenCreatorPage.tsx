"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { Download, ImageIcon, Move, RotateCcw, Upload, ZoomIn } from "lucide-react";
import { ChangeEvent, PointerEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";

type ElementoToken = "sangue" | "morte" | "energia" | "conhecimento";
type FundoToken = "none" | "deserto";

const TOKEN_SIZE = 900;

const ELEMENTOS: Record<ElementoToken, { label: string; frame: string; accent: string; chip: string }> = {
  sangue: {
    label: "Sangue",
    frame: "/token-frames/moldura-sangue.png",
    accent: "text-red-500",
    chip: "border-red-500/35 bg-red-500/10 text-red-500",
  },
  morte: {
    label: "Morte",
    frame: "/token-frames/moldura-morte.png",
    accent: "text-zinc-300",
    chip: "border-zinc-400/35 bg-zinc-400/10 text-zinc-200",
  },
  energia: {
    label: "Energia",
    frame: "/token-frames/moldura-energia.png",
    accent: "text-violet-400",
    chip: "border-violet-500/35 bg-violet-500/10 text-violet-300",
  },
  conhecimento: {
    label: "Conhecimento",
    frame: "/token-frames/moldura-conhecimento.png",
    accent: "text-amber-400",
    chip: "border-amber-500/35 bg-amber-500/10 text-amber-300",
  },
};

const FUNDOS: Record<FundoToken, { label: string; src: string | null }> = {
  none: { label: "Transparente", src: null },
  deserto: { label: "Deserto", src: "/token-backgrounds/background-deserto.png" },
};

export function TokenCreatorPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const [elemento, setElemento] = useState<ElementoToken>("sangue");
  const [fundo, setFundo] = useState<FundoToken>("none");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.05);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const active = ELEMENTOS[elemento];

  const imageLabel = useMemo(() => {
    if (!fileName) return "Nenhuma imagem";
    return fileName.replace(/\.[^.]+$/, "").slice(0, 34);
  }, [fileName]);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  useEffect(() => {
    let cancelled = false;

    async function drawToken() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = TOKEN_SIZE;
      canvas.height = TOKEN_SIZE;
      context.clearRect(0, 0, TOKEN_SIZE, TOKEN_SIZE);

      const backgroundSrc = FUNDOS[fundo].src;
      if (backgroundSrc) {
        const background = await loadImage(backgroundSrc);
        if (cancelled) return;
        drawInsideHex(context, () => drawCover(context, background, 1, 0, 0));
      }

      if (imageUrl) {
        const photo = await loadImage(imageUrl);
        if (cancelled) return;
        drawInsideHex(context, () => drawCover(context, photo, zoom, offsetX, offsetY));
      }

      const frame = await loadImage(active.frame);
      if (cancelled) return;
      context.drawImage(frame, 0, 0, TOKEN_SIZE, TOKEN_SIZE);
    }

    drawToken();

    return () => {
      cancelled = true;
    };
  }, [active.frame, fundo, imageUrl, offsetX, offsetY, zoom]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setZoom(1.05);
    setOffsetX(0);
    setOffsetY(0);
  }

  function resetImage() {
    setZoom(1.05);
    setOffsetX(0);
    setOffsetY(0);
  }

  function exportToken() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    const safeName = (fileName ?? `token-${elemento}`).replace(/\.[^.]+$/, "").replace(/[^\w-]+/g, "-").toLowerCase();
    link.download = `${safeName}-${elemento}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function startDrag(event: PointerEvent<HTMLCanvasElement>) {
    if (!imageUrl) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, offsetX, offsetY };
  }

  function dragImage(event: PointerEvent<HTMLCanvasElement>) {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    setOffsetX(clamp(Math.round(dragRef.current.offsetX + dx), -350, 350));
    setOffsetY(clamp(Math.round(dragRef.current.offsetY + dy), -350, 350));
  }

  function stopDrag(event: PointerEvent<HTMLCanvasElement>) {
    if (!dragRef.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  }

  return (
    <main className="h-full overflow-y-auto bg-background">
      <header className="border-b border-border px-6 py-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Ferramenta de arquivo</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Criador de Tokens</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Componha retratos em PNG com as molduras elementais da Ordo.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Imagem
            </Button>
            <Button onClick={exportToken}>
              <Download className="h-4 w-4" />
              Exportar PNG
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-h-0 border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em]">Prévia</p>
              <p className="mt-1 text-xs text-muted-foreground">{imageLabel}</p>
            </div>
            <span className={cn("border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]", active.chip)}>
              {active.label}
            </span>
          </div>
          <div className="grid place-items-center p-5">
            <div className="w-full max-w-[680px]">
              <canvas
                ref={canvasRef}
                onPointerDown={startDrag}
                onPointerMove={dragImage}
                onPointerUp={stopDrag}
                onPointerCancel={stopDrag}
                className={cn(
                  "aspect-square w-full border border-border bg-muted/20 shadow-[0_20px_80px_rgb(0_0_0/0.25)]",
                  imageUrl && "cursor-grab active:cursor-grabbing",
                )}
              />
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <ControlSection title="Elemento" icon={<ImageIcon className="h-4 w-4" />}>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(ELEMENTOS) as ElementoToken[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setElemento(key)}
                  className={cn(
                    "border px-3 py-3 text-left transition-colors hover:bg-muted/30",
                    elemento === key ? ELEMENTOS[key].chip : "border-border bg-background text-muted-foreground",
                  )}
                >
                  <span className={cn("text-xs font-semibold uppercase tracking-[0.16em]", elemento === key && ELEMENTOS[key].accent)}>
                    {ELEMENTOS[key].label}
                  </span>
                </button>
              ))}
            </div>
          </ControlSection>

          <ControlSection title="Imagem" icon={<Upload className="h-4 w-4" />}>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-between gap-3 border border-dashed border-border bg-background px-3 py-3 text-left transition-colors hover:border-primary/50 hover:bg-muted/20"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{imageLabel}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">PNG, JPG ou WEBP</span>
              </span>
              <Upload className="h-4 w-4 shrink-0 text-primary" />
            </button>
          </ControlSection>

          <ControlSection title="Fundo" icon={<ImageIcon className="h-4 w-4" />}>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(FUNDOS) as FundoToken[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFundo(key)}
                  className={cn(
                    "border px-3 py-3 text-left transition-colors hover:bg-muted/30",
                    fundo === key ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground",
                  )}
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.16em]">{FUNDOS[key].label}</span>
                </button>
              ))}
            </div>
          </ControlSection>

          <ControlSection title="Ajuste" icon={<Move className="h-4 w-4" />}>
            <div className="space-y-4">
              <SliderField
                label="Zoom"
                icon={<ZoomIn className="h-3.5 w-3.5" />}
                min={0.6}
                max={2.4}
                step={0.01}
                value={zoom}
                display={`${Math.round(zoom * 100)}%`}
                onChange={setZoom}
              />
              <SliderField
                label="Horizontal"
                min={-350}
                max={350}
                step={1}
                value={offsetX}
                display={`${offsetX}px`}
                onChange={setOffsetX}
              />
              <SliderField
                label="Vertical"
                min={-350}
                max={350}
                step={1}
                value={offsetY}
                display={`${offsetY}px`}
                onChange={setOffsetY}
              />
              <Button type="button" variant="outline" className="w-full" onClick={resetImage} disabled={!imageUrl}>
                <RotateCcw className="h-4 w-4" />
                Centralizar
              </Button>
            </div>
          </ControlSection>

          <div className="border border-primary/30 bg-primary/[0.04] p-4">
            <p className="text-sm font-semibold">Saída</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              O arquivo final sai em 900×900 pixels. A foto e o fundo ficam presos no hexágono, e o restante é transparente onde a moldura permitir.
            </p>
            <Button className="mt-3 w-full" onClick={exportToken}>
              <Download className="h-4 w-4" />
              Exportar PNG
            </Button>
          </div>
        </aside>
      </div>
    </main>
  );
}

function ControlSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="text-primary">{icon}</span>
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em]">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function SliderField({
  label,
  icon,
  min,
  max,
  step,
  value,
  display,
  onChange,
}: {
  label: string;
  icon?: ReactNode;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
          {icon}
          {label}
        </Label>
        <span className="text-xs font-semibold tabular-nums">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer accent-primary"
      />
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawCover(context: CanvasRenderingContext2D, image: HTMLImageElement, zoom: number, offsetX: number, offsetY: number) {
  const coverScale = Math.max(TOKEN_SIZE / image.naturalWidth, TOKEN_SIZE / image.naturalHeight) * zoom;
  const width = image.naturalWidth * coverScale;
  const height = image.naturalHeight * coverScale;
  const x = (TOKEN_SIZE - width) / 2 + offsetX;
  const y = (TOKEN_SIZE - height) / 2 + offsetY;
  context.drawImage(image, x, y, width, height);
}

function drawInsideHex(context: CanvasRenderingContext2D, draw: () => void) {
  context.save();
  applyHexClip(context);
  draw();
  context.restore();
}

function applyHexClip(context: CanvasRenderingContext2D) {
  // Slightly overshoots under the painted frame so transparent antialiasing
  // never shows as a pale outline between the portrait and the border.
  const points = [
    [450, 36],
    [836, 258],
    [836, 642],
    [450, 864],
    [64, 642],
    [64, 258],
  ];
  context.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.closePath();
  context.clip();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
