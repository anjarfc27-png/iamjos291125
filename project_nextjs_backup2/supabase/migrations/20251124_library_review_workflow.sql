-- Library Files & Review Forms enhancements for Editor workflow parity

-- Ensure library_files table can store storage path + metadata for Supabase storage
alter table if exists public.library_files
  add column if not exists storage_path text,
  add column if not exists metadata jsonb default '{}'::jsonb;

alter table if exists public.library_files
  alter column metadata set default '{}'::jsonb;

create index if not exists library_files_context_idx on public.library_files (context_id);

-- Ensure review_forms rows are scoped to journals and store metadata
alter table if exists public.review_forms
  add column if not exists context_id uuid references public.journals (id) on delete cascade,
  add column if not exists metadata jsonb default '{}'::jsonb;

alter table if exists public.review_forms
  alter column metadata set default '{}'::jsonb;

update public.review_forms
set context_id = coalesce(context_id, assoc_id)
where context_id is null
  and assoc_id is not null;

create index if not exists review_forms_context_idx on public.review_forms (context_id);


