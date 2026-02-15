-- Create routes table for admin-managed transfer routes
CREATE TABLE public.routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup text NOT NULL,
  dropoff text NOT NULL,
  vito_one_way numeric NOT NULL,
  dacia_one_way numeric NOT NULL,
  vito_round_trip numeric,
  dacia_round_trip numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(pickup, dropoff)
);

-- Enable RLS
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Anyone can read routes (needed for pricing on the booking page)
CREATE POLICY "Anyone can view routes"
  ON public.routes FOR SELECT
  USING (true);

-- Anyone can insert routes (admin PIN-protected in app)
CREATE POLICY "Anyone can insert routes"
  ON public.routes FOR INSERT
  WITH CHECK (true);

-- Anyone can update routes
CREATE POLICY "Anyone can update routes"
  ON public.routes FOR UPDATE
  USING (true);

-- Anyone can delete routes
CREATE POLICY "Anyone can delete routes"
  ON public.routes FOR DELETE
  USING (true);

-- Seed with existing hardcoded routes
INSERT INTO public.routes (pickup, dropoff, vito_one_way, dacia_one_way, vito_round_trip, dacia_round_trip) VALUES
  ('Casablanca', 'Mohamed V Airport', 350, 250, NULL, NULL),
  ('Mohamed V Airport', 'Casablanca', 350, 250, NULL, NULL),
  ('Casablanca', 'Rabat', 1000, 800, 2000, 1600),
  ('Rabat', 'Casablanca', 1000, 800, 2000, 1600),
  ('Casablanca', 'Marrakech', 1500, 1400, 2500, 2400),
  ('Marrakech', 'Casablanca', 1500, 1400, 2500, 2400);