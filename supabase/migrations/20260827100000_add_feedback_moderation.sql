alter table public.feedbacks
  add column if not exists status text not null default 'published',
  add column if not exists is_published boolean not null default true;

update public.feedbacks
set status = 'published', is_published = true
where status is null;

alter table public.feedbacks
  drop constraint if exists feedbacks_status_check;

alter table public.feedbacks
  add constraint feedbacks_status_check
  check (status in ('pending', 'published', 'hidden', 'processed', 'archived'));

alter table public.feedbacks
  alter column status set default 'pending',
  alter column is_published set default false;

create index if not exists feedbacks_moderation_idx
  on public.feedbacks (status, is_published, created_at desc);

alter table public.feedbacks enable row level security;

drop policy if exists "Public can read published feedback" on public.feedbacks;
create policy "Public can read published feedback"
  on public.feedbacks for select
  to anon, authenticated
  using (is_published = true and status = 'published');

drop policy if exists "Public can submit feedback" on public.feedbacks;
create policy "Public can submit feedback"
  on public.feedbacks for insert
  to anon, authenticated
  with check (status = 'pending' and is_published = false);
