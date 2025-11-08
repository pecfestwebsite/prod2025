# Email Flow Documentation - Pecfest 2025

## Overview
This document outlines the complete email notification system for registration and admin verification processes.

---

## 📧 Email Flow Scenarios

### 1️⃣ **User Registers for Event** (POST `/api/registrations`)

**Trigger:** User submits registration form

**Emails Sent:**
- ✅ **Registration Confirmation** → User
  - Function: `sendRegistrationConfirmationEmail()`
  - To: User's email address
  - Subject: `Registration Confirmed - {EventName} | Pecfest 2025`
  - Content: 
    - Registration details (Event, Team, Fees)
    - For FREE events: "You're all set! Registration complete"
    - For PAID events: "Registration submitted, awaiting admin verification"
    - Event date/time and location
    - Team ID (if applicable)
    - Accommodation details (if requested)
  - Attachments: Payment receipt (for team leaders only)

**Logging:**
```
📧 Sending registration confirmation email to user: {email}
   Event: {eventName} ({eventId})
   Paid: Yes/No | Team: {teamId/Individual}
```

---

### 2️⃣ **Admin Verifies Registration** (PUT `/api/registrations/[id]`)

**Trigger:** Admin marks registration as `verified: true`

**Emails Sent:**

#### A. **User Verification Email** → User (ONLY if verified = true)
- Function: `sendUserVerificationEmail()`
- To: User's email address
- Subject: `✓ Registration Verified - {EventName}`
- Content:
  - Congratulations message with green "✓ VERIFIED" badge
  - Event details
  - Team ID (if applicable)
  - Fees paid status
  - Verification timestamp
  - Support contact information

**Logging:**
```
✅ Sending verification approval email to user: {email}
```

#### B. **Admin Notification** → pecfestdev@gmail.com (ALWAYS sent for record keeping)
- Function: `sendAdminNotificationEmail()`
- To: `pecfestdev@gmail.com`
- Subject: `[Admin Notification] Registration {Verified/Unverified} - {EventName}`
- Content:
  - Admin action performed (verified/unverified)
  - Admin name and email who performed the action
  - User details
  - Event details
  - Registration details (Event ID, Team ID, Fees)
  - Timestamp of action

**Logging:**
```
📧 Sending admin notification to pecfestdev@gmail.com (Action: verified/unverified)
✅ Admin notification sent successfully to pecfestdev@gmail.com
```

---

### 3️⃣ **Admin Un-verifies Registration** (PUT `/api/registrations/[id]`)

**Trigger:** Admin marks registration as `verified: false`

**Emails Sent:**
- ❌ **NO email to user** (only sends when verified = true)
- ✅ **Admin Notification** → pecfestdev@gmail.com
  - Same as scenario 2B but with action = 'unverified'

**Logging:**
```
⚠️ Registration marked as unverified - NOT sending approval email to user
📧 Sending admin notification to pecfestdev@gmail.com (Action: unverified)
```

---

## 🔧 Technical Implementation

### Email Functions (in `src/lib/email.ts`)

1. **`sendEmail(options)`** - Base email sending function using Nodemailer
2. **`sendRegistrationConfirmationEmail(data)`** - Initial registration confirmation
3. **`sendUserVerificationEmail(userEmail, ...)`** - Verification approval to user
4. **`sendAdminNotificationEmail(adminEmail, ...)`** - Admin action notification

### API Endpoints

1. **`POST /api/registrations`** - Creates registration, sends confirmation
2. **`PUT /api/registrations/[id]`** - Updates registration, handles verification emails
3. **`POST /api/email/send-notification`** - Internal endpoint for email dispatch

---

## ✅ Verification Checklist

### On Registration Creation:
- [x] User receives confirmation email immediately
- [x] Email includes all registration details
- [x] For paid events, mentions admin verification pending
- [x] For free events, confirms registration complete
- [x] Payment receipt attached for team leaders

### On Admin Verification (verified = true):
- [x] User receives verification approval email
- [x] Email includes congratulations and verified badge
- [x] pecfestdev receives admin notification
- [x] Admin notification includes who verified and when

### On Admin Un-verification (verified = false):
- [x] User does NOT receive email (no false positives)
- [x] pecfestdev receives admin notification
- [x] Action logged as "unverified"

---

## 🎯 Key Points

### Email Recipients Summary:
| Action | User Email | pecfestdev Email |
|--------|-----------|------------------|
| User Registers | ✅ Confirmation | ❌ No |
| Admin Verifies (true) | ✅ Approval | ✅ Notification |
| Admin Un-verifies (false) | ❌ No | ✅ Notification |

### Important Notes:
1. **User only gets approval email when verified = true**
2. **pecfestdev always gets notification** (both verified and unverified)
3. **Registration confirmation is separate** from verification approval
4. **All emails are sent asynchronously** - won't fail the registration if email fails
5. **Comprehensive logging** at every step for debugging

---

## 🔍 Debugging

Check logs for these patterns:
- `📧 Sending registration confirmation email to user:`
- `✅ Sending verification approval email to user:`
- `⚠️ Registration marked as unverified - NOT sending approval email`
- `📧 Sending admin notification to pecfestdev@gmail.com`
- `✅ Admin notification sent successfully`
- `❌ Error` messages for any failures

---

## 📝 Schema Reference

**Event Schema:**
- `dateTime: Date` - Event start time
- `endDateTime: Date` - Event end time
- ~~`dateTime`~~ - Deprecated (removed)

**Registration Schema:**
- `dateTime: Date` - When user registered (NOT event time)
- `verified: boolean` - Admin verification status

---

**Last Updated:** November 4, 2025
**Author:** Pecfest Development Team
