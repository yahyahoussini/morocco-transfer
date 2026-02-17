-- Remove the old vehicle restriction
-- Note: The constraint name 'bookings_vehicle_check' is the default generated name.
-- If this fails, you may need to check the constraint name in your database dashboard.
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_vehicle_check;

-- Add the new restriction including Octavia and Karoq
ALTER TABLE public.bookings ADD CONSTRAINT bookings_vehicle_check 
  CHECK (vehicle IN ('Vito', 'Dacia', 'Octavia', 'Karoq'));
