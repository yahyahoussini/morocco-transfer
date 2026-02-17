# Push Notification Setup Guide

Follow these 3 steps in order. Each step only needs to be done **once**.

---

## Step 1: Create the `push_subscriptions` Table

Go to **Supabase Dashboard → SQL Editor** and paste this:

```sql
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_identifier);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on push_subscriptions"
  ON push_subscriptions FOR ALL TO authenticated, anon
  USING (true) WITH CHECK (true);
```

Click **Run**.

---

## Step 2: Set VAPID Secrets in Supabase

Your **public key** is already in `.env`:
```
VITE_VAPID_PUBLIC_KEY=BJC4dIAxNcrfm6Q2IJaO_T48rgUuQ-u1xGKCOJQ4jZmZAWxaMfOgzSNrrdF7lWhUGnr_xKe87Rwd-bhe-pbaRzk
```

You need the **matching private key**. If you don't have it, generate a new pair:
```bash
npx web-push generate-vapid-keys
```

Then set all 3 secrets in Supabase:

**Option A: Supabase Dashboard** → Project Settings → Edge Functions → Secrets → Add:
- `VAPID_PUBLIC_KEY` = (your public key)
- `VAPID_PRIVATE_KEY` = (your private key)
- `VAPID_SUBJECT` = `mailto:your-email@example.com`

**Option B: Supabase CLI**:
```bash
npx supabase secrets set VAPID_PUBLIC_KEY=BJC4dIAxNcr...
npx supabase secrets set VAPID_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
npx supabase secrets set VAPID_SUBJECT=mailto:your-email@example.com
```

> ⚠️ If you generate new keys, update `VITE_VAPID_PUBLIC_KEY` in your `.env` and Vercel environment variables too.

---

## Step 3: Deploy the Edge Function

```bash
npx supabase functions deploy send-push-notification --project-ref vkpqyfzaalrvmzqgpsgd
```

Or from the Supabase Dashboard, deploy the function manually.

---

## How It Works After Setup

1. You open the Admin Dashboard and log in with your PIN
2. The app **automatically** asks for notification permission
3. Your device is registered in the `push_subscriptions` table
4. When a new booking arrives → the Edge Function sends a push → 🔔 your phone shows the notification

**That's it! No manual steps needed after this one-time setup.**
