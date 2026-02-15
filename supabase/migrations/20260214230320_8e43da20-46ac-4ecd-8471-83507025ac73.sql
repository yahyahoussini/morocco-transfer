
-- Create bookings table
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
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Cancelled'))
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert bookings (public booking form)
CREATE POLICY "Anyone can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read bookings (admin dashboard uses PIN gate, not auth)
CREATE POLICY "Anyone can view bookings"
ON public.bookings
FOR SELECT
USING (true);

-- Allow anyone to update bookings (admin actions via PIN gate)
CREATE POLICY "Anyone can update bookings"
ON public.bookings
FOR UPDATE
USING (true);

-- Enable realtime for bookings table
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
