# Morocco Premier Transfers - Web Application Audit

## Executive Summary

This is a **full-stack Progressive Web App (PWA)** for a luxury transfer service in Morocco. It allows customers to book airport transfers and hourly chauffeur services, while providing an admin dashboard for managing bookings, routes, and analytics.

---

## Technology Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **UI Library**: shadcn-ui (Radix UI components)
- **Styling**: Tailwind CSS 3.4.17 with custom gold theme
- **Animations**: Framer Motion 12.34.0
- **Routing**: React Router DOM 6.30.1
- **State Management**: React Query (TanStack Query) 5.83.0
- **Forms**: React Hook Form 7.61.1 with Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)

### Backend
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime subscriptions
- **Push Notifications**: Web Push API with VAPID keys
- **Service Worker**: Custom service worker for PWA and push notifications

### PWA Features
- **Service Worker**: Custom service worker (`/public/sw.js`)
- **Manifest**: PWA manifest configured for installable app
- **Offline Support**: Workbox caching strategies
- **Install Prompt**: BeforeInstallPrompt event handling

---

## Project Structure

```
morocco-premier-transfers/
├── src/
│   ├── pages/              # Main page components
│   │   ├── Index.tsx       # Customer booking form
│   │   ├── Confirmation.tsx # Booking confirmation page
│   │   ├── AdminDashboard.tsx # Admin panel
│   │   └── NotFound.tsx   # 404 page
│   ├── components/         # Reusable components
│   │   ├── TopBar.tsx      # Language/theme switcher
│   │   ├── NotificationSettings.tsx # Push notification settings
│   │   └── ui/             # shadcn-ui components
│   ├── lib/                # Utilities and helpers
│   │   ├── pricing.ts      # Route pricing logic
│   │   ├── i18n.tsx        # Internationalization (EN/FR/AR)
│   │   ├── theme.tsx       # Dark/light theme
│   │   ├── pushNotifications.ts # Web Push API
│   │   └── registerServiceWorker.ts # SW registration
│   ├── integrations/
│   │   └── supabase/       # Supabase client & types
│   └── assets/             # Images (hero, vehicles, etc.)
├── supabase/
│   ├── migrations/         # Database migrations
│   └── functions/          # Edge functions (push notifications)
└── public/                 # Static assets & service worker
```

---

## Core Features

### 1. Customer Booking System (`Index.tsx`)

**Service Types:**
- **Transfer Service**: Point-to-point transfers (airport, city-to-city)
- **Hourly Service**: Chauffeur service by the hour (200 DH/hr, Vito only)

**Booking Flow:**
1. Select service type (transfer or hourly)
2. Choose route (pickup/dropoff) or enter location for hourly
3. Select vehicle (Vito Business Class or Dacia Lodgy Economy)
4. Choose trip type (one-way or round-trip, if available)
5. Select pickup date & time
6. Enter passenger info (name, WhatsApp, email, room/passengers)
7. View calculated price
8. Submit booking (cash on arrival)

**Key Features:**
- Real-time price calculation from database routes
- GPS location detection for hourly service
- Time slot validation (only future times available)
- Form validation with error messages
- Multi-language support (EN/FR/AR)
- Responsive design with glassmorphism UI

**Price Calculation:**
- Transfer prices: Stored in `routes` table (Vito/Dacia, one-way/round-trip)
- Hourly service: Fixed 200 DH/hour × hours (Vito only)
- Prices calculated via `calculatePriceFromRoutes()` in `lib/pricing.ts`

### 2. Admin Dashboard (`AdminDashboard.tsx`)

**Authentication:**
- PIN-based access (hardcoded: `1234`)
- No Supabase auth (uses RLS policies for data access)

**Tabs:**

#### Bookings Tab
- Real-time booking list via Supabase Realtime
- Swipeable cards (swipe right to confirm, left to cancel)
- Status badges (Pending/Confirmed/Cancelled)
- Booking details modal
- Delete functionality
- Push notifications for new bookings
- Sound alerts and vibration

#### Routes Tab
- View all transfer routes
- Add new routes (pickup, dropoff, prices)
- Edit existing routes (inline editing)
- Delete routes
- Prices: Vito/Dacia, one-way/round-trip

#### Analytics Tab
- Date range picker (default: last 7 days)
- Quick presets (7D, 30D, 90D, All)
- Metrics:
  - Total revenue
  - Confirmed revenue
  - Pending revenue
  - Total bookings
- Daily revenue chart (bar visualization)
- Top routes by popularity (count & revenue)

#### Settings Tab
- WhatsApp number configuration (stored in `settings` table)
- Push notification management
  - Enable/disable subscriptions
  - Test notifications
  - Permission status

**Real-time Features:**
- Supabase Realtime subscriptions for:
  - New bookings (INSERT)
  - Booking updates (UPDATE)
  - Booking deletions (DELETE)
- Instant UI updates without refresh
- Sound + vibration alerts for new bookings
- System notifications (browser + service worker)

### 3. Confirmation Page (`Confirmation.tsx`)

