-- Add edit_decisions table to mirror OJS 3.3 decision log behaviour
create table if not exists public.edit_decisions (
    id uuid primary key default uuid_generate_v4(),
    submission_id uuid not null references public.submissions (id) on delete cascade,
    review_round_id uuid references public.submission_review_rounds (id) on delete set null,
    stage_id integer not null,
    editor_id uuid references public.users (id) on delete set null,
    decision integer not null,
    date_decided timestamptz not null default now(),
    notes text,
    metadata jsonb not null default '{}'::jsonb
);

create index if not exists edit_decisions_submission_idx
    on public.edit_decisions (submission_id, date_decided desc);

create index if not exists edit_decisions_review_round_idx
    on public.edit_decisions (review_round_id);

