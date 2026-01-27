
# Dashboard Enhancement and Analytics Implementation Plan

## Overview

This plan transforms the basic dashboard into a comprehensive management hub with powerful analytics to help users understand who is viewing their preview websites. The core idea is to track every visit to the `/preview/:slug` pages and provide actionable insights.

## What You Will Get

### 1. Enhanced Dashboard Layout
The dashboard will be restructured with a sidebar navigation and multiple sections:
- **Overview** - Quick stats cards showing total previews, total views, feedback count, and active previews
- **Previews** - The existing preview cards (improved)
- **Analytics** - Dedicated analytics page with charts and insights

### 2. Visit Tracking System
Every time someone visits a preview website (`/preview/:slug`), the system will log:
- Which preview was viewed
- When they visited
- How long they stayed (session duration)
- Their general location (country/city via IP geolocation)
- Device type (desktop/tablet/mobile)
- Referrer source (where they came from)

### 3. Analytics Dashboard Features
- **Total Views Chart** - Line/bar chart showing views over time (last 7, 14, 30 days)
- **Per-Preview Breakdown** - See which previews are getting the most attention
- **Device Distribution** - Pie chart showing desktop vs mobile vs tablet
- **Geographic Insights** - Where your viewers are located
- **Recent Visitors Table** - Live feed of recent visits with details
- **Engagement Metrics** - Average time on page, bounce indicators

### 4. Dashboard Quick Stats
At the top of the dashboard, you will see:
- Total views across all previews (with trend indicator)
- Active previews count
- Unread feedback count
- Views this week vs last week comparison

---

## Technical Implementation

### Database Changes

**New Table: `preview_visits`**
```
- id (UUID, primary key)
- preview_id (UUID, foreign key to client_previews)
- visited_at (timestamp)
- session_duration (integer, seconds - nullable)
- device_type (text: desktop/tablet/mobile)
- country (text, nullable)
- city (text, nullable)
- referrer (text, nullable)
- user_agent (text, nullable)
- ip_hash (text - hashed for privacy)
```

**RLS Policies:**
- Anyone can INSERT (for public preview tracking)
- Preview owners can SELECT their own visits

### New Edge Function: `track-visit`
A lightweight edge function that:
1. Receives visit data from the Preview page
2. Performs IP geolocation (using a free API)
3. Inserts the visit record
4. Returns success

### Frontend Changes

**New Files:**
- `src/pages/Analytics.tsx` - Dedicated analytics page
- `src/components/dashboard/DashboardLayout.tsx` - Sidebar layout wrapper
- `src/components/dashboard/StatsCards.tsx` - Overview stat cards
- `src/components/dashboard/ViewsChart.tsx` - Line/bar chart for views over time
- `src/components/dashboard/DeviceBreakdown.tsx` - Pie chart for devices
- `src/components/dashboard/RecentVisitors.tsx` - Table of recent visits
- `src/components/dashboard/PreviewAnalytics.tsx` - Per-preview analytics card
- `src/hooks/useAnalytics.ts` - Custom hook for fetching analytics data

**Modified Files:**
- `src/pages/Dashboard.tsx` - Add sidebar, quick stats, integrate new layout
- `src/pages/Preview.tsx` - Add visit tracking on page load
- `src/App.tsx` - Add `/analytics` route

### Key UI Components

**Dashboard Sidebar:**
```
+------------------+
| PreviewPro       |
+------------------+
| Overview         | <- Stats cards
| Previews         | <- Existing cards  
| Analytics        | <- New page
+------------------+
| Settings         |
| Sign Out         |
+------------------+
```

**Analytics Page Layout:**
```
+------------------------------------------+
| Analytics                                 |
+------------------------------------------+
| [Total Views] [Unique Visitors] [Avg Time]|
+------------------------------------------+
| Views Over Time Chart                     |
| [7 days] [14 days] [30 days]             |
+------------------------------------------+
| [Device Breakdown]  | [Top Previews]     |
+------------------------------------------+
| Recent Visitors                          |
| Preview | Location | Device | Time       |
+------------------------------------------+
```

---

## Implementation Steps

### Step 1: Database Setup
1. Create `preview_visits` table with appropriate columns
2. Add RLS policies for secure access
3. Enable the table for realtime (optional, for live visitor feed)

### Step 2: Visit Tracking Edge Function
1. Create `track-visit` edge function
2. Handle CORS for browser requests
3. Implement IP geolocation using free API
4. Parse user agent for device detection
5. Hash IP for privacy

### Step 3: Preview Page Integration
1. Modify `Preview.tsx` to call the tracking edge function on mount
2. Implement session duration tracking (track when user leaves)
3. Detect device type from window/navigator

### Step 4: Dashboard Restructure
1. Create `DashboardLayout` with sidebar navigation
2. Implement `StatsCards` component with animated counters
3. Add quick stats row at top of dashboard
4. Integrate existing preview cards into new layout

### Step 5: Analytics Page
1. Create main Analytics page with date range selector
2. Build `ViewsChart` using Recharts (already installed)
3. Build `DeviceBreakdown` pie chart
4. Build `RecentVisitors` table with sorting
5. Add per-preview filtering

### Step 6: Analytics Hook
1. Create `useAnalytics` hook for data fetching
2. Implement date range filtering
3. Add loading and error states
4. Cache data for performance

---

## Privacy Considerations

- IP addresses are hashed (SHA-256) before storage - original IPs are never stored
- No cookies or persistent identifiers are used
- Only aggregate location data (city/country) is stored
- Compliant with GDPR principles
- Users can see who viewed their previews but viewers remain semi-anonymous

---

## Existing Patterns Used

- Follows the existing Supabase client patterns from `client.ts`
- Uses existing UI components (Card, Badge, Button, Skeleton)
- Matches the existing dashboard styling
- Leverages already-installed Recharts for visualizations
- Uses the existing toast system for notifications
- Follows the established RLS policy patterns

---

## Summary of Deliverables

| Component | Type | Purpose |
|-----------|------|---------|
| `preview_visits` table | Database | Store visit data |
| `track-visit` function | Edge Function | Process and log visits |
| `DashboardLayout.tsx` | Component | Sidebar navigation wrapper |
| `StatsCards.tsx` | Component | Quick overview stats |
| `Analytics.tsx` | Page | Full analytics dashboard |
| `ViewsChart.tsx` | Component | Views over time visualization |
| `DeviceBreakdown.tsx` | Component | Device type pie chart |
| `RecentVisitors.tsx` | Component | Live visitor table |
| `useAnalytics.ts` | Hook | Data fetching logic |
| Updated `Dashboard.tsx` | Modified | Integrated with new layout |
| Updated `Preview.tsx` | Modified | Visit tracking on load |
| Updated `App.tsx` | Modified | New route for analytics |

