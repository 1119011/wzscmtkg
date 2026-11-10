-- ============================================================
-- 幸存者论坛 · Supabase 建表脚本
--
-- 使用方式：
--   1. 登录 https://supabase.com ，新建一个免费项目
--   2. 左侧菜单进入 SQL Editor → New query
--   3. 把本文件全部内容粘贴进去，点击 Run
--   4. 可重复执行（幂等），不会重复建表或报错
--
-- 说明：
--   论坛的每条记录都以 JSON 形式存放在 data 字段里，
--   这样帖子的点赞数、置顶、锁定等自定义字段都能原样保存。
-- ============================================================

-- ---------- 用户 ----------
create table if not exists public.users (
  id          text primary key,
  username    text not null,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);
create unique index if not exists users_username_key on public.users (username);

-- ---------- 帖子 ----------
create table if not exists public.posts (
  id          text primary key,
  created_at  bigint,
  updated_at  bigint,
  data        jsonb not null default '{}'::jsonb
);
create index if not exists posts_created_at_idx on public.posts (created_at desc);

-- ---------- 评论 ----------
create table if not exists public.comments (
  id          text primary key,
  post_id     text,
  created_at  bigint,
  data        jsonb not null default '{}'::jsonb
);
create index if not exists comments_post_id_idx on public.comments (post_id);

-- ---------- 点赞 ----------
create table if not exists public.likes (
  id          text primary key,
  post_id     text,
  user_id     text,
  created_at  bigint,
  data        jsonb not null default '{}'::jsonb
);
create index if not exists likes_post_id_idx on public.likes (post_id);

-- ---------- 键值对（群聊等需要共享的内容） ----------
create table if not exists public.kv (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- ---------- 行级安全（RLS） ----------
alter table public.users    enable row level security;
alter table public.posts    enable row level security;
alter table public.comments enable row level security;
alter table public.likes    enable row level security;
alter table public.kv       enable row level security;

-- 论坛是公开站点，允许匿名访客读写。
-- 如需限制写入权限，把下面的 insert/update/delete 策略改成仅 authenticated 可用。
drop policy if exists "forum users read"    on public.users;
drop policy if exists "forum users write"   on public.users;
drop policy if exists "forum users update"  on public.users;
drop policy if exists "forum users delete"  on public.users;
create policy "forum users read"    on public.users for select using (true);
create policy "forum users write"   on public.users for insert to anon, authenticated with check (true);
create policy "forum users update"  on public.users for update to anon, authenticated using (true) with check (true);
create policy "forum users delete"  on public.users for delete to anon, authenticated using (true);

drop policy if exists "forum posts read"    on public.posts;
drop policy if exists "forum posts write"   on public.posts;
drop policy if exists "forum posts update"  on public.posts;
drop policy if exists "forum posts delete"  on public.posts;
create policy "forum posts read"    on public.posts for select using (true);
create policy "forum posts write"   on public.posts for insert to anon, authenticated with check (true);
create policy "forum posts update"  on public.posts for update to anon, authenticated using (true) with check (true);
create policy "forum posts delete"  on public.posts for delete to anon, authenticated using (true);

drop policy if exists "forum comments read"    on public.comments;
drop policy if exists "forum comments write"   on public.comments;
drop policy if exists "forum comments update"  on public.comments;
drop policy if exists "forum comments delete"  on public.comments;
create policy "forum comments read"    on public.comments for select using (true);
create policy "forum comments write"   on public.comments for insert to anon, authenticated with check (true);
create policy "forum comments update"  on public.comments for update to anon, authenticated using (true) with check (true);
create policy "forum comments delete"  on public.comments for delete to anon, authenticated using (true);

drop policy if exists "forum likes read"    on public.likes;
drop policy if exists "forum likes write"   on public.likes;
drop policy if exists "forum likes update"  on public.likes;
drop policy if exists "forum likes delete"  on public.likes;
create policy "forum likes read"    on public.likes for select using (true);
create policy "forum likes write"   on public.likes for insert to anon, authenticated with check (true);
create policy "forum likes update"  on public.likes for update to anon, authenticated using (true) with check (true);
create policy "forum likes delete"  on public.likes for delete to anon, authenticated using (true);

drop policy if exists "forum kv read"    on public.kv;
drop policy if exists "forum kv write"   on public.kv;
drop policy if exists "forum kv update"  on public.kv;
drop policy if exists "forum kv delete"  on public.kv;
create policy "forum kv read"    on public.kv for select using (true);
create policy "forum kv write"   on public.kv for insert to anon, authenticated with check (true);
create policy "forum kv update"  on public.kv for update to anon, authenticated using (true) with check (true);
create policy "forum kv delete"  on public.kv for delete to anon, authenticated using (true);

-- ---------- 权限 ----------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.users    to anon, authenticated;
grant select, insert, update, delete on public.posts    to anon, authenticated;
grant select, insert, update, delete on public.comments to anon, authenticated;
grant select, insert, update, delete on public.likes    to anon, authenticated;
grant select, insert, update, delete on public.kv       to anon, authenticated;

-- ---------- 图片存储桶 ----------
-- 帖子 / 评论里的图片会上传到这里。public = true 表示任何人可通过公开链接查看。
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

drop policy if exists "forum images read"   on storage.objects;
drop policy if exists "forum images write"  on storage.objects;
drop policy if exists "forum images update" on storage.objects;
create policy "forum images read"   on storage.objects for select using (bucket_id = 'images');
create policy "forum images write"  on storage.objects for insert to anon, authenticated with check (bucket_id = 'images');
create policy "forum images update" on storage.objects for update to anon, authenticated using (bucket_id = 'images') with check (bucket_id = 'images');
