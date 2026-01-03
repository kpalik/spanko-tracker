-- Create a table for public profiles (optional, but good practice if you expand)
-- create table profiles ( ... );

-- Create daily_sleep_logs table
create table daily_sleep_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Sleep Parameters (Night)
  bed_time timestamp with time zone,
  lights_out_delay_minutes integer,
  sleep_latency_minutes integer,
  awakenings_count integer,
  awakenings_total_minutes integer,
  wake_up_delay_minutes integer,
  get_up_time timestamp with time zone,
  
  -- Sleep Hygiene (Previous Day)
  naps_details text,
  caffeine_details text,
  physical_activity_details text,
  alcohol_details text,
  medication_details text,
  
  -- Well-being Ratings (1-5)
  sleep_quality_rating integer check (sleep_quality_rating >= 1 and sleep_quality_rating <= 5),
  morning_feeling_rating integer check (morning_feeling_rating >= 1 and morning_feeling_rating <= 5),
  yesterday_feeling_rating integer check (yesterday_feeling_rating >= 1 and yesterday_feeling_rating <= 5),

  -- Ensure one entry per user per date
  unique(user_id, date)
);

-- Enable Row Level Security (RLS)
alter table daily_sleep_logs enable row level security;

-- Create policies
create policy "Users can view their own sleep logs"
  on daily_sleep_logs for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own sleep logs"
  on daily_sleep_logs for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own sleep logs"
  on daily_sleep_logs for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own sleep logs"
  on daily_sleep_logs for delete
  using ( auth.uid() = user_id );
