// Web Push Notifications Management
// Handles push subscription, permissions, and communication with Supabase

import { supabase } from '@/integrations/supabase/client';
import { getServiceWorkerRegistration } from './registerServiceWorker';

// VAPID public key - get this from environment variable
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Convert base64 VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        console.warn('Notifications are not supported in this browser');
        return 'denied';
    }

    if (Notification.permission === 'granted') {
        return 'granted';
    }

    if (Notification.permission === 'denied') {
        return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(userIdentifier?: string): Promise<PushSubscription | null> {
    if (!VAPID_PUBLIC_KEY) {
        console.error('VAPID public key not found in environment variables');
        return null;
    }

    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
    }

    const registration = await getServiceWorkerRegistration();
    if (!registration) {
        console.error('Service worker not registered');
        return null;
    }

    try {
        // Check for existing subscription
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            // Create new subscription
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
        }

        // Store subscription in Supabase
        await savePushSubscription(subscription, userIdentifier);

        console.log('Push subscription successful:', subscription.endpoint);
        return subscription;
    } catch (error) {
        console.error('Push subscription failed:', error);
        return null;
    }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
    const registration = await getServiceWorkerRegistration();
    if (!registration) {
        return false;
    }

    try {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            await subscription.unsubscribe();
            await removePushSubscription(subscription.endpoint);
            console.log('Successfully unsubscribed from push notifications');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Unsubscribe failed:', error);
        return false;
    }
}

// Get current push subscription
export async function getPushSubscription(): Promise<PushSubscription | null> {
    const registration = await getServiceWorkerRegistration();
    if (!registration) {
        return null;
    }

    try {
        const subscription = await registration.pushManager.getSubscription();
        return subscription;
    } catch (error) {
        console.error('Failed to get push subscription:', error);
        return null;
    }
}

// Save push subscription to Supabase
async function savePushSubscription(subscription: PushSubscription, userIdentifier?: string): Promise<void> {
    const subscriptionJson = subscription.toJSON();

    try {
        const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
                user_identifier: userIdentifier || 'admin-device',
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscriptionJson.keys?.p256dh,
                    auth: subscriptionJson.keys?.auth
                }
            }, {
                onConflict: 'endpoint'
            });

        if (error) {
            console.error('Failed to save push subscription:', error);
            throw error;
        }

        console.log('Push subscription saved to database');
    } catch (error) {
        console.error('Error saving push subscription:', error);
        throw error;
    }
}

// Remove push subscription from Supabase
async function removePushSubscription(endpoint: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', endpoint);

        if (error) {
            console.error('Failed to remove push subscription:', error);
            throw error;
        }

        console.log('Push subscription removed from database');
    } catch (error) {
        console.error('Error removing push subscription:', error);
        throw error;
    }
}

// Check if push notifications are supported
export function isPushNotificationSupported(): boolean {
    return (
        'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window
    );
}

// Get notification permission status
export function getNotificationPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
        return 'denied';
    }
    return Notification.permission;
}

// Send test push notification via Supabase Edge Function
export async function sendTestPushNotification(): Promise<{ success: boolean; error?: string }> {
    try {
        const { data, error } = await supabase.functions.invoke('send-push-notification', {
            body: {
                booking: {
                    id: 'test-' + Date.now(),
                    passenger_name: 'Test User',
                    pickup: 'Server Test Pickup',
                    dropoff: 'Server Test Dropoff',
                    price: 500,
                    vehicle: 'Vito',
                    status: 'Pending'
                }
            }
        });

        if (error) {
            console.error('Supabase function error:', error);
            return { success: false, error: error.message || 'Function invocation failed' };
        }

        console.log('Test push response:', data);
        return { success: true };
    } catch (error) {
        console.error('Test push failed:', error);
        return { success: false, error: (error as Error).message };
    }
}
