# Google Sign-In Implementation

## Overview
Google Sign-In has been successfully implemented for both login and signup flows. Users can now authenticate using their Google accounts seamlessly.

## Backend Implementation

### New Files
- `backend/api/auth/google_auth.go` - Handles Google OAuth authentication

### Features
- **Token Verification**: Verifies Google ID tokens using Google's tokeninfo endpoint
- **Auto User Creation**: Automatically creates new users when signing in with Google for the first time
- **Email Verification**: Ensures email is verified with Google before allowing authentication
- **User Type Support**: Supports different user types (base, merchant, rider)
- **Virtual Account Creation**: Automatically creates Paystack virtual accounts for new users
- **Welcome Emails**: Sends welcome emails to new users

### API Endpoint
```
POST /api/auth/google
```

**Request Body:**
```json
{
  "token": "google_id_token_here",
  "type": "base" // optional: "base", "merchant", or "rider"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "type": "base",
    ...
  }
}
```

### Route Configuration
Added to `backend/api/routes.go`:
```go
authRoute.POST("/google", func(ctx *gin.Context) {
    auth.GoogleAuth(ctx, db)
})
```

## Frontend Implementation

### New Files
- `frontend/app/components/GoogleSignInButton.tsx` - Reusable Google Sign-In button component
- `frontend/app/components/GoogleSignInProvider.tsx` - Provider that loads Google Sign-In script

### Updated Files
- `frontend/app/login/page.tsx` - Added Google Sign-In option
- `frontend/app/sign-up/page.tsx` - Added Google Sign-Up option
- `frontend/.env.local` - Added Google Client ID

### Dependencies
```bash
npm install @react-oauth/google
```

### Environment Variables

#### Backend (.env or skulpoint.env)
```env
GOOGLE_CLIENT_ID=995060546108-q7pulj2frifde8qcb3iemnhqp3jqbsp5.apps.googleusercontent.com
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=995060546108-q7pulj2frifde8qcb3iemnhqp3jqbsp5.apps.googleusercontent.com
```

## How It Works

### User Flow
1. User clicks "Sign in with Google" or "Sign up with Google" button
2. Google Sign-In popup appears
3. User selects their Google account
4. Google returns an ID token
5. Frontend sends the token to backend `/api/auth/google` endpoint
6. Backend verifies the token with Google
7. Backend checks if user exists:
   - **Existing User**: Returns JWT token and user data
   - **New User**: Creates account, virtual account, sends welcome email, returns JWT token
8. Frontend stores token and redirects to appropriate dashboard

### Security Features
- Token verification through Google's official API
- Email verification requirement
- Secure password generation for Google users (not used for login)
- JWT token generation for session management
- CORS protection

## Testing

### Manual Testing Steps
1. Navigate to login page (`/login`)
2. Click "Sign in with Google" button
3. Select a Google account
4. Verify successful login and redirect to dashboard
5. Repeat for signup page (`/sign-up`)

### Expected Behavior
- First-time users are automatically registered
- Existing users are logged in
- Proper error messages for invalid tokens
- Redirect to appropriate dashboard based on user type

## Configuration Notes

### Google Cloud Console Setup
The Google Client ID is already configured in your environment variables. Ensure the following in Google Cloud Console:

1. **Authorized JavaScript origins:**
   - `http://localhost:3000` (development)
   - `https://useboiboi.vercel.app` (production)
   - `https://accounts.useboiboi.com` (production)

2. **Authorized redirect URIs:**
   - Same as JavaScript origins

### Render Deployment
The `GOOGLE_CLIENT_ID` is already set in your Render environment variables, so no additional configuration is needed.

## Troubleshooting

### Common Issues

1. **"Google Sign-In not available"**
   - Ensure the Google Sign-In script is loaded
   - Check browser console for script loading errors

2. **"Invalid Google token"**
   - Token may have expired
   - Client ID mismatch
   - Check GOOGLE_CLIENT_ID environment variable

3. **"Email not verified with Google"**
   - User must verify their email with Google first
   - Ask user to check their Google account settings

4. **CORS errors**
   - Ensure frontend domain is in allowed origins in `backend/api/routes.go`
   - Check Google Cloud Console authorized origins

## Future Enhancements

Potential improvements:
- Add Google One Tap sign-in for faster authentication
- Support for Google account linking with existing email/password accounts
- Profile picture sync from Google account
- Phone number collection after Google sign-in (optional)

## Notes

- Google users don't need to set a password (a random one is generated)
- Phone numbers are not provided by Google and remain empty
- Users can still use forgot password flow if they want to set a password later
- The implementation follows Google's best practices for OAuth 2.0
