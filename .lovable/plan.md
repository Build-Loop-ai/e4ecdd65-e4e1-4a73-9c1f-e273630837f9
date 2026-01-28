

# Enhanced Lead Management - Save & Organize Leads

## Overview

Transform the current Lead Finder into a full lead management system where all fetched leads are automatically saved for later use, with intuitive organization and tracking.

## Current State

- Leads are only saved when "Create Pitch" is clicked
- No way to view previously discovered leads
- Search results are lost when navigating away

## Proposed UX Design

### Two-Tab Interface

```text
+--------------------------------------------------+
|  Find Leads                                       |
+--------------------------------------------------+
|  [🔍 Search]    [📋 My Leads (47)]              |
+--------------------------------------------------+
```

**Tab 1: Search** - Find new businesses
**Tab 2: My Leads** - View/manage saved leads

### Search Tab Behavior

1. User enters query (e.g., "barbers in zaandam")
2. Results displayed in cards (current design)
3. **NEW**: "Save All" button appears above results
4. **NEW**: Individual "Save" button per card (if not already saved)
5. **NEW**: Visual indicator for already-saved leads (checkmark badge)

### My Leads Tab Features

```text
+--------------------------------------------------+
|  [Filter by Status ▼] [Filter by City ▼] [Sort ▼]|
+--------------------------------------------------+
|  □  Select All                         47 leads  |
+--------------------------------------------------+
|  □  Kapsalon Amsterdam    ★ 4.8   [new]    [...] |
|     barbers in zaandam    amsterdam              |
|     🌐 website  📧 email  📱 phone               |
+--------------------------------------------------+
|  □  The Barber Shop       ★ 4.5   [pitched] [...] |
|     barbers in zaandam    zaandam                |
|     🌐 website  📱 phone                         |
+--------------------------------------------------+

Selected: 2 leads    [Create Pitches] [Delete]
```

**Features:**
- **Filtering**: By status (new, pitched, converted), city, category
- **Sorting**: By date added, rating, name
- **Bulk selection**: Checkboxes for multi-select
- **Bulk actions**: Create pitches, delete
- **Status badges**: Color-coded (new=blue, pitched=yellow, converted=green)
- **Source query**: Shows which search found this lead

### Status Flow

```text
[new] → User creates pitch → [pitched] → Client converts → [converted]
```

## Technical Implementation

### 1. Duplicate Detection

Before saving, check if lead already exists by matching:
- `website_url` (primary identifier)
- OR `business_name + city` combination

```typescript
// Check for existing lead
const { data: existing } = await supabase
  .from('leads')
  .select('id')
  .eq('user_id', user.id)
  .eq('website_url', lead.website_url)
  .maybeSingle();
```

### 2. New Components

| Component | Purpose |
|-----------|---------|
| `LeadsTabs.tsx` | Tab navigation between Search and My Leads |
| `SavedLeadsList.tsx` | Table/grid of saved leads with filters |
| `LeadFilters.tsx` | Filter dropdowns for status, city, category |
| `BulkActionsBar.tsx` | Actions bar when leads are selected |

### 3. State Management

```typescript
// Track which fetched leads are already saved
const [savedLeadUrls, setSavedLeadUrls] = useState<Set<string>>(new Set());

// On search, check which results are already in DB
const checkExistingLeads = async (results: ApifyLead[]) => {
  const urls = results.map(r => r.website_url).filter(Boolean);
  const { data } = await supabase
    .from('leads')
    .select('website_url')
    .eq('user_id', user.id)
    .in('website_url', urls);
  setSavedLeadUrls(new Set(data?.map(d => d.website_url)));
};
```

### 4. Save All Function

```typescript
const handleSaveAll = async () => {
  const newLeads = results.filter(
    lead => lead.website_url && !savedLeadUrls.has(lead.website_url)
  );
  
  const { data, error } = await supabase
    .from('leads')
    .insert(newLeads.map(lead => ({
      user_id: user.id,
      business_name: lead.business_name,
      website_url: lead.website_url,
      // ... other fields
      source_query: searchQuery,
      status: 'new',
    })))
    .select();
    
  // Update UI to show saved state
  if (data) {
    setSavedLeadUrls(prev => new Set([...prev, ...data.map(d => d.website_url)]));
    toast({ title: `Saved ${data.length} new leads` });
  }
};
```

### 5. Fetching Saved Leads

```typescript
const { data: savedLeads, isLoading } = useQuery({
  queryKey: ['leads', user?.id, filters],
  queryFn: async () => {
    let query = supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.city) query = query.eq('city', filters.city);
    
    return query;
  },
});
```

## UI Components Summary

### Search Results Card (Updated)

```text
┌────────────────────────────────────────┐
│  Kapsalon Amsterdam           ✓ Saved  │  ← Badge if already saved
│  [Barber shop]                         │
│                                        │
│  🌐 kapsalonamsterdam.nl              │
│  📧 info@kapsalon.nl                  │
│  📱 +31 20 123 4567                   │
│  📍 Amsterdam                          │
│  ★ 4.5                                │
│                                        │
│  [Save] [Create Pitch] [↗]            │  ← Save button OR disabled if saved
└────────────────────────────────────────┘
```

### Saved Leads Table Row

```text
┌──┬────────────────────┬─────────┬────────────┬─────────┬──────────┐
│☐ │ Business           │ Contact │ Query      │ Status  │ Actions  │
├──┼────────────────────┼─────────┼────────────┼─────────┼──────────┤
│☐ │ Kapsalon Amsterdam │ 🌐📧📱  │ barbers... │ [new]   │ [•••]    │
│  │ ★ 4.8 · Amsterdam  │         │ 2 days ago │         │          │
└──┴────────────────────┴─────────┴────────────┴─────────┴──────────┘
```

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/Leads.tsx` | Modify | Add tabs, save functionality |
| `src/components/leads/LeadsTabs.tsx` | Create | Tab navigation component |
| `src/components/leads/SavedLeadsList.tsx` | Create | Saved leads table with filters |
| `src/components/leads/LeadCard.tsx` | Create | Reusable lead card component |
| `src/components/leads/LeadFilters.tsx` | Create | Filter dropdowns |
| `src/components/leads/BulkActionsBar.tsx` | Create | Bulk action buttons |
| `src/hooks/useLeads.ts` | Create | Custom hook for lead operations |

## Implementation Order

1. Create `useLeads` hook for CRUD operations
2. Extract `LeadCard` component from current code
3. Add "Save" and "Save All" functionality to search
4. Build `SavedLeadsList` with table view
5. Add `LeadFilters` component
6. Implement bulk selection and actions
7. Add tab navigation wrapper

