export type PresentationMode = "placeholder" | "single" | "carousel";
export type ImageFit = "cover" | "contain";

export interface CarouselImage {
  url: string;
  title: string | null;
}

export interface PresentationState {
  id: string;
  user_id: string;
  mode: PresentationMode;
  placeholder_url: string | null;
  single_image_url: string | null;
  single_title: string | null;
  carousel_images: CarouselImage[];
  carousel_interval: number;
  carousel_presets: CarouselPreset[];
  active_preset_id: string | null;
  image_fit: ImageFit;
  show_title: boolean;
  updated_at: string;
}

export interface CarouselPreset {
  id: string;
  name: string;
  images: CarouselImage[];
  interval: number;
}

export type PresentationPayload = Omit<PresentationState, "id" | "user_id" | "updated_at">;
