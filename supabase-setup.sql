-- Run once in the SQL editor of the Supabase project dedicated to this portfolio.
-- Visitor credentials can INSERT only. Messages are read in the owner's dashboard.
begin;
create table public.portfolio_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  email text not null check (char_length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  message text not null check (char_length(btrim(message)) between 10 and 3000),
  locale text not null check (locale in ('zh-Hans', 'id', 'en'))
);
alter table public.portfolio_messages enable row level security;
revoke all on table public.portfolio_messages from public, anon, authenticated;
grant insert (name, email, message, locale) on public.portfolio_messages to anon, authenticated;
create policy "visitors may leave a private message"
on public.portfolio_messages for insert to anon, authenticated
with check (true);
-- No SELECT / UPDATE / DELETE policies or grants for visitor roles.
commit;

