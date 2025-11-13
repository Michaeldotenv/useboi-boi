# Google Sign-In Deployment Guide

## Prerequisites
- Google Cloud Console project with OAuth 2.0 credentials
- Google Client ID already configured: `995060546108-q7pulj2frifde8qcb3iemnhqp3jqbsp5.apps.googleusercontent.com`

## Deployment Checklist

### 1. Backend Deployment (Render)

#### Environment Variables
The following environment variable is already set in your Render dashboard:
```
GOOGLE_CLIENT_ID=995060546108-q7pulj2frifde8qcb3iemnhqp3jqbsp5.apps.googleusercontent.com
```

✅ **No additional backend configuration needed** - the variable is already in your `skulpoint.env` file.

#### Verify Backend Deployment
After deploying, test the endpoint:
```bash
curl -X POST https://useboiboi.onrender.com/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token": "test_token"}'
```

Expected response (with invalid token):
```json
{"error": "Invalid Google token: ..."}
```

### 2. Frontend Deployment (Vercel)

#### Environment Variables
Add the following to your Vercel project settings:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=995060546108-q7pulj2frifde8qcb3iemnhqp3jqbsp5.apps.googleusercontent.com
   ```
3. Apply to: Production, Preview, and Development

#### Redeploy Frontend
```bash
# Commit and push changes
git add .
git commit -m "Add Google Sign-In functionality"
git push origin main
```

Vercel will automatically redeploy.

### 3. Google Cloud Console Configuration

#### Authorized JavaScript Origins
Ensure these domains are added:
- `http://localhost:3000` (for local development)
- `https://useboiboi.vercel.app` (production)
- `https://accounts.useboiboi.com` (if using custom domain)

#### Authorized Redirect URIs
Add the same domains as JavaScript origins.

#### Steps to Update:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to: APIs & Services → Credentials
4. Click on your OAuth 2.0 Client ID
5. Add the domains to "Authorized JavaScript origins"
6. Save changes

### 4. Testing

#### Local Testing
```bash
# Backend
cd backend
go run cmd/app/main.go

# Frontend (in another terminal)
cd frontend
npm run dev
```

Visit `http://localhost:3000/login` and test Google Sign-In.

#### Production Testing
1. Visit `https://useboiboi.vercel.app/login`
2. Click "Sign in with Google"
3. Select a Google account
4. Verify successful login and redirect

### 5. Monitoring

#### Backend Logs (Render)
Monitor for Google auth requests:
```
POST /api/auth/google
```

#### Frontend Logs (Vercel)
Check browser console for any Google Sign-In errors.

#### Common Success Indicators
- ✅ Google popup appears
- ✅ User can select account
- ✅ Token is sent to backend
- ✅ JWT token is returned
- ✅ User is redirected to dashboard

## Rollback Plan

If issues occur:

### Backend Rollback
1. Remove the Google auth route from `backend/api/routes.go`:
   ```go
   // Comment out this line:
   // authRoute.POST("/google", func(ctx *gin.Context) {
   //     auth.GoogleAuth(ctx, db)
   // })
   ```
2. Redeploy backend

### Frontend Rollback
1. Remove Google Sign-In buttons from login/signup pages
2. Redeploy frontend

## Security Notes

- ✅ Token verification is done server-side
- ✅ Email verification is required
- ✅ CORS is properly configured
- ✅ JWT tokens are used for session management
- ✅ No sensitive data is exposed to frontend

## Support

If you encounter issues:

1. **Check environment variables** - Ensure `GOOGLE_CLIENT_ID` is set correctly
2. **Verify Google Cloud Console** - Ensure domains are authorized
3. **Check CORS settings** - Ensure frontend domain is in allowed origins
4. **Review logs** - Check Render and Vercel logs for errors

## Next Steps

After successful deployment:

1. Test with multiple Google accounts
2. Test on different browsers
3. Test on mobile devices
4. Monitor error rates
5. Collect user feedback

## Additional Resources

- [Google Sign-In Documentation](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 Best Practices](https://tools.ietf.org/html/rfc6749)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