- Displays booking summary
- Shows booking reference (first 8 chars of UUID)
- WhatsApp contact button (pre-filled message)
- "Make another booking" button
- Fetches WhatsApp number from `settings` table

### 4. Internationalization (`lib/i18n.tsx`)

**Supported Languages:**
- English (EN) - default
- French (FR)
- Arabic (AR) - RTL support

**Features:**
- Language detection from browser
- Persistent storage (localStorage)
- RTL layout for Arabic
- Complete translations for all UI text

### 5. Theme System (`lib/theme.tsx`)

- Dark mode (default)
- Light mode
- Persistent storage (localStorage)
- CSS variables for theming
- Gold accent color throughout

---

## Database Schema

### Tables

#### `bookings`
```sql
- id: UUID (primary key)
- created_at: TIMESTAMP
- passenger_name: TEXT
- phone: TEXT
- pickup: TEXT
- dropoff: TEXT (nullable)
- vehicle: TEXT ('Vito' | 'Dacia')
- trip_type: TEXT ('one_way' | 'round_trip' | 'hourly')
- hours: INTEGER (nullable, for hourly service)
- price: NUMERIC
- status: TEXT ('Pending' | 'Confirmed' | 'Cancelled')
- email: TEXT (nullable)
- room_or_passengers: TEXT (nullable)
- pickup_time: TEXT (format: "dd/MM/yyyy HH:mm")
```

**RLS Policies:**
- Anyone can INSERT (public booking form)
- Anyone can SELECT (admin dashboard)
- Anyone can UPDATE (admin actions)

**Realtime:**
- Enabled for INSERT, UPDATE, DELETE events

#### `routes`
```sql
- id: UUID (primary key)
- pickup: TEXT
- dropoff: TEXT
- vito_one_way: NUMERIC
- dacia_one_way: NUMERIC
- vito_round_trip: NUMERIC (nullable)
- dacia_round_trip: NUMERIC (nullable)
- created_at: TIMESTAMP
- UNIQUE(pickup, dropoff)
```

**RLS Policies:**
- Anyone can SELECT (for pricing calculation)
- Anyone can INSERT/UPDATE/DELETE (admin PIN-protected)

**Seed Data:**
- Casablanca ↔ Mohamed V Airport
- Casablanca ↔ Rabat
- Casablanca ↔ Marrakech

#### `settings`
```sql
- key: TEXT (primary key)
- value: TEXT
```

**Default:**
- `whatsapp_number`: '212600000000'

**RLS Policies:**
- Anyone can SELECT/INSERT/UPDATE

