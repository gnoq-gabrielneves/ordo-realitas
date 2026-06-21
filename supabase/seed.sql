-- Seed local opcional.
-- Mantenha este arquivo pequeno e sem dados sensiveis.

insert into public.presentation_state (
  user_id,
  mode,
  placeholder_url,
  single_image_url,
  single_title,
  carousel_images,
  carousel_interval,
  carousel_presets,
  active_preset_id,
  image_fit,
  show_title
)
select
  auth.uid(),
  'placeholder',
  null,
  null,
  null,
  '[]'::jsonb,
  5,
  '[]'::jsonb,
  null,
  'contain',
  false
where auth.uid() is not null
on conflict do nothing;
