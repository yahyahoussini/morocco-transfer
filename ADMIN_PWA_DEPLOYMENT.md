# Admin PWA & Push Notifications - Deployment Guide

This guide outlines all steps needed to deploy the standalone Admin PWA with Web Push notifications.

## Prerequisites

- Supabase account with project configured
- Vercel account (or your hosting platform)
- Node.js installed locally
- `web-push` npm package installed (`npm install web-push --save`)

---

## Phase 1: Database Setup

### Create `push_subscriptions` Table

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase/migrations/create_push_subscriptions.sql`
3. Click "Run" to execute the SQL migration
4. Verify the table was created:
   ```sql
   SELECT * FROM push_subscriptions;
   ```

---

## Phase 2: Generate VAPID Keys

### Run the Key Generator

```bash
node scripts/generateVapidKeys.js
```

This will output VAPID keys in the following format:

```
VITE_VAPID_PUBLIC_KEY=BG4xT9...ABC
VAPID_PRIVATE_KEY=u8YN...XYZ
VAPID_PUBLIC_KEY=BG4xT9...ABC
VAPID_SUBJECT=mailto:your-email@domain.com
```

**⚠️ IMPORTANT**: Keep these keys secret! Never commit them to version control.

---

## Phase 3: Environment Variables

### For Vercel (Frontend)

Add to Vercel environment variables:

```env
VITE_VAPID_PUBLIC_KEY=BG4xT9...ABC
```

### For Supabase Edge Functions

1. Go to Supabase Dashboard → Edge Functions → Secrets
2. Add the following secrets:

```env
VAPID_PRIVATE_KEY=u8YN...XYZ
VAPID_PUBLIC_KEY=BG4xT9...ABC
VAPID_SUBJECT=mailto:yourname@moroccotransfers.com
```

*(Replace the email with your actual admin email)*

---

## Phase 4: Deploy Edge Function

### Prerequisites

Install Supabase CLI if not already installed:

```bash
npm install supabase --save-dev
```

### Login to Supabase

```bash
npx supabase login
```

### Link Project

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

*(Find your project ref in Supabase Dashboard → Settings → General)*

### Deploy the Edge Function

```bash
npx supabase functions deploy send-push-notification
```

Verify deployment:
- Go to Supabase Dashboard → Edge Functions
- You should see `send-push-notification` listed

### Test the Edge Function (Optional)

```bash
npx supabase functions serve send-push-notification
```

Then test with:

```bash
curl -X POST http://localhost:54321/functions/v1/send-push-notification \
  -H "Content-Type: application/json" \
  -d '{
    "booking": {
      "id": "test-123",
      "passenger_name": "Test User",
      "pickup": "Casablanca Airport",
      "dropoff": "Downtown",
      "price": 500,
      "vehicle": "Vito"
    }
  }'
```

---

## Phase 5: Frontend Configuration

### Update .env File

Create or update `.env` in the project root:

```env
VITE_VAPID_PUBLIC_KEY=BG4xT9...ABC
```

### Verify Admin Icons

Make sure the admin PWA icons exist:

```bash
# If you need to copy existing icons temporarily:
cp public/icon-192.png public/icon-admin-192.png
cp public/icon-512.png public/icon-admin-512.png
```

*(You can replace these with custom admin icons later)*

---

## Phase 6: Deploy to Production

### Deploy to Vercel

```bash
npm run build
vercel --prod
```

Or push to GitHub and Vercel will auto-deploy.

---

## Phase 7: Testing

### Test on Mobile (iOS/Android)

1. **Open Admin Dashboard**
   - Navigate to `https://yoursite.com/admin`
   - Enter admin PIN (default: 1234)

2. **Install Admin PWA**
   - iOS: Tap Share → Add to Home Screen
   - Android: Tap menu → Install App

3. **Enable Push Notifications**
   - Go to Settings tab in admin dashboard
   - Click "Enable" under Push Notifications
   - Grant permission when prompted
   - Click "Test" to send a test notification

