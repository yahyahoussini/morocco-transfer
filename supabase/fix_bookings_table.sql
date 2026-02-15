-- Fix bookings table script
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  passenger_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  pickup TEXT NOT NULL,
  dropoff TEXT,
  vehicle TEXT NOT NULL,
  trip_type TEXT NOT NULL,
  hours INTEGER,
  price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending'
);

-- 2. Add missing columns (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'pickup_time') THEN
        ALTER TABLE public.bookings ADD COLUMN pickup_time TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'email') THEN
        ALTER TABLE public.bookings ADD COLUMN email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'room_or_passengers') THEN
        ALTER TABLE public.bookings ADD COLUMN room_or_passengers TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'comment') THEN
        ALTER TABLE public.bookings ADD COLUMN comment TEXT;
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 4. Re-create policies (Drop first to ensure clean state)
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view bookings" ON public.bookings;
CREATE POLICY "Anyone can view bookings" ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update bookings" ON public.bookings;
CREATE POLICY "Anyone can update bookings" ON public.bookings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete bookings" ON public.bookings;
CREATE POLICY "Anyone can delete bookings" ON public.bookings FOR DELETE USING (true);

-- 5. Realtime (Add table to publication if not already added)
-- Note: 'supabase_realtime' publication usually exists by default.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  END IF;
END $$;
