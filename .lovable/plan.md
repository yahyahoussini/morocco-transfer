

## Plan: Add Delete Booking Feature to Admin Dashboard

### Overview
Add the ability to delete bookings from the admin dashboard, including a confirmation dialog to prevent accidental deletions.

### Changes Required

#### 1. Database: Add DELETE RLS policy for bookings
- Add a new Row-Level Security policy to allow deleting records from the `bookings` table (currently only INSERT, UPDATE, and SELECT are allowed).

#### 2. Code: Add delete functionality to `src/pages/AdminDashboard.tsx`
- **Add a `deleteBooking` function** that calls `supabase.from("bookings").delete().eq("id", id)` and removes the booking from local state.
- **Add a delete button (Trash2 icon)** in the booking detail dialog (when you tap a booking card) alongside the existing Confirm/Cancel actions.
- **Add a confirmation dialog** using `AlertDialog` to ask "Are you sure you want to delete this booking?" before proceeding, preventing accidental deletions.
- **Add translations** for the delete-related labels (`deleteBooking`, `confirmDelete`, `bookingDeleted`) in the i18n dictionary for EN, FR, and AR.

#### 3. Code: Update `src/lib/i18n.tsx`
- Add translation keys:
  - `deleteBooking`: "Delete" / "Supprimer" / "حذف"
  - `confirmDeleteTitle`: "Delete Booking?" / "Supprimer la reservation?" / "حذف الحجز؟"
  - `confirmDeleteMsg`: "This action cannot be undone." / "Cette action est irreversible." / "لا يمكن التراجع عن هذا الإجراء."
  - `bookingDeleted`: "Booking deleted" / "Reservation supprimee" / "تم حذف الحجز"

### Technical Details
- The `AlertDialog` component is already available in the project (`src/components/ui/alert-dialog.tsx`).
- The `Trash2` icon is already imported in the admin dashboard.
- The Realtime channel already listens for INSERT and UPDATE; a DELETE listener will also be added so if a booking is deleted from another session, it reflects in real time.

