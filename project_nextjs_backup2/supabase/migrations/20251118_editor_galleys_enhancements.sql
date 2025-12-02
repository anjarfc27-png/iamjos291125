-- Add additional metadata columns for galleys to support publication workflow
alter table if exists public.galleys
  add column if not exists submission_file_id uuid references public.submission_files (id) on delete set null,
  add column if not exists remote_url text,
  add column if not exists sequence integer not null default 0,
  add column if not exists is_primary boolean not null default false;

create index if not exists galleys_submission_version_id_idx on public.galleys (submission_version_id);

alter table if exists public.submission_versions
  add column if not exists metadata jsonb not null default '{}'::jsonb;

