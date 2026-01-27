
# Enhanced Scanning Experience & Live Template Previews

## Overview
Transform the website generation flow into a visually immersive experience where users can see exactly what's being extracted in real-time, and then view their actual scraped content rendered in mini template previews before making a selection.

## Current State
- **Scanning/Processing**: Shows a generic spinner with basic text ("Scraping Website...", "Processing Content with AI...")
- **Template Selection**: Static placeholder boxes with gray rectangles, no actual content shown
- Users can't see what data is being extracted or how their content will look

## What Changes

### Part 1: Immersive Scanning Experience

#### New Visual Extraction Flow
Create a dynamic, animated scanning interface that shows:

1. **Phase 1 - Website Discovery**
   - Animated globe/website icon with scanning rays
   - URL being analyzed with typewriter effect
   - "Connecting to website..." message

2. **Phase 2 - Content Extraction (Show Real Data)**
   - **Logo Found**: Display the actual extracted logo with a fade-in animation
   - **Colors Detected**: Show color swatches appearing one by one
   - **Images Found**: Counter animating up (e.g., "12 images found")
   - **Text Extracted**: Show company name and tagline appearing
   - Each item appears with a satisfying checkmark animation

3. **Phase 3 - AI Processing**
   - Show sections being created: "Creating Hero Section...", "Organizing Services...", "Building Gallery..."
   - Progress indicators for each section
   - Visual representation of content being organized

#### UI Components Needed
- `ScanningAnimation` component with multiple phases
- Real-time data display as it's extracted
- Animated progress indicators per extraction type
- Color swatch animations for brand colors

### Part 2: Live Template Previews with Real Content

#### Template Cards with Actual Scraped Content
Instead of gray placeholder boxes, show mini-renders of the actual content:

**Corporate Classic Preview:**
- Background: First extracted hero image (or gradient with primary color)
- Logo: Actual scraped logo (sized down)
- Headline: First ~20 chars of actual headline
- Service boxes: Show actual service count/names
- Color accents: Use extracted primary color

**Modern Professional Preview:**
- Same data but with modern layout treatment
- Show horizontal scroll preview with actual gallery images (thumbnails)
- Animated gradient orbs using extracted brand colors
- Bold typography preview with actual headline

#### Data to Display in Mini-Previews
From `processedSchema`:
- `hero.headline` (truncated)
- `hero.backgroundImages[0]` (as thumbnail)
- `companyName`
- `services.length` count or first service title
- `gallery.images` (3-4 thumbnails in scroll preview)

From `scrapedData.branding`:
- `colors.primary` for accents
- `logo` for company logo

## Technical Implementation

### File 1: Create `src/components/preview/ScanningProgress.tsx`
New component for the immersive scanning experience:
- Accepts `phase`, `scrapedData`, `processedSchema` as props
- Shows different animations/content based on current phase
- Displays real extracted data as it becomes available
- Uses framer-motion for smooth animations
- Shows: logo, colors, image count, company name as they're extracted

### File 2: Update `src/pages/NewPreview.tsx`
Major updates:
- Replace simple spinner card with `ScanningProgress` component
- Pass real-time data to scanning component
- Update template selection to show actual scraped content
- Add color extraction display to template cards
- Use actual images in mini-preview thumbnails
- Apply brand colors to template accents

### Scanning Phases (State Machine)
```text
'url' -> 'connecting' -> 'extracting' -> 'processing' -> 'template' -> 'complete'
                              |               |
                              v               v
                        Show extracted    Show sections
                        data live         being built
```

### Template Preview Updates
```text
Template Card Structure:
- Mini hero with actual bg image or brand gradient
- Actual logo (scaled down)
- Actual headline text (truncated)
- Actual primary color as accent
- Gallery thumbnails (if modern template)
- Service count indicator
```

## Visual Design Details

### Scanning Animation Elements
- Pulsing rings around central icon (like radar)
- Checkmarks appearing next to completed extractions
- Data values animating/counting up
- Smooth transitions between phases
- Color swatches expanding from a center point
- Logo fading in with scale animation

### Template Preview Enhancements
- Subtle shadow and hover effects
- Live color theming based on extracted colors
- Micro-animations on selection
- "Best for your content" badge if one template suits better

## Files to Modify/Create

1. **Create**: `src/components/preview/ScanningProgress.tsx`
   - New immersive scanning animation component
   - Multiple phase support
   - Real-time data display

2. **Update**: `src/pages/NewPreview.tsx`
   - Add more granular step states
   - Integrate ScanningProgress component
   - Update template selection with real scraped content
   - Add brand color application to template cards
   - Show actual images and headlines in mini-previews

## Expected User Experience

1. User enters URL and clicks "Analyze Website"
2. **Connecting phase**: Animated connection visualization
3. **Extracting phase**: 
   - Logo appears with checkmark
   - Color swatches animate in
   - "15 images found" counter
   - Company name fades in
4. **Processing phase**: 
   - "Creating Hero Section..." with progress
   - "Organizing Services..." 
   - "Building Gallery..."
5. **Template Selection**:
   - Both templates show actual scraped content
   - User sees their logo, colors, headline in both layouts
   - Makes informed decision based on how their content looks

This creates an engaging, premium experience that shows the value of the AI processing and helps users make better template decisions!
