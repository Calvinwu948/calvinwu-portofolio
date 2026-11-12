-- Run once in your project's Supabase SQL Editor.
-- Anonymous submissions remain private; no public read access.
begin;
create table if not exists public.portfolio_comments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  message text not null check (char_length(btrim(message)) between 2 and 3000),
  locale text not null check (locale in ('zh-Hans','id','en'))
);
alter table public.portfolio_comments enable row level security;
revoke all on table public.portfolio_comments from public, anon, authenticated;
grant insert (message,locale) on public.portfolio_comments to anon,authenticated;
drop policy if exists "visitors_can_submit_private_comments" on public.portfolio_comments;
create policy "visitors_can_submit_private_comments"
  on public.portfolio_comments for insert to anon,authenticated
  with check (char_length(btrim(message)) between 2 and 3000);
notify pgrst, 'reload schema';
commit;
-- Read comments as the project owner in Table Editor > portfolio_comments.