4. **Create Test Booking**
   - On a different device or incognito window, go to the customer site
   - Create a booking
   - Check if you receive a push notification on your admin device

---

## Troubleshooting

### "Failed to subscribe" Error

**Cause**: VAPID public key not set or incorrect.

**Solution**: 
1. Verify `VITE_VAPID_PUBLIC_KEY` is set in Vercel
2. Redeploy the frontend
3. Clear browser cache and try again

### No Notifications Received

**Cause**: Edge Function not triggered or failed.

**Solution**:
1. Check Supabase Edge Function logs:
   - Dashboard → Edge Functions → send-push-notification → Logs
2. Verify VAPID keys are set correctly in Supabase secrets
3. Test the Edge Function manually (see Phase 4)

### "Notifications blocked" Message

**Cause**: User denied notification permission or browser blocked it.

**Solution**:
- iOS: Go to Settings → Safari → yoursite.com → Allow Notifications
- Android: Go to Site Settings → Notifications → Allow

### Service Worker Not Registering

**Cause**: HTTPS required for service workers (except localhost).

**Solution**: Ensure your site is served over HTTPS in production.

---

## Post-Deployment Checklist

- [ ] Database table created successfully
- [ ] VAPID keys generated and stored securely
- [ ] Environment variables added to Vercel
- [ ] Supabase secrets configured
- [ ] Edge Function deployed
- [ ] Test notification sent successfully
- [ ] Admin PWA installs separately from customer app
- [ ] Push notifications deliver to admin device
- [ ] Notification sound/vibration works as expected
- [ ] Multiple devices can subscribe simultaneously

---

## Architecture Overview

```
┌──────────────┐   New Booking   ┌──────────────────┐
│   Customer   │ ───────────────→ │    Supabase      │
│  Books Trip  │                  │   (bookings)     │
└──────────────┘                  └─────┬────────────┘
                                        │
                                        │ INSERT event
                                        ↓
                                  ┌─────────────────────┐
                                  │  Realtime Listener  │
                                  │ (Admin Dashboard)   │
                                  └──────────┬──────────┘
                                             │
                              ┌──────────────┴────────────────┐
                              ↓                               ↓
                   ┌─────────────────────┐       ┌──────────────────────┐
                   │  Browser In-App     │       │  Supabase Edge Fn    │
                   │   Notification      │       │ send-push-notification│
                   │  (if tab open)      │       └─────────┬────────────┘
                   └─────────────────────┘                 │
                                                           │ Fetch subscriptions
                                                           ↓
                                                  ┌────────────────────┐
                                                  │ push_subscriptions │
                                                  │      Table         │
                                                  └─────────┬──────────┘
                                                            │
                                    ┌───────────────────────┴────────────┐
                                    │                                    │
                                    ↓                                    ↓
                          ┌──────────────────┐               ┌──────────────────┐
                          │   Web Push API   │               │   Web Push API   │
                          │   (Device 1)     │               │   (Device 2)     │
                          └────────┬─────────┘               └────────┬─────────┘
                                   │                                  │
                                   ↓                                  ↓
                          ┌──────────────────┐               ┌──────────────────┐
                          │ Service Worker   │               │ Service Worker   │
                          │ Shows Notification│              │ Shows Notification│
                          └──────────────────┘               └──────────────────┘
```

---

## Security Notes

1. **VAPID Keys**: These act as authentication for your push service. Keep them secret.
2. **Admin PIN**: Change the default PIN (1234) to something secure before production.
3. **RLS Policies**: The `push_subscriptions` table has permissive policies for ease of use. In high-security scenarios, restrict access further.
4. **HTTPS Only**: Service workers and push notifications only work on HTTPS (or localhost for testing).

---

## Support

If you encounter issues:

1. Check browser console for error messages
2. Review Supabase Edge Function logs
3. Verify all environment variables are set correctly
4. Test on multiple browsers/devices to isolate device-specific issues
