
# Maker View - Full Preview Management Interface

## Overview
Create a dedicated "Maker View" page that opens when clicking "View" on the dashboard (instead of opening in a new tab). This view shows the live preview with a floating sidebar/panel containing all the management tools the maker/owner needs to manage, edit, and track their client preview.

## Current Behavior
- Clicking "View" on Dashboard opens `/preview/:slug` in a new tab
- This is the same view clients see - no owner tools
- Feedback is on a separate page (`/feedback/:previewId`)
- No way to edit content, change template, or update status inline

## Proposed Solution

### New Route: `/manage/:id`
Create a new protected route that combines:
1. Live preview display (iframe or embedded component)
2. Floating maker toolbar with all management actions
3. Inline editing capabilities
4. Feedback panel
5. Quick actions (copy link, share, regenerate)

### Maker View Features

**Toolbar/Panel Actions:**
- **Preview Controls**: Toggle between desktop/tablet/mobile views
- **Share**: Copy client link, open in new tab, mark as "sent"
- **Template**: Switch between templates and see changes live
- **Status**: Update status (draft/sent/feedback_received)
- **Feedback**: View client feedback inline in a slide-out panel
- **Edit Mode**: Toggle inline editing for headline, about section, etc.
- **Color Editor**: Tweak brand colors with color pickers
- **Regenerate**: Re-scrape website or re-process with AI
- **Delete**: Delete the preview with confirmation
- **Back to Dashboard**: Return navigation

**Visual Layout:**
```text
+------------------------------------------+
|  [Back] PreviewPro - Managing: TimeForHair  |
+------------------------------------------+
|  [Desktop] [Tablet] [Mobile]   [Share v] |
|  [Edit Mode] [Feedback (2)]    [Settings]|
+------------------------------------------+
|                                          |
|           +------------------+           |
|           |                  |           |
|           |   LIVE PREVIEW   |           |
|           |    (iframe)      |           |
|           |                  |           |
|           +------------------+           |
|                                          |
+------------------------------------------+
```

## Technical Implementation

### 1. Create New Page: `src/pages/ManagePreview.tsx`
- Fetches preview by ID (not slug) with ownership check
- Renders the preview in a resizable iframe container
- Includes floating management toolbar
- Responsive viewport simulator (desktop/tablet/mobile)

### 2. Update Dashboard: `src/pages/Dashboard.tsx`
- Change "View" button from `target="_blank"` to navigate to `/manage/:id`
- Add a separate "Open Preview" external link button
- Update button labels for clarity

### 3. Update App Routing: `src/App.tsx`
- Add new protected route `/manage/:id` -> `ManagePreview`

### 4. Create Management Components

**`src/components/manage/ManageToolbar.tsx`:**
- Floating toolbar with all action buttons
- Responsive viewport selector
- Share dropdown menu
- Status selector

**`src/components/manage/FeedbackPanel.tsx`:**
- Slide-out panel showing client feedback
- Mark as read functionality
- Feedback count badge

**`src/components/manage/PreviewFrame.tsx`:**
- Responsive iframe container
- Device frame styling (optional phone/tablet bezels)
- Zoom controls

**`src/components/manage/QuickEdit.tsx`:**
- Modal/drawer for quick content edits
- Edit headline, about text, CTA text
- Color picker for brand colors
- Template switcher

### 5. Data Flow

```text
ManagePreview
    |
    +-- Fetch preview by ID (with user_id check)
    |
    +-- ManageToolbar
    |       - Status updates
    |       - Template switch
    |       - Share actions
    |       - Edit mode toggle
    |
    +-- PreviewFrame
    |       - Renders /preview/:slug in iframe
    |       - Viewport simulation
    |
    +-- FeedbackPanel (slide-out)
    |       - List of feedback
    |       - Mark as read
    |
    +-- QuickEdit (modal)
            - Edit processed_schema fields
            - Edit brand_colors
            - Save changes to Supabase
```

## Files to Create/Modify

### New Files:
1. **`src/pages/ManagePreview.tsx`** - Main maker view page
2. **`src/components/manage/ManageToolbar.tsx`** - Floating action toolbar
3. **`src/components/manage/FeedbackPanel.tsx`** - Inline feedback panel
4. **`src/components/manage/PreviewFrame.tsx`** - Responsive preview container
5. **`src/components/manage/QuickEdit.tsx`** - Content/color editor modal

### Modified Files:
1. **`src/App.tsx`** - Add `/manage/:id` route
2. **`src/pages/Dashboard.tsx`** - Update "View" button to navigate to manage page

## Detailed Component Specifications

### ManagePreview.tsx
- Protected route (requires auth + ownership)
- State: `preview`, `viewport` ('desktop'|'tablet'|'mobile'), `editMode`, `feedbackOpen`
- Fetches full preview data including feedback count
- URL: `/manage/:id` where id is the preview UUID

### ManageToolbar.tsx
Props:
- `preview`: Full preview data
- `viewport`: Current viewport
- `onViewportChange`: Viewport setter
- `onStatusChange`: Update status in DB
- `onTemplateChange`: Switch template + update DB
- `onOpenFeedback`: Toggle feedback panel
- `onEdit`: Open quick edit modal
- `onShare`: Copy link / open external
- `onDelete`: Delete with confirmation
- `feedbackCount`: Number of unread feedback items

### PreviewFrame.tsx
Props:
- `slug`: Preview slug for iframe src
- `viewport`: Current viewport for sizing

Viewport sizes:
- Desktop: 100% width, min 1024px
- Tablet: 768px centered
- Mobile: 375px centered with device frame

### FeedbackPanel.tsx
Props:
- `previewId`: For fetching feedback
- `isOpen`: Panel visibility
- `onClose`: Close handler
- Inline feedback management (same as existing Feedback page but in a sheet/drawer)

### QuickEdit.tsx
Props:
- `preview`: Current preview data
- `isOpen`: Modal visibility
- `onClose`: Close handler
- `onSave`: Save updated data to Supabase

Editable fields:
- Hero headline & subheadline
- CTA text
- About section title & description
- Primary & secondary colors (color pickers)
- Template selection

## Expected User Flow

1. User clicks "View" on Dashboard card
2. Navigates to `/manage/:previewId`
3. Sees live preview in center with toolbar at top
4. Can switch between device views (desktop/tablet/mobile)
5. Can open feedback panel to see/manage client responses
6. Can click "Edit" to modify content or colors
7. Can change template and see it update live
8. Can copy shareable link or open in new tab
9. Can update status (draft → sent)
10. "Back to Dashboard" returns to main view

This creates a comprehensive management experience where makers have full control over their previews without leaving the app!
