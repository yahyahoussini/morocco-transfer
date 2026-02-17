import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY');
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@moroccotransfers.com';

interface PushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

interface BookingPayload {
    id: string;
    passenger_name: string;
    pickup: string;
    dropoff?: string;
    price: number;
    vehicle: string;
}

async function sendPushNotification(
    subscription: PushSubscription,
    payload: BookingPayload
) {
    const notificationPayload = JSON.stringify({
        title: '🚕 New Booking Received!',
        body: `${payload.passenger_name} - ${payload.pickup}${payload.dropoff ? ` → ${payload.dropoff}` : ''} - ${payload.price} DH`,
        icon: '/icon-admin-192.png',
        badge: '/icon-admin-192.png',
        tag: `booking-${payload.id}`,
        data: {
            url: '/admin',
            bookingId: payload.id
        },
        actions: [
            { action: 'view', title: '👁️ View Details' },
            { action: 'confirm', title: '✅ Confirm' }
        ]
    });

    try {
        // Use web-push module (needs to be in deno.json dependencies)
        const webPush = await import('https://esm.sh/web-push@3.6.5');

        webPush.setVapidDetails(
            VAPID_SUBJECT,
            VAPID_PUBLIC_KEY!,
            VAPID_PRIVATE_KEY!
        );

        await webPush.sendNotification(subscription, notificationPayload);
        console.log(`✅ Notification sent to: ${subscription.endpoint.slice(0, 50)}...`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send notification:`, error);

        // If endpoint is invalid (410 Gone), we should remove it
        if ((error as any).statusCode === 410) {
            console.log('🗑️ Subscription expired, should be removed');
            return false;
        }
        throw error;
    }
}

serve(async (req) => {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { booking } = await req.json();

        if (!booking) {
            return new Response(JSON.stringify({ error: 'No booking data provided' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        console.log(`📱 Sending push notifications for booking: ${booking.id}`);

        // Get Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch all active push subscriptions
        const { data: subscriptions, error: fetchError } = await supabase
            .from('push_subscriptions')
            .select('*');

        if (fetchError) {
            console.error('Failed to fetch subscriptions:', fetchError);
            return new Response(JSON.stringify({ error: 'Failed to fetch subscriptions' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (!subscriptions || subscriptions.length === 0) {
            console.log('No active push subscriptions found');
            return new Response(JSON.stringify({
                message: 'No subscriptions to notify',
                sent: 0
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        console.log(`Found ${subscriptions.length} active subscription(s)`);

        // Send notifications to all subscriptions
        const results = await Promise.allSettled(
            subscriptions.map(sub =>
                sendPushNotification({
                    endpoint: sub.endpoint,
                    keys: sub.keys as { p256dh: string; auth: string }
                }, booking)
            )
        );

        const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
        const failed = results.length - successful;

        // Remove expired subscriptions
        const expiredSubscriptions = subscriptions.filter((_, index) =>
            results[index].status === 'fulfilled' && !(results[index] as PromiseFulfilledResult<boolean>).value
        );

        if (expiredSubscriptions.length > 0) {
            console.log(`🗑️ Removing ${expiredSubscriptions.length} expired subscription(s)`);
            await supabase
                .from('push_subscriptions')
                .delete()
                .in('id', expiredSubscriptions.map(s => s.id));
        }

        return new Response(JSON.stringify({
            message: 'Notifications processed',
            sent: successful,
            failed,
            expired: expiredSubscriptions.length
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Edge function error:', error);
        return new Response(JSON.stringify({
            error: 'Internal server error',
            details: (error as Error).message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
