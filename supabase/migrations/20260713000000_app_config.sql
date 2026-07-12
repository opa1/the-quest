-- Simple key/value config, read by the middleware to gate the whole site behind
-- a launch countdown. Applied to both networks' databases.
create table if not exists app_config (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table app_config enable row level security;

-- The countdown end date isn't sensitive; allow public read so the middleware's
-- anon client can gate. Writes happen via the dashboard / service role only.
drop policy if exists "app_config public read" on app_config;
create policy "app_config public read" on app_config for select using (true);

-- Countdown control. Set `value` to an ISO datetime to start the countdown;
-- set it null (or a past date) to open the site.
--   update app_config set value = '2026-08-01T18:00:00Z', updated_at = now()
--     where key = 'mainnet_countdown_ends_at';
insert into app_config (key, value)
values ('mainnet_countdown_ends_at', null)
on conflict (key) do nothing;