#### `push_subscriptions`
```sql
- id: UUID (primary key)
- user_identifier: TEXT
- endpoint: TEXT (unique)
- keys: JSONB ({p256dh, auth})
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Purpose:** Store Web Push subscriptions for admin notifications

---

## Push Notifications System

### Architecture
1. **Service Worker** (`/public/sw.js`):
   - Handles push events
   - Shows notifications with actions
   - Handles notification clicks

2. **Registration** (`lib/registerServiceWorker.ts`):
   - Registers service worker
   - Checks for updates every minute
   - Handles lifecycle events

3. **Push API** (`lib/pushNotifications.ts`):
   - Request permission
   - Subscribe/unsubscribe
   - Save subscriptions to Supabase
   - VAPID key management

4. **Admin Integration** (`components/NotificationSettings.tsx`):
   - Enable/disable UI
   - Test notifications
   - Permission status display

### Flow
1. Admin enables notifications in Settings tab
2. Browser requests permission
3. Service worker subscribes with VAPID key
4. Subscription saved to `push_subscriptions` table
5. New booking triggers Supabase Realtime
6. Backend can send push via Supabase Edge Function
7. Service worker receives push and shows notification

---

## PWA Configuration

### Manifest (`vite.config.ts`)
- **Name**: "Morocco Transfers"
- **Short Name**: "MoroccoTransfers"
- **Start URL**: `/admin/morocco-cmd`
- **Display**: standalone
- **Icons**: 192x192, 512x512
- **Theme Color**: #000000
- **Background Color**: #0a0a0a

### Service Worker
- **Registration**: Auto-update
- **Caching**: Workbox with runtime caching
- **Assets**: JS, CSS, HTML, images, fonts
- **Fonts**: Google Fonts (CacheFirst strategy)

### Install Prompt
- Detects `beforeinstallprompt` event
- Shows install banner in admin dashboard
- Provides installation instructions modal

---

## Routing

```
/                    → Index.tsx (booking form)
/confirmation        → Confirmation.tsx (booking confirmation)
/admin/morocco-cmd   → AdminDashboard.tsx (admin panel)
/*                   → NotFound.tsx (404 page)
```

**Lazy Loading:**
- Confirmation, AdminDashboard, NotFound are lazy-loaded
- Suspense fallback for loading states

---

## Styling & Design

### Theme Colors
- **Gold**: Primary accent (HSL: 43 72% 53%)
- **Dark Background**: Default theme
- **Glass Effect**: Backdrop blur with transparency
- **Gold Glow**: Box shadow for emphasis

### Typography
- **Serif**: Playfair Display (headings)
- **Sans**: Inter (body text)

### Components
- Glassmorphism design (glass cards)
- Gold gradient buttons
- Smooth animations (Framer Motion)
- Responsive grid layouts
- Mobile-first design

---

## Environment Variables

Required in `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key (for push notifications)
```

---

## Key Business Logic

### Pricing (`lib/pricing.ts`)
- **Hourly Rate**: 200 DH/hour (Vito only)
- **Transfer Prices**: From `routes` table
- **Round-trip**: Only if `vito_round_trip` exists in route
- **Price Calculation**: Matches pickup/dropoff in routes table

### Booking Validation
- Pickup/dropoff required for transfers
- Location required for hourly service
- Pickup time must be in future
- Phone number minimum 8 characters
- Name required
- Price must be calculable

### Time Slots
- Only future times available
- If today: starts from current hour + 1
- If future date: all day (00:00 - 23:30)
- 30-minute intervals

---

## Security Considerations

### Current State
- **No Authentication**: Uses PIN-based access (hardcoded `1234`)
- **Open RLS**: All tables allow public read/write
- **Admin PIN**: Stored in code (not secure)

### Recommendations
- Implement proper Supabase Auth
- Restrict RLS policies to authenticated users
- Move admin PIN to environment variable or database
- Add rate limiting for booking submissions
- Validate phone numbers server-side

---

## Performance Optimizations

1. **Code Splitting**: Lazy-loaded routes
2. **Image Optimization**: Lazy loading, proper sizing
3. **Font Loading**: Preload with swap strategy
4. **Service Worker**: Caching for offline support
5. **Real-time**: Efficient Supabase subscriptions
6. **Animations**: Framer Motion with GPU acceleration

---

## Testing

- **Test Framework**: Vitest
- **Test Files**: `src/test/`
- **Setup**: `src/test/setup.ts`

---

## Deployment

### Build
```bash
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build
```

### PWA Deployment
- Deploy to hosting (Vercel, Netlify, etc.)
- Ensure HTTPS (required for PWA)
- Configure service worker scope
- Set up VAPID keys for push notifications

---

## Known Limitations

1. **Admin PIN**: Hardcoded, not secure
2. **No User Accounts**: No customer login system
3. **No Payment Integration**: Cash on arrival only
4. **No Email Notifications**: Only WhatsApp contact
5. **Limited Route Management**: No bulk import/export
6. **No Booking Modifications**: Customers can't edit bookings
7. **No Cancellation Policy**: Admin-only cancellation

---

## Future Enhancement Opportunities

1. **Authentication**: Supabase Auth for customers and admins
2. **Payment Gateway**: Online payment integration
3. **Email Notifications**: Send booking confirmations via email
4. **SMS Integration**: WhatsApp Business API or SMS service
5. **Driver Management**: Assign drivers to bookings
6. **Calendar View**: Visual calendar for bookings
7. **Customer Portal**: View booking history
8. **Multi-currency**: Support for EUR, USD, etc.
9. **Booking Modifications**: Allow customers to edit/cancel
10. **Advanced Analytics**: Revenue forecasting, trends

---

## File Dependencies Map

### Core Dependencies
- `App.tsx` → Routes, Providers (Theme, I18n, Query)
- `Index.tsx` → `lib/pricing.ts`, `supabase/client.ts`
- `AdminDashboard.tsx` → `supabase/client.ts`, `lib/pushNotifications.ts`
- `Confirmation.tsx` → `supabase/client.ts` (for WhatsApp number)

### Utility Dependencies
- `lib/pricing.ts` → `supabase/client.ts`
- `lib/pushNotifications.ts` → `supabase/client.ts`, `lib/registerServiceWorker.ts`
- `lib/i18n.tsx` → React Context (standalone)
- `lib/theme.tsx` → React Context (standalone)

---

## Critical Code Locations

### Booking Submission
- **File**: `src/pages/Index.tsx`
- **Function**: `handleSubmit()` (line ~111)
- **Action**: Inserts into `bookings` table

### Price Calculation
- **File**: `src/lib/pricing.ts`
- **Function**: `calculatePriceFromRoutes()` (line ~36)

### Real-time Subscription
- **File**: `src/pages/AdminDashboard.tsx`
- **Location**: `useEffect` hook (line ~297)
- **Channel**: `admin-bookings`

### Admin Authentication
- **File**: `src/pages/AdminDashboard.tsx`
- **PIN**: Hardcoded `1234` (line ~22)
- **Function**: `handlePinComplete()` (line ~336)

---

## Summary

This is a **well-structured, modern web application** with:
- ✅ Clean architecture
- ✅ Real-time updates
- ✅ PWA capabilities
- ✅ Multi-language support
- ✅ Responsive design
- ✅ Admin dashboard with analytics
- ⚠️ Security improvements needed (auth, RLS)
- ⚠️ Some hardcoded values (admin PIN)

The codebase is **maintainable** and **extensible**, making it easy to add new features or modify existing ones.

