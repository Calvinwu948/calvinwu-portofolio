-- Run in Supabase SQL Editor. Old portfolio_comments remain private.
begin;
create table if not exists public.portfolio_guestbook (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  display_name text check (display_name is null or char_length(btrim(display_name)) between 1 and 60),
  message text not null check (char_length(btrim(message)) between 2 and 3000),
  locale text not null check (locale in ('zh-Hans','id','en')),
  is_visible boolean not null default true
);
alter table public.portfolio_guestbook enable row level security;
revoke all on public.portfolio_guestbook from public,anon,authenticated;
grant select (id,created_at,display_name,message) on public.portfolio_guestbook to anon,authenticated;
grant insert (display_name,message,locale) on public.portfolio_guestbook to anon,authenticated;
drop policy if exists "read_visible_guestbook" on public.portfolio_guestbook;
create policy "read_visible_guestbook" on public.portfolio_guestbook for select to anon,authenticated using (is_visible = true);
drop policy if exists "post_guestbook" on public.portfolio_guestbook;
create policy "post_guestbook" on public.portfolio_guestbook for insert to anon,authenticated
with check (is_visible = true and char_length(btrim(message)) between 2 and 3000);
create index if not exists portfolio_guestbook_newest on public.portfolio_guestbook (created_at desc,id desc) where is_visible = true;
notify pgrst,'reload schema';
commit;
-- To hide spam, set is_visible=false in Table Editor (admin only).
