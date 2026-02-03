

# Fix Warmy API Authentication Headers

## Problem
The Warmy API is returning `401: You need to sign in or sign up` because we're using incorrect authentication headers.

## Root Cause
According to the Warmy API documentation you provided, the correct headers are:
- `Authorization: Bearer your_token`
- `Holder-Uid: a66a9a755fe16f24fcb99dc8b5f25a50`
- `Content-Type: application/json`

But our code currently uses:
- `access-token: WARMY_API_KEY`
- `uid: WARMY_UID`
- `holder-uid: WARMY_HOLDER_UID`

## Solution
Update all three Warmy edge functions to use the correct header format:

### Changes Required

**1. `warmy-register/index.ts`**
- Change headers from `access-token`/`uid`/`holder-uid` to:
  ```javascript
  headers: {
    "Authorization": `Bearer ${WARMY_API_KEY}`,
    "Holder-Uid": WARMY_HOLDER_UID,
    "Content-Type": "application/json",
  }
  ```
- Remove the `WARMY_UID` requirement since it's not needed

**2. `warmy-sync/index.ts`**
- Update headers to same format for the GET mailboxes request

**3. `warmy-actions/index.ts`**
- Update headers to same format for all Warmy API calls (pause, resume, test, disconnect, get_details, get_alerts)

### Cleanup
- Remove `WARMY_UID` from environment variable checks since the API only needs:
  - `WARMY_API_KEY` (your API token)
  - `WARMY_HOLDER_UID` (your account identifier: `a66a9a755fe16f24fcb99dc8b5f25a50`)

---

## Technical Details

The fix is straightforward - we just need to match the header format from the official Warmy API documentation exactly:

```text
Before (wrong):
┌─────────────────────────────────┐
│ access-token: {API_KEY}         │
│ uid: {UID}                      │
│ holder-uid: {HOLDER_UID}        │
└─────────────────────────────────┘

After (correct per docs):
┌─────────────────────────────────┐
│ Authorization: Bearer {API_KEY} │
│ Holder-Uid: {HOLDER_UID}        │
└─────────────────────────────────┘
```

