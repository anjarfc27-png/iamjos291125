-- OJS Clone core schema for Site Admin + Editor workflows
-- Run with Supabase CLI or psql against the project's database.

create extension if not exists "uuid-ossp";

-- Journals / contexts -------------------------------------------------------
create table if not exists public.journals (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    path text not null unique,
    description text,
    is_public boolean not null default true,
    context_settings jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists journals_path_idx on public.journals (path);

create table if not exists public.journal_user_roles (
    journal_id uuid not null references public.journals (id) on delete cascade,
    user_id uuid not null,
    role text not null,
    assigned_at timestamptz not null default now(),
    primary key (journal_id, user_id, role)
);

create index if not exists journal_user_roles_journal_idx on public.journal_user_roles (journal_id);

-- Site level settings -------------------------------------------------------
create table if not exists public.site_settings (
    id text primary key default 'site',
    site_name text not null,
    intro text,
    logo_url text,
    min_password_length integer not null default 8,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

insert into public.site_settings (id, site_name)
values ('site', 'Open Journal Systems')
on conflict (id) do nothing;

create table if not exists public.site_information (
    id text primary key default 'site',
    support_name text not null default 'Site Administrator',
    support_email text not null default 'admin@example.com',
    support_phone text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

insert into public.site_information (id) values ('site')
on conflict (id) do nothing;

create table if not exists public.site_languages (
    id text primary key default 'site',
    default_locale text not null default 'en',
    enabled_locales text[] not null default array['en'],
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

insert into public.site_languages (id) values ('site')
on conflict (id) do nothing;

create table if not exists public.site_navigation (
    id text primary key default 'site',
    primary_items text[] not null default array['Home','About','Login','Register'],
    user_items text[] not null default array['Dashboard','Profile','Logout'],
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

insert into public.site_navigation (id) values ('site')
on conflict (id) do nothing;

create table if not exists public.site_bulk_emails (
    id text primary key default 'site',
    permissions jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

insert into public.site_bulk_emails (id) values ('site')
on conflict (id) do nothing;

create table if not exists public.site_appearance (
    id text primary key default 'site',
    theme text not null default 'default',
    header_bg text not null default '#0a2d44',
    show_logo boolean not null default true,
    footer_html text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

insert into public.site_appearance (id) values ('site')
on conflict (id) do nothing;

create table if not exists public.site_plugins (
    id text primary key,
    name text not null,
    description text,
    category text not null default 'generic',
    enabled boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Editor / workflow domain --------------------------------------------------
do $$
begin
    if not exists (select 1 from pg_type where typname = 'workflow_stage') then
        create type workflow_stage as enum ('submission','review','copyediting','production');
    end if;
end$$;

-- Ensure legacy submissions table has the columns we depend on before creating
-- indexes or foreign keys that reference them (keeps old 001_x schema compatible)
do $$
begin
    if exists (
        select 1 from information_schema.tables
        where table_schema = 'public' and table_name = 'submissions'
    ) then
        alter table if exists public.submissions
            add column if not exists journal_id uuid references public.journals (id) on delete cascade,
            add column if not exists current_stage workflow_stage not null default 'submission';

        if exists (
            select 1 from information_schema.columns
            where table_schema = 'public'
              and table_name = 'submissions'
              and column_name = 'context_id'
        ) then
            update public.submissions
            set journal_id = context_id
            where journal_id is null and context_id is not null;
        end if;
    end if;
end$$;

create table if not exists public.issues (
    id uuid primary key default uuid_generate_v4(),
    journal_id uuid not null references public.journals (id) on delete cascade,
    volume integer,
    number integer,
    year integer,
    title text,
    published_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.submissions (
    id uuid primary key default uuid_generate_v4(),
    journal_id uuid not null references public.journals (id) on delete cascade,
    title text not null,
    status text not null default 'queued',
    current_stage workflow_stage not null default 'submission',
    is_archived boolean not null default false,
    submitted_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    corresponding_author jsonb,
    metadata jsonb not null default '{}'::jsonb
);

create index if not exists submissions_journal_stage_idx on public.submissions (journal_id, current_stage);
create index if not exists submissions_status_idx on public.submissions (status);

create table if not exists public.submission_versions (
    id uuid primary key default uuid_generate_v4(),
    submission_id uuid not null references public.submissions (id) on delete cascade,
    version integer not null,
    status text not null default 'draft',
    issue_id uuid references public.issues (id) on delete set null,
    published_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (submission_id, version)
);

create table if not exists public.submission_participants (
    submission_id uuid not null references public.submissions (id) on delete cascade,
    user_id uuid not null,
    role text not null,
    stage workflow_stage not null default 'submission',
    assigned_at timestamptz not null default now(),
    primary key (submission_id, user_id, role, stage)
);

create table if not exists public.submission_files (
    id uuid primary key default uuid_generate_v4(),
    submission_id uuid not null references public.submissions (id) on delete cascade,
    stage workflow_stage not null default 'submission',
    file_kind text not null default 'manuscript',
    label text not null,
    version_label text,
    storage_path text not null,
    file_size bigint not null default 0,
    checksum text,
    uploaded_by uuid,
    uploaded_at timestamptz not null default now(),
    round integer not null default 1,
    is_visible_to_authors boolean not null default false
);

create table if not exists public.submission_activity_logs (
    id uuid primary key default uuid_generate_v4(),
    submission_id uuid not null references public.submissions (id) on delete cascade,
    actor_id uuid,
    category text not null default 'note',
    message text not null,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create table if not exists public.submission_review_rounds (
    id uuid primary key default uuid_generate_v4(),
    submission_id uuid not null references public.submissions (id) on delete cascade,
    stage workflow_stage not null default 'review',
    round integer not null default 1,
    status text not null default 'active',
    started_at timestamptz not null default now(),
    closed_at timestamptz,
    notes text
);

create table if not exists public.submission_reviews (
    id uuid primary key default uuid_generate_v4(),
    review_round_id uuid not null references public.submission_review_rounds (id) on delete cascade,
    reviewer_id uuid not null,
    assignment_date timestamptz not null default now(),
    due_date timestamptz,
    response_due_date timestamptz,
    status text not null default 'pending',
    recommendation text,
    submitted_at timestamptz,
    metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.submission_tasks (
    id uuid primary key default uuid_generate_v4(),
    submission_id uuid not null references public.submissions (id) on delete cascade,
    stage workflow_stage not null,
    title text not null,
    status text not null default 'open',
    assignee_id uuid,
    due_date date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.galleys (
    id uuid primary key default uuid_generate_v4(),
    submission_version_id uuid not null references public.submission_versions (id) on delete cascade,
    label text not null,
    locale text not null default 'en',
    file_storage_path text not null,
    file_size bigint not null default 0,
    is_public boolean not null default false,
    created_at timestamptz not null default now()
);

create table if not exists public.journal_profiles (
    journal_id uuid primary key references public.journals (id) on delete cascade,
    initials text,
    abbreviation text,
    publisher text,
    focus_scope text,
    online_issn text,
    print_issn text,
    updated_at timestamptz not null default now()
);

create table if not exists public.journal_indexing (
    journal_id uuid primary key references public.journals (id) on delete cascade,
    keywords text[] not null default array[]::text[],
    description text,
    include_supplemental boolean not null default true,
    updated_at timestamptz not null default now()
);

create table if not exists public.journal_theme_settings (
    journal_id uuid primary key references public.journals (id) on delete cascade,
    use_site_theme boolean not null default true,
    theme text not null default 'default',
    primary_color text not null default '#0a2d44',
    show_logo boolean not null default true,
    updated_at timestamptz not null default now()
);

create table if not exists public.journal_bulk_email_roles (
    journal_id uuid references public.journals (id) on delete cascade,
    role text not null,
    allow boolean not null default true,
    updated_at timestamptz not null default now(),
    primary key (journal_id, role)
);

create table if not exists public.journal_user_roles (
    journal_id uuid references public.journals (id) on delete cascade,
    user_id uuid not null,
    role text not null,
    assigned_at timestamptz not null default now(),
    primary key (journal_id, user_id, role)
);

create table if not exists public.scheduled_task_logs (
    id bigint generated always as identity primary key,
    task_name text not null,
    status text not null default 'success',
    details text,
    executed_at timestamptz not null default now()
);

create index if not exists scheduled_task_logs_executed_idx on public.scheduled_task_logs (executed_at desc);

-- Basic lookup data ---------------------------------------------------------
insert into public.site_plugins (id, name, description, category, enabled)
values
    ('custom-block','Custom Block Manager','Kelola blok konten di sidebar.','generic',true),
    ('google-analytics','Google Analytics','Tambahkan tracking Analytics.','generic',false),
    ('crossref','Crossref XML Export','Ekspor metadata artikel ke Crossref.','importexport',true),
    ('doaj','DOAJ Export Plugin','Ekspor metadata ke DOAJ.','importexport',false)
on conflict (id) do update set
    name = excluded.name,
    description = excluded.description,
    category = excluded.category,
    enabled = excluded.enabled,
    updated_at = now();


