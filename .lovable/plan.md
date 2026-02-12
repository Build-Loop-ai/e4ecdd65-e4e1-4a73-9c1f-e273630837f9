

# Admin Dashboard

## Overview
Build a secure admin page at `/dashboard/admin` that gives you (the business owner) a bird's-eye view of the entire platform: all users, all pitches, all activity, and key business metrics.

## What You'll See

### 1. Platform KPIs (top row of cards)
- Total registered users
- Total pitches created (and breakdown by status: draft / sent / feedback received)
- Total page views (all time + last 7 days)
- Total leads saved
- Total outreach emails sent
- Total feedback submissions

### 2. Users Table
- List of every user: email, sign-up date, number of pitches, number of leads, last active
- Ability to view details about each user's activity

### 3. Pitches Table
- All pitches across all users: client name, owner email, status, views count, created date
- Sortable columns

### 4. Recent Activity Feed
- Latest visits, feedback submissions, and emails sent across the platform
- Chronological timeline view

### 5. Email Health Overview
- All connected email accounts, their Warmy status, deliverability scores, and warmup temperature

## Security Approach

**Role-based access using a `user_roles` table** (not stored on profiles -- follows security best practices):

1. Create a `user_roles` table with an `app_role` enum (`admin`, `user`)
2. Create a `has_role()` security definer function to check roles without RLS recursion
3. Add RLS policies so only admins can read all data across tables
4. Assign your account (`luuk@alleman.nl`) as admin via a seed migration
5. Frontend checks role before rendering the admin page; non-admins get redirected

## Technical Steps

### Database Migration
- Create `app_role` enum with values `admin` and `user`
- Create `user_roles` table (user_id, role) with RLS enabled
- Create `has_role()` security definer function
- Add RLS policy: users can read their own roles; admins can read all
- Insert admin role for your user ID (`95a6d010-4297-4599-a3ef-6ad4eb7470b2`)

### New Files
- `src/pages/Admin.tsx` -- the admin dashboard page with tabs: Overview, Users, Pitches, Activity, Email
- `src/hooks/useAdminData.ts` -- hook that fetches cross-user data using service-level edge function
- `src/hooks/useUserRole.ts` -- hook to check if current user has admin role
- `src/components/admin/AdminGuard.tsx` -- wrapper that redirects non-admins
- `supabase/functions/admin-data/index.ts` -- edge function that uses the service role key to query all data across users (bypasses RLS safely on the server)

### Route Addition
- Add `/dashboard/admin` route in `App.tsx` wrapped with `ProtectedRoute` and `AdminGuard`
- Add "Admin" nav item in `DashboardLayout.tsx` sidebar, only visible to admin users

### Edge Function (`admin-data`)
The admin page needs to read data across all users, but RLS restricts each user to their own data. The edge function uses the service role key server-side to safely aggregate:
- User count and list from `auth.users` (via admin API)
- All pitches, visits, leads, feedback, emails, and email connections

### UI Design
- Clean, minimal design matching the existing dashboard aesthetic
- Tabbed layout (Overview / Users / Pitches / Activity / Email Health)
- Stat cards at the top with platform-wide KPIs
- Data tables with sorting for Users and Pitches tabs
- Uses existing components: `DashboardLayout`, `Tabs`, `Table`, `Card`, `Badge`, `Skeleton`

