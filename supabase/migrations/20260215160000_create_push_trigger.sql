-- Fix the database trigger to use service role key for authentication
-- Run this in Supabase SQL Editor

-- Drop the old trigger and function
DROP TRIGGER IF EXISTS on_booking_created ON public.bookings;
DROP FUNCTION IF EXISTS public.handle_new_booking();

-- Recreate with correct auth using service role key
CREATE OR REPLACE FUNCTION public.handle_new_booking()
RETURNS TRIGGER AS $$
DECLARE
  service_role_key TEXT;
BEGIN
  -- Get the service role key from Supabase vault/settings
  service_role_key := current_setting('supabase.service_role_key', true);
  
  -- Only call if we have a valid key
  IF service_role_key IS NOT NULL AND service_role_key != '' THEN
    PERFORM net.http_post(
      url := 'https://vkpqyfzaalrvmzqgpsgd.supabase.co/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object('booking', to_jsonb(NEW))
    );
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block booking creation if notification fails
  RAISE WARNING 'Push notification failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_booking_created
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_booking();
