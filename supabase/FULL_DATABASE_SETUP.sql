-- =============================================
-- FULL DATABASE SETUP FOR MOROCCO TRANSFERS
-- Run this ONCE in Supabase SQL Editor
-- =============================================

-- 1. BOOKINGS TABLE
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  passenger_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  pickup TEXT NOT NULL,
  dropoff TEXT,
  vehicle TEXT NOT NULL CHECK (vehicle IN ('Vito', 'Dacia')),
  trip_type TEXT NOT NULL CHECK (trip_type IN ('one_way', 'round_trip', 'hourly')),
  hours INTEGER,
  price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Cancelled')),
  pickup_time TEXT,
  email TEXT,
  room_or_passengers TEXT DEFAULT NULL,
  comment TEXT
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Anyone can update bookings" ON public.bookings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete bookings" ON public.bookings FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- 2. ROUTES TABLE
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup TEXT NOT NULL,
  dropoff TEXT NOT NULL,
  vito_one_way NUMERIC NOT NULL,
  dacia_one_way NUMERIC NOT NULL,
  vito_round_trip NUMERIC,
  dacia_round_trip NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pickup, dropoff)
);

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view routes" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert routes" ON public.routes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update routes" ON public.routes FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete routes" ON public.routes FOR DELETE USING (true);

-- Seed routes
INSERT INTO public.routes (pickup, dropoff, vito_one_way, dacia_one_way, vito_round_trip, dacia_round_trip) VALUES
  ('Casablanca', 'Mohamed V Airport', 350, 250, NULL, NULL),
  ('Mohamed V Airport', 'Casablanca', 350, 250, NULL, NULL),
  ('Casablanca', 'Rabat', 1000, 800, 2000, 1600),
  ('Rabat', 'Casablanca', 1000, 800, 2000, 1600),
  ('Casablanca', 'Marrakech', 1500, 1400, 2500, 2400),
  ('Marrakech', 'Casablanca', 1500, 1400, 2500, 2400);

-- 3. SETTINGS TABLE
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Anyone can update settings" ON public.settings FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert settings" ON public.settings FOR INSERT WITH CHECK (true);

INSERT INTO public.settings (key, value) VALUES ('whatsapp_number', '212600000000');

-- 4. PUSH SUBSCRIPTIONS TABLE
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_identifier);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on push_subscriptions"
  ON push_subscriptions FOR ALL TO authenticated, anon
  USING (true) WITH CHECK (true);

-- 5. ENABLE pg_net EXTENSION (needed for push notification trigger)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Done!
