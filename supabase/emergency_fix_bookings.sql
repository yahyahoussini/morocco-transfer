-- Emergency fix: Disable the push notification trigger causing failures
-- Run this in Supabase SQL Editor

DROP TRIGGER IF EXISTS on_booking_created ON public.bookings;
DROP FUNCTION IF EXISTS public.handle_new_booking();
