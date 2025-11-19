# Registration Poster Upload Feature

## Overview
This feature automatically shows a modal to users after they sign in or register, asking them to upload a photo with the PECFest poster. The modal appears only **once per user** and will not show again after they submit.

## Files Added

### Backend
1. **`src/lib/dbConnectRegistration.ts`** - Separate DB connector for registration data
2. **`src/models/RegistrationForm.ts`** - Mongoose model to store poster images (as raw Buffer)
3. **`src/app/api/registration-form/route.ts`** - API endpoints:
   - `POST /api/registration-form` - Upload poster image
   - `GET /api/registration-form?userId=...&email=...` - Check if user has submitted

### Frontend
4. **`src/components/PosterUploadModal.tsx`** - Modal UI with poster display and image upload
5. **`src/components/PosterUploadHandler.tsx`** - Logic to check and show modal only once
6. **`src/app/(public)/layout.tsx`** - Integrated handler into layout

## Environment Variables

Add to `.env.local` (optional):
```env
# Optional: Use a separate MongoDB database for registration forms
MONGODB_URI_REGISTRATION=mongodb+srv://user:pass@host/pecfest_registration

# If not set, the system will:
# 1. Try to derive a DB name by appending "_registration" to MONGODB_URI
# 2. Fall back to using the same DB as MONGODB_URI
```

## How It Works

1. **User Authentication**: When a user signs in or registers, `PosterUploadHandler` component checks their auth status
2. **Form Check**: Makes API call to `/api/registration-form?userId=...` to see if they've already submitted
3. **Modal Display**: If not submitted, shows `PosterUploadModal` after 1 second delay
4. **One-Time Show**: Modal won't show again in the same session (tracked via `hasChecked` state)
5. **Database Check**: On subsequent visits, API checks MongoDB and won't show modal if already submitted

## User Flow

```
User Signs In/Registers
        ↓
PosterUploadHandler checks API
        ↓
    Has submitted? ─── YES → No modal shown
        ↓ NO
    Wait 1 second
        ↓
Show PosterUploadModal
        ↓
User uploads image ─── SKIP → Modal closes, won't show in session
        ↓ UPLOAD
Save to MongoDB (Buffer)
        ↓
Success message → Auto-close
        ↓
Won't show again (ever)
```

## Image Storage

- Images are stored as **raw Buffer** in MongoDB (field: `posterImage`)
- Maximum file size: **5MB**
- Accepted formats: All image types (`image/*`)
- Additional metadata stored:
  - `posterMimeType` (e.g., 'image/jpeg')
  - `posterFilename`
  - `posterTakenAt` (timestamp)

## API Endpoints

### POST /api/registration-form
Upload poster image for a user.

**Request (FormData):**
- `userId` (string, required)
- `email` (string, required)
- `isFirstTime` (boolean)
- `posterImage` (File, required, max 5MB)

**Response:**
```json
{
  "success": true,
  "message": "Poster uploaded successfully",
  "formId": "..."
}
```

**Error Cases:**
- Missing fields → 400
- Already submitted → 400 with `alreadyExists: true`
- Server error → 500

### GET /api/registration-form
Check if user has submitted the form.

**Query Parameters:**
- `userId` (string) OR `email` (string) - at least one required

**Response:**
```json
{
  "hasSubmitted": true,
  "submittedAt": "2025-11-19T..."
}
```

## Notes

- Modal appears with smooth animations (framer-motion)
- Poster image (`/public/poster.png`) is displayed in the modal
- User can skip the upload (but will be asked again on next visit if not in same session)
- Upload is validated: image type and size checks
- Success state shown before auto-close (2 second delay)
- Backdrop prevents accidental closes during upload

## Testing

1. Sign in with a new user account
2. Modal should appear after ~1 second
3. Upload an image → Check MongoDB for the Buffer data
4. Refresh page → Modal should NOT appear again
5. Sign in with a different user → Modal should appear for them too
