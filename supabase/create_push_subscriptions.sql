-- Create the push_subscriptions table if it doesn't exist
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  keys jsonb not null,
  user_identifier text,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.push_subscriptions enable row level security;

-- Create policies (modify as needed for security, e.g., restrict to authenticated users if possible)
-- For now, allow public access so the frontend can subscribe without extra auth (or user_id check)
create policy "Enable insert for all users" 
on public.push_subscriptions for insert 
with check (true);

create policy "Enable select for all users" 
on public.push_subscriptions for select 
using (true);

create policy "Enable delete for all users" 
on public.push_subscriptions for delete 
using (true);
