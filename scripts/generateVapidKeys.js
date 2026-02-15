// VAPID Key Generator
// Run this script once to generate Web Push VAPID keys
// Usage: node scripts/generateVapidKeys.js

import webpush from 'web-push';

console.log('🔑 Generating VAPID keys for Web Push Notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID Keys Generated!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 COPY THESE TO YOUR ENVIRONMENT VARIABLES:\n');

console.log('FOR VERCEL/FRONTEND (.env):');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`VITE_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}\n`);

console.log('FOR SUPABASE EDGE FUNCTIONS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_SUBJECT=mailto:your-email@domain.com\n`);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('⚠️  IMPORTANT NOTES:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. Keep these keys SECRET - they act as authentication');
console.log('2. Never commit them to version control');
console.log('3. Add them to Vercel environment variables');
console.log('4. Add them to Supabase Edge Function secrets');
console.log('5. Update VAPID_SUBJECT with your actual email');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
