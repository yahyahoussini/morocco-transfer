-- Create a function to call the Edge Function
CREATE OR REPLACE FUNCTION public.handle_new_booking()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://vkpqyfzaalrvmzqgpsgd.supabase.co/functions/v1/send-push-notification',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('request.headers')::json->>'authorization' || '"}'::jsonb,
      body := jsonb_build_object('booking', to_jsonb(NEW))
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_booking_created ON public.bookings;
CREATE TRIGGER on_booking_created
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_booking();
