# Sign-Up 400 Error Debug Guide

## Issue
Sign-up is failing with a 400 (Bad Request) error from the backend.

## Error Message
```
Failed to load resource: the server responded with a status of 400
```

## What I've Added

### Enhanced Logging
The sign-up page now logs:
- Request data being sent (with passwords hidden)
- Response status code
- Detailed error messages from backend
- Success confirmation

### How to Debug

**Step 1: Open Browser Console**
1. Go to sign-up page
2. Press F12 or right-click → Inspect
3. Go to "Console" tab

**Step 2: Try to Sign Up**
Fill in the form and click "Create Account"

**Step 3: Check Console Logs**
Look for these messages:

**What you'll see:**
```
📤 Sending signup request: { firstName: "...", lastName: "...", email: "...", phone: "...", password: "***" }
📡 Response status: 400
❌ Error response: { error: "..." }
```

## Common 400 Error Causes

### 1. Missing Required Fields
**Backend expects:** firstName, lastName, email, phone, password
**Solution:** All fields are now required in the form

### 2. Invalid Email Format
**Backend expects:** Valid email format
**Solution:** HTML5 email validation is enabled

### 3. Password Too Short
**Backend expects:** Minimum 8 characters
**Solution:** Validation added (minimum 8 characters)

### 4. Phone Number Format
**Backend might expect:** Specific format (e.g., +234...)
**Current:** User can enter any format
**Solution:** May need to format phone number

### 5. Duplicate Email
**Backend rejects:** Email already registered
**Solution:** Backend should return specific error message

### 6. Missing Role Field
**Backend might expect:** role: "base" or role: "customer"
**Current:** Not sending role field
**Solution:** May need to add role to request

## Potential Fixes

### Fix 1: Add Role Field
The backend might expect a role field. Try adding it:

```typescript
// In sign-up/page.tsx, update the fetch body:
body: JSON.stringify({
  ...formData,
  role: "base" // or "customer"
})
```

### Fix 2: Format Phone Number
If backend expects specific format:

```typescript
// Format phone to remove spaces/dashes
const formattedPhone = formData.phone.replace(/[\s-]/g, '');

body: JSON.stringify({
  ...formData,
  phone: formattedPhone
})
```

### Fix 3: Remove confirmPassword
Backend might not expect confirmPassword field:

```typescript
// Send only what backend needs
const { confirmPassword, ...signupData } = formData;

body: JSON.stringify(signupData)
```

## Testing Steps

1. **Check Console Logs** - See exact error message
2. **Check Network Tab** - See request/response details
3. **Test with Postman** - Verify backend endpoint directly
4. **Check Backend Logs** - See what backend is rejecting

## Network Tab Inspection

1. Go to "Network" tab in DevTools
2. Try to sign up
3. Find the `/api/auth/signup` request
4. Click on it
5. Check:
   - **Headers** tab: See request headers
   - **Payload** tab: See data being sent
   - **Response** tab: See error message

## Expected Request Format

Based on the code, we're sending:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+234 800 000 0000",
  "password": "password123",
  "confirmPassword": "password123"
}
```

## Backend Might Expect

Option 1 (with role):
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+234 800 000 0000",
  "password": "password123",
  "role": "base"
}
```

Option 2 (without confirmPassword):
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+2348000000000",
  "password": "password123"
}
```

## Next Steps

1. **Check console logs** when you try to sign up
2. **Share the error message** from the console
3. **Check Network tab** for request/response details
4. **I can update the code** based on what the backend expects

## Quick Test

Try signing up with these details:
- First Name: Test
- Last Name: User
- Email: test@example.com
- Phone: +2348012345678
- Password: Test1234
- Confirm Password: Test1234

Then check the console for the exact error message!
