import webpush from 'web-push';
const vapidKeys = webpush.generateVAPIDKeys();
console.log(`\nVITE_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
