-- Chat rate limiting for skincare ingredient assistant
-- Tracks message counts per guest session or authenticated user

create table if not exists public.chat_rate_limits (
  id uuid default gen_random_uuid() primary key,
  identifier text not null,
  identifier_type text not null check (identifier_type in ('guest', 'user')),
  message_count integer default 0 not null,
  window_start timestamptz default now() not null,
  created_at timestamptz default now() not null,
  unique(identifier, identifier_type)
);

-- Enable RLS (edge functions use service role key, so no policies needed)
alter table public.chat_rate_limits enable row level security;

-- Index for fast lookups by identifier
create index if not exists idx_chat_rate_limits_identifier
  on public.chat_rate_limits (identifier, identifier_type);
