"use client";

import { useMyPresentation, useUpdatePresentation } from "@/features/apresentacao/hooks/useApresentacao";
import { useCampanhas, useHandoutsComImagem } from "@/features/campanhas/hooks/useCampanhas";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { ImageUpload } from "@/shared/components/ImageUpload/ImageUpload";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { CarouselImage, CarouselPreset, ImageFit, PresentationMode, PresentationState } from "@/shared/types/presentation";
import {
  Archive,
  BookMarked,
  ExternalLink,
  Eye,
  ImageIcon,
  Images,
  ListPlus,
  Loader2,
  Maximize2,
  Monitor,
  Pencil,
  Play,
  PlusIcon,
  Save,
  Shrink,
  Trash2,
  Type,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useState } from "react";

const TODAS_CAMPANHAS = "__all__";

export function ApresentacaoPage() {
  const { data: presentation, isLoading } = useMyPresentation();
  const { mutate: update } = useUpdatePresentation();
  const { data: handouts = [] } = useHandoutsComImagem();
  const { data: campanhas = [] } = useCampanhas();

  const [campaignFilter, setCampaignFilter] = useState<string | null>(null);
  const [optimisticState, setOptimisticState] = useState<Partial<PresentationState>>({});
  const [carouselUrl, setCarouselUrl] = useState("");
  const [carouselTitle, setCarouselTitle] = useState("");
  const [presetName, setPresetName] = useState("");
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);

  if (isLoading) return (
    <>
      <AppHeader title="Apresentação" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando cabine...
        </div>
      </main>
    </>
  );

  if (!presentation) return (
    <>
      <AppHeader title="Apresentação" />
      <main className="flex-1 overflow-y-auto p-6">
        <p className="text-sm text-destructive">Erro ao carregar. Verifique se as migrations foram executadas no Supabase.</p>
      </main>
    </>
  );

  const currentPresentation: PresentationState = { ...presentation, ...optimisticState };
  const presentationId = presentation.id;
  const mode: PresentationMode = currentPresentation.mode;
  const fit: ImageFit = currentPresentation.image_fit ?? "contain";
  const showTitle = currentPresentation.show_title ?? false;
  const selectedCampaignId = campaignFilter ?? currentPresentation.campaign_id ?? TODAS_CAMPANHAS;
  const selectedCampaign = selectedCampaignId === TODAS_CAMPANHAS
    ? null
    : campanhas.find((campanha) => campanha.id === selectedCampaignId) ?? null;
  const scopedHandouts = selectedCampaignId === TODAS_CAMPANHAS
    ? handouts
    : handouts.filter((handout) => handout.campaign_id === selectedCampaignId);
  const scopedPresets = (currentPresentation.carousel_presets ?? []).filter((preset) =>
    selectedCampaignId === TODAS_CAMPANHAS ? true : preset.campaign_id === selectedCampaignId,
  );
  const activePreset = currentPresentation.active_preset_id
    ? (currentPresentation.carousel_presets ?? []).find((preset) => preset.id === currentPresentation.active_preset_id)
    : null;
  const liveImages = activePreset?.images ?? currentPresentation.carousel_images;
  const liveImage = mode === "single"
    ? currentPresentation.single_image_url
    : mode === "carousel"
      ? liveImages[0]?.url ?? null
      : currentPresentation.placeholder_url;
  const liveTitle = mode === "single"
    ? currentPresentation.single_title
    : mode === "carousel"
      ? activePreset?.name ?? "Carrossel manual"
      : "Tela em espera";
  const isLive = mode !== "placeholder";
  const currentLabel = mode === "single"
    ? (currentPresentation.single_title ?? "Imagem avulsa")
    : mode === "carousel"
      ? `${activePreset?.name ?? "Carrossel manual"} - ${liveImages.length} imagens`
      : "Placeholder";

  function save(payload: Partial<Omit<PresentationState, "id" | "user_id" | "updated_at">>) {
    setOptimisticState((current) => ({ ...current, ...payload }));
    update({ id: presentationId, payload });
  }

  function clearEditingState() {
    setEditingPresetId(null);
    setPresetName("");
  }

  function trocarCampanha(value: string) {
    const campaignId = value === TODAS_CAMPANHAS ? null : value;
    setCampaignFilter(value);
    clearEditingState();
    save({
      campaign_id: campaignId,
      mode: "placeholder",
      active_preset_id: null,
      single_image_url: null,
      single_title: null,
      carousel_images: [],
    });
  }

  function limparTv() {
    save({
      mode: "placeholder",
      active_preset_id: null,
      single_image_url: null,
      single_title: null,
    });
  }

  function exibir(imageUrl: string, titulo: string) {
    save({
      mode: "single",
      single_image_url: imageUrl,
      single_title: titulo,
      active_preset_id: null,
    });
  }

  function toggleTitulo() {
    save({ show_title: !showTitle });
  }

  function handleSetFit(nextFit: ImageFit) {
    save({ image_fit: nextFit });
  }

  function addHandoutAoCarrossel(imageUrl: string, titulo: string) {
    const jaExiste = currentPresentation.carousel_images.some((image) => image.url === imageUrl);
    if (jaExiste) return;
    save({ carousel_images: [...currentPresentation.carousel_images, { url: imageUrl, title: titulo }] });
  }

  function removeCarouselImage(idx: number) {
    const nextImages = currentPresentation.carousel_images.filter((_, imageIndex) => imageIndex !== idx);
    save({
      carousel_images: nextImages,
      ...(mode === "carousel" && !currentPresentation.active_preset_id && nextImages.length === 0 ? { mode: "placeholder" as const } : {}),
    });
  }

  function limparFila() {
    save({
      carousel_images: [],
      ...(mode === "carousel" && !currentPresentation.active_preset_id ? { mode: "placeholder" as const } : {}),
    });
  }

  function iniciarCarrossel() {
    if (currentPresentation.carousel_images.length === 0) return;
    save({
      mode: "carousel",
      active_preset_id: null,
      single_image_url: null,
      single_title: null,
    });
  }

  function salvarPreset() {
    const name = presetName.trim();
    if (!name || currentPresentation.carousel_images.length === 0) return;

    const presets = currentPresentation.carousel_presets ?? [];
    const campaignId = selectedCampaignId === TODAS_CAMPANHAS ? null : selectedCampaignId;

    if (editingPresetId) {
      save({
        carousel_presets: presets.map((preset) =>
          preset.id === editingPresetId
            ? {
                ...preset,
                name,
                campaign_id: campaignId,
                images: currentPresentation.carousel_images,
                interval: currentPresentation.carousel_interval,
              }
            : preset,
        ),
        carousel_images: [],
      });
      clearEditingState();
      return;
    }

    save({
      carousel_presets: [
        ...presets,
        {
          id: crypto.randomUUID(),
          name,
          campaign_id: campaignId,
          images: currentPresentation.carousel_images,
          interval: currentPresentation.carousel_interval,
        },
      ],
      carousel_images: [],
    });
    clearEditingState();
  }

  function carregarPreset(preset: CarouselPreset) {
    setCampaignFilter(preset.campaign_id ?? TODAS_CAMPANHAS);
    save({
      mode: "carousel",
      active_preset_id: preset.id,
      campaign_id: preset.campaign_id ?? null,
      single_image_url: null,
      single_title: null,
    });
  }

  function editarPreset(preset: CarouselPreset) {
    setCampaignFilter(preset.campaign_id ?? TODAS_CAMPANHAS);
    save({
      carousel_images: preset.images,
      carousel_interval: preset.interval,
      campaign_id: preset.campaign_id ?? null,
    });
    setPresetName(preset.name);
    setEditingPresetId(preset.id);
  }

  function cancelarEdicao() {
    clearEditingState();
    save({ carousel_images: [] });
  }

  function deletarPreset(id: string) {
    if (editingPresetId === id) clearEditingState();
    const nextPresets = (currentPresentation.carousel_presets ?? []).filter((preset) => preset.id !== id);
    save({
      carousel_presets: nextPresets,
      ...(currentPresentation.active_preset_id === id
        ? { mode: "placeholder" as const, active_preset_id: null }
        : {}),
    });
  }

  function addCarouselManual() {
    const url = carouselUrl.trim();
    if (!url) return;

    const nextImage: CarouselImage = {
      url,
      title: carouselTitle.trim() || null,
    };

    save({ carousel_images: [...currentPresentation.carousel_images, nextImage] });
    setCarouselUrl("");
    setCarouselTitle("");
  }

  return (
    <>
      <AppHeader title="Apresentação" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
            <div className={`border p-5 transition-colors ${isLive ? "border-primary/50 bg-primary/5" : "border-border bg-card"}`}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-2 h-2 w-2 rounded-full ${isLive ? "animate-pulse bg-green-500" : "bg-muted-foreground/40"}`} />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      {isLive ? "Transmitindo para jogadores" : "Tela pronta para entrar no ar"}
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold">Cabine de apresentação</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      Escolha a campanha, envie documentos para a TV e monte carrosséis de pistas sem misturar arquivos de outras mesas.
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0">
                  <Link href="/tv" target="_blank">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Abrir TV
                  </Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <StatusCard icon={<Monitor className="h-4 w-4" />} label="Estado" value={isLive ? "Ao vivo" : "Espera"} active={isLive} />
                <StatusCard icon={<ImageIcon className="h-4 w-4" />} label="Na tela" value={currentLabel} />
                <StatusCard icon={<Images className="h-4 w-4" />} label="Fila" value={`${currentPresentation.carousel_images.length} imagens`} />
              </div>

              <div className="mt-5 grid gap-4 border border-border bg-background/70 p-4 lg:grid-cols-[1fr_280px] lg:items-end">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Arquivo de apresentação</p>
                  <h2 className="mt-1 text-base font-semibold">
                    {selectedCampaign ? selectedCampaign.name : "Todas as campanhas"}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Trocar a campanha limpa a TV e reorganiza a biblioteca, evitando mostrar pistas antigas por acidente.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Campanha</Label>
                  <Select value={selectedCampaignId} onValueChange={trocarCampanha}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value={TODAS_CAMPANHAS}>Todas as campanhas</SelectItem>
                      {campanhas.map((campanha) => (
                        <SelectItem key={campanha.id} value={campanha.id}>
                          {campanha.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <PreviewFrame
              imageUrl={liveImage}
              title={isLive && showTitle ? liveTitle : null}
              fit={fit}
              mode={mode}
              isLive={isLive}
            />
          </section>

          <section className="flex flex-wrap items-center justify-between gap-3 border border-border bg-card p-4">
            <div className="flex min-w-0 items-center gap-3">
              <Eye className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground">Controles rápidos da TV</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {isLive ? currentLabel : "Nenhum conteúdo ao vivo. A TV mostra o placeholder configurado."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ToggleButton active={showTitle} onClick={toggleTitulo} icon={<Type className="h-3 w-3" />}>
                {showTitle ? "Com titulo" : "Sem titulo"}
              </ToggleButton>
              <ToggleButton active={fit === "cover"} onClick={() => handleSetFit("cover")} icon={<Maximize2 className="h-3 w-3" />}>
                Preencher
              </ToggleButton>
              <ToggleButton active={fit === "contain"} onClick={() => handleSetFit("contain")} icon={<Shrink className="h-3 w-3" />}>
                Original
              </ToggleButton>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive hover:border-destructive/40 hover:text-destructive"
                onClick={limparTv}
                disabled={!isLive}
              >
                <X className="h-3.5 w-3.5" /> Limpar TV
              </Button>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <section className="border border-border bg-card p-5">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Biblioteca da campanha</p>
                    <h2 className="mt-1 text-lg font-semibold">Documentos e imagens</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {scopedHandouts.length} {scopedHandouts.length === 1 ? "arquivo disponivel" : "arquivos disponiveis"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    <Archive className="h-3.5 w-3.5" />
                    {selectedCampaign ? selectedCampaign.name : "Arquivo geral"}
                  </div>
                </div>

                {scopedHandouts.length === 0 ? (
                  <EmptyState
                    title="Nenhum handout com imagem por aqui."
                    description="Adicione imagens nos handouts das missoes desta campanha para usar a apresentacao como arquivo visual da mesa."
                  />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    {scopedHandouts.map((handout, index) => {
                      const isActive = mode === "single" && currentPresentation.single_image_url === handout.image_url;
                      const isQueued = currentPresentation.carousel_images.some((image) => image.url === handout.image_url);

                      return (
                        <article
                          key={`${handout.mission_id}-${handout.titulo}-${index}`}
                          className={`group overflow-hidden border bg-background transition-colors ${
                            isActive ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => exibir(handout.image_url, handout.titulo)}
                            className="relative block h-40 w-full overflow-hidden bg-muted text-left"
                          >
                            <Image src={handout.image_url} alt={handout.titulo} fill className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
                            <p className="absolute bottom-3 left-3 right-3 truncate text-xs font-semibold text-white drop-shadow">
                              {handout.titulo}
                            </p>
                            {isActive && (
                              <span className="absolute left-3 top-3 bg-primary px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-primary-foreground">
                                Ao vivo
                              </span>
                            )}
                          </button>

                          <div className="space-y-3 p-3">
                            <div>
                              <p className="truncate text-sm font-semibold">{handout.titulo}</p>
                              <p className="mt-1 truncate text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                {handout.mission_titulo}
                              </p>
                              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{handout.conteudo || "Sem descricao."}</p>
                            </div>

                            <div className="flex gap-2">
                              <Button type="button" size="sm" className="flex-1" onClick={() => exibir(handout.image_url, handout.titulo)}>
                                <Play className="h-3.5 w-3.5" />
                                Exibir
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => addHandoutAoCarrossel(handout.image_url, handout.titulo)}
                                disabled={isQueued}
                              >
                                <ListPlus className="h-3.5 w-3.5" />
                                {isQueued ? "Na fila" : "Fila"}
                              </Button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
              <section className="border border-border bg-card p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Fila de transmissao</p>
                    <h2 className="mt-1 text-base font-semibold">Carrossel atual</h2>
                  </div>
                  <span className="border border-border px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {currentPresentation.carousel_images.length} imgs
                  </span>
                </div>

                <div className="mb-4 grid grid-cols-[1fr_auto] gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Intervalo (segundos)</Label>
                    <Input
                      type="number"
                      min={2}
                      max={60}
                      value={currentPresentation.carousel_interval}
                      onChange={(event) => save({ carousel_interval: Number(event.target.value) })}
                    />
                  </div>
                  <Button
                    type="button"
                    className="self-end"
                    onClick={iniciarCarrossel}
                    disabled={currentPresentation.carousel_images.length === 0}
                    variant={mode === "carousel" && !currentPresentation.active_preset_id ? "outline" : "default"}
                  >
                    <Play className="h-3.5 w-3.5" />
                    {mode === "carousel" && !currentPresentation.active_preset_id ? "No ar" : "Rodar"}
                  </Button>
                </div>

                {currentPresentation.carousel_images.length === 0 ? (
                  <EmptyState
                    compact
                    title="Fila vazia."
                    description="Adicione imagens da biblioteca ou uma URL manual para montar a sequencia."
                  />
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Sequencia</p>
                      <Button type="button" variant="ghost" size="sm" className="h-7 text-destructive hover:text-destructive" onClick={limparFila}>
                        <Trash2 className="h-3 w-3" /> Limpar
                      </Button>
                    </div>

                    {currentPresentation.carousel_images.map((image, index) => (
                      <div key={`${image.url}-${index}`} className="flex items-center gap-3 border border-border bg-background p-2">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden border border-border bg-muted">
                          <Image src={image.url} alt={image.title ?? ""} fill className="object-cover" unoptimized />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">{image.title ?? "Sem titulo"}</p>
                          <p className="text-[10px] text-muted-foreground">#{index + 1}</p>
                        </div>
                        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => removeCarouselImage(index)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}

                    <div className={`mt-3 space-y-2 border p-3 ${editingPresetId ? "border-primary/40 bg-primary/5" : "border-dashed border-border"}`}>
                      <Label className="text-xs">{editingPresetId ? "Atualizar carrossel salvo" : "Salvar como carrossel"}</Label>
                      <div className="flex gap-2">
                        <Input
                          value={presetName}
                          onChange={(event) => setPresetName(event.target.value)}
                          placeholder="Nome do carrossel"
                          onKeyDown={(event) => event.key === "Enter" && salvarPreset()}
                        />
                        {editingPresetId && (
                          <Button type="button" variant="ghost" size="sm" onClick={cancelarEdicao}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button type="button" size="sm" onClick={salvarPreset} disabled={!presetName.trim()}>
                          <Save className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 border border-dashed border-border p-3">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Adicionar URL manual</p>
                  <div className="space-y-2">
                    <Input value={carouselUrl} onChange={(event) => setCarouselUrl(event.target.value)} placeholder="URL da imagem" />
                    <div className="flex gap-2">
                      <Input value={carouselTitle} onChange={(event) => setCarouselTitle(event.target.value)} placeholder="Titulo opcional" />
                      <Button type="button" variant="outline" size="sm" onClick={addCarouselManual} disabled={!carouselUrl.trim()}>
                        <PlusIcon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="border border-border bg-card p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Carrosseis salvos</p>
                    <h2 className="mt-1 text-base font-semibold">Presets da campanha</h2>
                  </div>
                  <BookMarked className="h-4 w-4 text-primary" />
                </div>

                {scopedPresets.length === 0 ? (
                  <EmptyState compact title="Nenhum preset salvo." description="Monte uma fila e salve para reutilizar durante a sessao." />
                ) : (
                  <div className="space-y-2">
                    {scopedPresets.map((preset) => {
                      const isActive = currentPresentation.active_preset_id === preset.id && mode === "carousel";
                      const isEditing = editingPresetId === preset.id;

                      return (
                        <div
                          key={preset.id}
                          className={`border p-3 transition-colors ${
                            isEditing ? "border-primary bg-primary/5" : isActive ? "border-green-500/50 bg-green-500/5" : "border-border bg-background"
                          }`}
                        >
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">{preset.name}</p>
                              <p className="mt-0.5 text-[10px] text-muted-foreground">
                                {preset.images.length} imagens - {preset.interval}s
                              </p>
                            </div>
                            {isActive && (
                              <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-green-600">Ao vivo</span>
                            )}
                          </div>

                          <div className="mb-3 flex gap-1">
                            {preset.images.slice(0, 5).map((image, index) => (
                              <div key={`${image.url}-${index}`} className="relative h-8 w-8 shrink-0 overflow-hidden border border-border bg-muted">
                                <Image src={image.url} alt="" fill className="object-cover" unoptimized />
                              </div>
                            ))}
                            {preset.images.length > 5 && (
                              <div className="flex h-8 w-8 items-center justify-center border border-border bg-muted text-[10px] text-muted-foreground">
                                +{preset.images.length - 5}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-[1fr_auto_auto] gap-1">
                            <Button type="button" size="sm" variant="outline" onClick={() => carregarPreset(preset)}>
                              <Play className="h-3.5 w-3.5" />
                              Carregar
                            </Button>
                            <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => isEditing ? cancelarEdicao() : editarPreset(preset)}>
                              {isEditing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                            </Button>
                            <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => deletarPreset(preset.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="border border-border bg-card p-4">
                <div className="mb-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Tela de espera</p>
                  <h2 className="mt-1 text-base font-semibold">Placeholder</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Imagem exibida quando a TV estiver limpa.</p>
                </div>
                <ImageUpload
                  bucket="apresentacao"
                  value={currentPresentation.placeholder_url}
                  onChange={(url) => save({ placeholder_url: url })}
                />
              </section>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}

function StatusCard({
  icon,
  label,
  value,
  active,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div className={`border bg-card p-3 ${active ? "border-primary/40" : "border-border"}`}>
      <div className={active ? "mb-2 text-primary" : "mb-2 text-muted-foreground"}>{icon}</div>
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function ToggleButton({
  active,
  children,
  icon,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 border px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors ${
        active ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function EmptyState({
  title,
  description,
  compact,
}: {
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div className={`border border-dashed border-border text-center ${compact ? "p-4" : "py-12 px-4"}`}>
      <p className="text-xs font-medium text-foreground">{title}</p>
      <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function PreviewFrame({
  imageUrl,
  title,
  fit,
  mode,
  isLive,
}: {
  imageUrl: string | null;
  title: string | null;
  fit: ImageFit;
  mode: PresentationMode;
  isLive: boolean;
}) {
  return (
    <section className="border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Preview da TV</p>
          <p className="mt-1 text-xs text-muted-foreground">Proporcao aproximada da tela dos jogadores.</p>
        </div>
        <span className={`border px-2 py-1 text-[10px] uppercase tracking-wider ${isLive ? "border-primary/30 text-primary" : "border-border text-muted-foreground"}`}>
          {mode}
        </span>
      </div>

      <div className="relative aspect-video overflow-hidden border border-border bg-black">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={title ?? "Preview"}
              fill
              className={fit === "contain" ? "object-contain" : "object-cover"}
              unoptimized
            />
            {title && (
              <>
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
                <p className="absolute bottom-4 left-4 right-4 truncate text-sm font-semibold text-white drop-shadow">
                  {title}
                </p>
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div className="space-y-2 opacity-30">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-white">Ordo Realitas</p>
              <p className="text-[10px] uppercase tracking-widest text-white/70">Tela de exibicao</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
