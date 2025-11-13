# Google Sign-In Testing Guide

## Manual Testing Checklist

### Pre-Testing Setup
- [ ] Backend is running (locally or on Render)
- [ ] Frontend is running (locally or on Vercel)
- [ ] Environment variables are set correctly
- [ ] Google Cloud Console is configured with correct domains

### Test Cases

#### 1. New User Sign-Up with Google
**Steps:**
1. Navigate to `/sign-up`
2. Click "Sign up with Google" button
3. Select a Google account that hasn't been used before
4. Verify Google popup appears and closes

**Expected Results:**
- ✅ User is created in database
- ✅ JWT token is generated
- ✅ User is redirected to `/user-dashboard`
- ✅ Welcome email is sent
- ✅ Virtual bank account is created
- ✅ User data is stored in localStorage

**Database Verification:**
```javascript
// Check MongoDB for new user
db.users.findOne({ email: "test@gmail.com" })
```

#### 2. Existing User Sign-In with Google
**Steps:**
1. Navigate to `/login`
2. Click "Sign in with Google" button
3. Select a Google account that already exists in the system

**Expected Results:**
- ✅ User is logged in
- ✅ JWT token is generated
- ✅ User is redirected to appropriate dashboard
- ✅ No duplicate user is created

#### 3. Error Handling - Invalid Token
**Steps:**
1. Open browser console
2. Manually call the API with invalid token:
```javascript
fetch('https://useboiboi.onrender.com/api/auth/google', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: 'invalid_token' })
})
.then(r => r.json())
.then(console.log)
```

**Expected Results:**
- ✅ Error message: "Invalid Google token"
- ✅ Status code: 400

#### 4. Error Handling - Unverified Email
**Steps:**
1. Use a Google account with unverified email (rare case)

**Expected Results:**
- ✅ Error message: "Email not verified with Google"
- ✅ Status code: 400

#### 5. Cross-Browser Testing
Test on:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Chrome
- [ ] Mobile Safari

#### 6. User Type Testing
**Base User (Default):**
- Navigate to `/sign-up`
- Sign up with Google
- Verify redirect to `/user-dashboard`

**Merchant User:**
- Modify GoogleSignInButton to pass `userType="merchant"`
- Sign up with Google
- Verify user type is "merchant" in database

**Rider User:**
- Modify GoogleSignInButton to pass `userType="rider"`
- Sign up with Google
- Verify user type is "rider" in database

### Performance Testing

#### Load Time
- [ ] Google Sign-In script loads within 2 seconds
- [ ] Button is clickable immediately
- [ ] Popup appears within 1 second of click

#### Network Requests
Monitor in browser DevTools:
1. Google Sign-In script load
2. Token verification request to Google
3. Authentication request to backend
4. User data response

### Security Testing

#### Token Validation
- [ ] Invalid tokens are rejected
- [ ] Expired tokens are rejected
- [ ] Tokens from other apps are rejected

#### CORS
- [ ] Requests from unauthorized domains are blocked
- [ ] Requests from authorized domains succeed

#### Data Privacy
- [ ] No sensitive data in URL parameters
- [ ] JWT token is stored securely
- [ ] User data is not exposed in console logs

### Integration Testing

#### Email Service
- [ ] Welcome email is sent to new users
- [ ] Email contains correct user name
- [ ] Email is sent from correct sender

#### Payment Service
- [ ] Virtual bank account is created
- [ ] PayStack account is initialized
- [ ] Account details are stored correctly

#### Database
- [ ] User is created with correct fields
- [ ] No duplicate users are created
- [ ] Username is unique
- [ ] Password is hashed

### Regression Testing

#### Existing Functionality
- [ ] Email/password login still works
- [ ] Email/password signup still works
- [ ] OTP verification still works
- [ ] Forgot password still works
- [ ] All other auth flows are unaffected

### Edge Cases

#### Network Issues
- [ ] Handle slow network gracefully
- [ ] Show loading state during authentication
- [ ] Timeout after reasonable duration

#### User Cancellation
- [ ] Handle user closing Google popup
- [ ] No error is shown if user cancels
- [ ] User can try again

#### Multiple Accounts
- [ ] User can switch between Google accounts
- [ ] Correct account is used for authentication

### Accessibility Testing

- [ ] Button is keyboard accessible
- [ ] Screen reader announces button correctly
- [ ] Focus states are visible
- [ ] Error messages are announced

### Mobile Testing

#### Responsive Design
- [ ] Button displays correctly on mobile
- [ ] Google popup works on mobile browsers
- [ ] Touch interactions work smoothly

#### Mobile-Specific
- [ ] Works in mobile Chrome
- [ ] Works in mobile Safari
- [ ] Works in in-app browsers (Facebook, Instagram)

## Automated Testing (Future)

### Backend Unit Tests
```go
// Test Google token verification
func TestVerifyGoogleToken(t *testing.T) {
    // Test with valid token
    // Test with invalid token
    // Test with expired token
}

// Test Google auth endpoint
func TestGoogleAuth(t *testing.T) {
    // Test new user creation
    // Test existing user login
    // Test error handling
}
```

### Frontend Unit Tests
```typescript
// Test GoogleSignInButton component
describe('GoogleSignInButton', () => {
  it('renders correctly', () => {});
  it('calls Google Sign-In on click', () => {});
  it('handles success', () => {});
  it('handles errors', () => {});
});
```

### E2E Tests
```typescript
// Cypress or Playwright
describe('Google Sign-In Flow', () => {
  it('allows new user to sign up with Google', () => {
    cy.visit('/sign-up');
    cy.get('[data-testid="google-signin-button"]').click();
    // Mock Google Sign-In
    cy.url().should('include', '/user-dashboard');
  });
});
```

## Bug Reporting Template

If you find issues, report with:

```
**Issue:** [Brief description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Environment:**
- Browser: 
- OS: 
- Frontend URL: 
- Backend URL: 

**Screenshots/Logs:**
[Attach relevant screenshots or console logs]

**Additional Context:**
[Any other relevant information]
```

## Success Criteria

All tests pass when:
- ✅ New users can sign up with Google
- ✅ Existing users can sign in with Google
- ✅ Errors are handled gracefully
- ✅ Security measures are in place
- ✅ Performance is acceptable
- ✅ Works across browsers and devices
- ✅ Existing functionality is not broken
