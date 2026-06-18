"use client";

import { useMyPresentation, useUpdatePresentation } from "@/features/apresentacao/hooks/useApresentacao";
import { useHandoutsComImagem } from "@/features/campanhas/hooks/useCampanhas";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { ImageUpload } from "@/shared/components/ImageUpload/ImageUpload";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { CarouselImage, CarouselPreset, ImageFit, PresentationMode, PresentationState } from "@/shared/types/presentation";
import { BookMarked, ExternalLink, Loader2, Maximize2, Monitor, Pencil, PlusIcon, Shrink, Trash2, Type, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function ApresentacaoPage() {
  const { data: presentation, isLoading } = useMyPresentation();
  const { mutate: update } = useUpdatePresentation();
  const { data: handouts = [] } = useHandoutsComImagem();

  const [mode, setModeLocal] = useState<PresentationMode>("placeholder");
  const [fit, setFitLocal] = useState<ImageFit>("contain");
  const [showTitle, setShowTitle] = useState(false);
  const [lastTitle, setLastTitle] = useState<string | null>(null);
  const [carouselUrl, setCarouselUrl] = useState("");
  const [carouselTitle, setCarouselTitle] = useState("");
  const [presetName, setPresetName] = useState("");
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"handouts" | "carousel" | "config">("handouts");

  useEffect(() => {
    if (presentation) {
      setModeLocal(presentation.mode);
      setFitLocal(presentation.image_fit ?? "contain");
      setShowTitle(presentation.show_title ?? false);
      if (presentation.single_title) setLastTitle(presentation.single_title);
    }
  }, [presentation?.id]);

  if (isLoading) return (
    <>
      <AppHeader title="Apresentação" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
        </div>
      </main>
    </>
  );

  if (!presentation) return (
    <>
      <AppHeader title="Apresentação" />
      <main className="flex-1 overflow-y-auto p-6">
        <p className="text-sm text-destructive">Erro ao carregar. Verifique se o SQL foi executado no Supabase.</p>
      </main>
    </>
  );

  function save(payload: Partial<Omit<PresentationState, "id" | "user_id" | "updated_at">>) {
    update({ id: presentation!.id, payload });
  }

  function limpar() {
    setModeLocal("placeholder");
    save({ mode: "placeholder", active_preset_id: null });
  }

  function exibir(image_url: string, titulo: string) {
    setModeLocal("single");
    setLastTitle(titulo);
    save({
      mode: "single",
      single_image_url: image_url,
      single_title: showTitle ? titulo : null,
    });
  }

  function toggleTitulo() {
    const next = !showTitle;
    setShowTitle(next);
    save({ show_title: next });
  }

  function handleSetFit(f: ImageFit) {
    setFitLocal(f);
    save({ image_fit: f });
  }

  function iniciarCarrossel() {
    setModeLocal("carousel");
    save({ mode: "carousel", active_preset_id: null });
  }

  function addHandoutAoCarrossel(image_url: string, titulo: string) {
    const jaExiste = presentation.carousel_images.some((c) => c.url === image_url);
    if (jaExiste) return;
    save({ carousel_images: [...presentation.carousel_images, { url: image_url, title: titulo }] });
  }

  function removeCarouselImage(idx: number) {
    save({ carousel_images: presentation.carousel_images.filter((_, i) => i !== idx) });
  }

  function salvarPreset() {
    if (!presetName.trim() || presentation.carousel_images.length === 0) return;
    const presets = presentation.carousel_presets ?? [];

    if (editingPresetId) {
      // Atualiza preset existente
      save({
        carousel_presets: presets.map((p) =>
          p.id === editingPresetId
            ? { ...p, name: presetName.trim(), images: presentation.carousel_images, interval: presentation.carousel_interval }
            : p
        ),
        carousel_images: [],
      });
      setEditingPresetId(null);
    } else {
      // Cria novo
      save({
        carousel_presets: [...presets, {
          id: crypto.randomUUID(),
          name: presetName.trim(),
          images: presentation.carousel_images,
          interval: presentation.carousel_interval,
        }],
        carousel_images: [],
      });
    }
    setPresetName("");
  }

  function carregarPreset(preset: CarouselPreset) {
    setModeLocal("carousel");
    save({ mode: "carousel", active_preset_id: preset.id });
  }

  function editarPreset(preset: CarouselPreset) {
    // Carrega o preset no editor e entra em modo de edição
    save({ carousel_images: preset.images, carousel_interval: preset.interval });
    setPresetName(preset.name);
    setEditingPresetId(preset.id);
  }

  function cancelarEdicao() {
    setEditingPresetId(null);
    setPresetName("");
  }

  function deletarPreset(id: string) {
    if (editingPresetId === id) cancelarEdicao();
    save({ carousel_presets: (presentation.carousel_presets ?? []).filter((p) => p.id !== id) });
  }

  function addCarouselManual() {
    if (!carouselUrl.trim()) return;
    const next: CarouselImage[] = [...presentation.carousel_images, { url: carouselUrl.trim(), title: carouselTitle.trim() || null }];
    save({ carousel_images: next });
    setCarouselUrl("");
    setCarouselTitle("");
  }

  const isAoVivo = mode !== "placeholder";
  const currentLabel = mode === "single"
    ? (presentation.single_title ?? "Sem título")
    : mode === "carousel"
    ? `Carrossel — ${presentation.carousel_images.length} imagens`
    : null;

  return (
    <>
      <AppHeader title="Apresentação" />
      <main className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Barra de status + ações globais */}
        <div className={`flex items-center justify-between gap-4 border p-4 transition-colors ${isAoVivo ? "border-primary/50 bg-primary/5" : "border-border bg-card"}`}>
          <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full ${isAoVivo ? "bg-green-500 animate-pulse" : "bg-muted-foreground/40"}`} />
            <div>
              <p className="text-xs font-medium text-foreground">
                {isAoVivo ? "Ao vivo" : "Aguardando"}
              </p>
              {currentLabel && (
                <p className="text-[10px] text-muted-foreground truncate max-w-xs">{currentLabel}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAoVivo && (
              <Button type="button" variant="outline" size="sm"
                className="text-destructive hover:text-destructive hover:border-destructive/40"
                onClick={limpar}
              >
                <X className="h-3.5 w-3.5" /> Limpar TV
              </Button>
            )}
            <Button asChild variant="outline" size="sm">
              <Link href="/tv" target="_blank">
                <ExternalLink className="h-3.5 w-3.5" />
                Abrir TV
              </Link>
            </Button>
          </div>
        </div>

        {/* Opções rápidas de exibição */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={toggleTitulo}
            className={`flex items-center gap-1.5 border px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium transition-colors ${
              showTitle ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            <Type className="h-3 w-3" />
            {showTitle ? "Com nome" : "Sem nome"}
          </button>

          <button
            type="button"
            onClick={() => handleSetFit("cover")}
            className={`flex items-center gap-1.5 border px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium transition-colors ${
              fit === "cover" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            <Maximize2 className="h-3 w-3" /> Preencher
          </button>
          <button
            type="button"
            onClick={() => handleSetFit("contain")}
            className={`flex items-center gap-1.5 border px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium transition-colors ${
              fit === "contain" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            <Shrink className="h-3 w-3" /> Original
          </button>

          <div className="ml-auto flex items-center gap-2">
            <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">TV</span>
          </div>
        </div>

        {/* Tabs internas */}
        <div className="flex gap-1 border-b border-border">
          {[
            { id: "handouts", label: `Handouts${handouts.length > 0 ? ` (${handouts.length})` : ""}` },
            { id: "carousel", label: `Carrossel${presentation.carousel_images.length > 0 ? ` (${presentation.carousel_images.length})` : ""}` },
            { id: "config", label: "Config" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors -mb-px ${
                activeTab === t.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* HANDOUTS */}
        {activeTab === "handouts" && (
          <div>
            {handouts.length === 0 ? (
              <div className="border border-dashed border-border py-12 text-center">
                <p className="text-xs text-muted-foreground">Nenhum handout com imagem cadastrado.</p>
                <p className="text-[10px] text-muted-foreground mt-1">Adicione imagens nos handouts das missões para aparecerem aqui.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {handouts.map((h, i) => {
                  const isAtivo = mode === "single" && presentation.single_image_url === h.image_url;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => exibir(h.image_url, h.titulo)}
                      className={`group relative border text-left overflow-hidden transition-all ${
                        isAtivo ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="relative h-32 bg-muted">
                        <Image src={h.image_url} alt={h.titulo} fill className="object-cover" unoptimized />
                        {isAtivo && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 uppercase tracking-wider font-medium">Ao vivo</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-card">
                        <p className="text-[10px] font-medium text-foreground truncate">{h.titulo}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{h.mission_titulo}</p>
                        <p className="text-[10px] text-muted-foreground/60 truncate">{h.campaign_name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CARROSSEL */}
        {activeTab === "carousel" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Intervalo (seg)</Label>
                  <Input
                    type="number" min={2} max={60}
                    defaultValue={presentation.carousel_interval}
                    onBlur={(e) => save({ carousel_interval: Number(e.target.value) })}
                    className="w-20"
                  />
                </div>
              </div>
              <Button
                type="button" size="sm"
                onClick={iniciarCarrossel}
                disabled={presentation.carousel_images.length === 0}
                className={mode === "carousel" ? "border-primary bg-primary/5 text-primary" : ""}
                variant={mode === "carousel" ? "outline" : "default"}
              >
                {mode === "carousel" ? "Carrossel ativo" : "Iniciar carrossel"}
              </Button>
            </div>

            {/* Presets */}
            {(presentation.carousel_presets ?? []).length > 0 && (
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Presets salvos</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {(presentation.carousel_presets ?? []).map((preset) => {
                    const isEditing = editingPresetId === preset.id;
                    const isAtivo = presentation.active_preset_id === preset.id && mode === "carousel";
                    return (
                      <div key={preset.id} className={`group relative border bg-card p-3 space-y-2 transition-colors ${isEditing ? "border-primary bg-primary/5" : isAtivo ? "border-green-500/50 bg-green-500/5" : "border-border"}`}>
                        {isAtivo && !isEditing && (
                          <div className="flex items-center gap-1 text-[10px] text-green-600 uppercase tracking-wider font-medium">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Ao vivo
                          </div>
                        )}
                        {isEditing && (
                          <div className="text-[10px] text-primary uppercase tracking-wider font-medium">Editando</div>
                        )}
                        <div className="flex gap-1">
                          {preset.images.slice(0, 4).map((img, i) => (
                            <div key={i} className="relative h-8 w-8 border border-border overflow-hidden bg-muted shrink-0">
                              <Image src={img.url} alt="" fill className="object-cover" unoptimized />
                            </div>
                          ))}
                          {preset.images.length > 4 && (
                            <div className="flex h-8 w-8 items-center justify-center border border-border bg-muted text-[10px] text-muted-foreground">
                              +{preset.images.length - 4}
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-medium text-foreground truncate">{preset.name}</p>
                        <p className="text-[10px] text-muted-foreground">{preset.images.length} imagens · {preset.interval}s</p>
                        <div className="flex gap-1">
                          <Button type="button" size="sm" variant="outline"
                            className="flex-1 text-[10px] h-7"
                            onClick={() => carregarPreset(preset)}
                          >
                            <BookMarked className="h-3 w-3 mr-1" /> Carregar
                          </Button>
                          <Button type="button" size="sm" variant="outline"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => isEditing ? cancelarEdicao() : editarPreset(preset)}
                            title={isEditing ? "Cancelar edição" : "Editar preset"}
                          >
                            {isEditing ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                          </Button>
                          <Button type="button" size="sm" variant="ghost"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deletarPreset(preset.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Salvar / atualizar preset */}
            {presentation.carousel_images.length > 0 && (
              <div className={`flex items-center gap-2 p-3 border ${editingPresetId ? "border-primary/40 bg-primary/5" : "border-dashed border-border"}`}>
                <Input
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder={editingPresetId ? "Novo nome do preset..." : "Nome do preset..."}
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && salvarPreset()}
                />
                {editingPresetId && (
                  <Button type="button" variant="ghost" size="sm" onClick={cancelarEdicao}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  type="button" variant={editingPresetId ? "default" : "outline"} size="sm"
                  onClick={salvarPreset}
                  disabled={!presetName.trim()}
                >
                  <BookMarked className="h-3.5 w-3.5 mr-1" />
                  {editingPresetId ? "Atualizar" : "Salvar preset"}
                </Button>
              </div>
            )}

            {/* Adicionar handouts existentes */}
            {handouts.length > 0 && (
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Adicionar handouts</p>
                <div className="flex gap-2 flex-wrap">
                  {handouts.map((h, i) => {
                    const jaEsta = presentation.carousel_images.some((c) => c.url === h.image_url);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => addHandoutAoCarrossel(h.image_url, h.titulo)}
                        disabled={jaEsta}
                        className={`flex items-center gap-2 border px-2 py-1.5 text-[10px] transition-colors ${
                          jaEsta ? "border-primary/40 bg-primary/5 text-primary opacity-60" : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="relative h-6 w-6 shrink-0 overflow-hidden border border-border">
                          <Image src={h.image_url} alt={h.titulo} fill className="object-cover" unoptimized />
                        </div>
                        {h.titulo}
                        {jaEsta && " ✓"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lista atual */}
            <div className="space-y-2">
              {presentation.carousel_images.length > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                    {presentation.carousel_images.length} {presentation.carousel_images.length === 1 ? "imagem" : "imagens"}
                  </p>
                  <Button
                    type="button" variant="ghost" size="sm"
                    className="text-destructive hover:text-destructive text-[10px] h-7"
                    onClick={() => save({ carousel_images: [] })}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Limpar tudo
                  </Button>
                </div>
              )}
              {presentation.carousel_images.length === 0 ? (
                <div className="border border-dashed border-border py-8 text-center">
                  <p className="text-xs text-muted-foreground">Nenhuma imagem no carrossel.</p>
                </div>
              ) : (
                presentation.carousel_images.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-3 border border-border bg-card p-2">
                    <div className="relative h-10 w-10 shrink-0 border border-border overflow-hidden">
                      <Image src={img.url} alt={img.title ?? ""} fill className="object-cover" unoptimized />
                    </div>
                    <p className="flex-1 text-xs text-foreground truncate">{img.title ?? "Sem título"}</p>
                    <Button type="button" variant="ghost" size="sm"
                      onClick={() => removeCarouselImage(idx)}
                      className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Adicionar manual */}
            <div className="border border-dashed border-border p-3 space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">URL manual</p>
              <div className="flex gap-2">
                <Input value={carouselUrl} onChange={(e) => setCarouselUrl(e.target.value)} placeholder="URL da imagem" className="flex-1" />
                <Input value={carouselTitle} onChange={(e) => setCarouselTitle(e.target.value)} placeholder="Título" className="w-40" />
                <Button type="button" variant="outline" size="sm" onClick={addCarouselManual} disabled={!carouselUrl.trim()}>
                  <PlusIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* CONFIG */}
        {activeTab === "config" && (
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Placeholder (tela padrão)</p>
              <div className="flex items-start gap-4">
                <ImageUpload
                  bucket="apresentacao"
                  value={presentation.placeholder_url}
                  onChange={(url) => save({ placeholder_url: url })}
                />
                <p className="text-xs text-muted-foreground mt-1">Exibida quando nada está ao vivo.</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </>
  );
}
