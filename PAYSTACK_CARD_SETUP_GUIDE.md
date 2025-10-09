# Paystack Card Payment Setup Guide

## ⚠️ Current Issue
You're seeing this error when trying to add a card:
```
"No active channel to process transaction. Please contact merchant"
```

This means **card payments are not activated** in your Paystack account.

## 🔧 How to Fix

### Step 1: Log into Paystack Dashboard
1. Go to [https://dashboard.paystack.com](https://dashboard.paystack.com)
2. Log in with your Paystack credentials

### Step 2: Activate Card Payments
1. Navigate to **Settings** → **Preferences** (or **Payment Channels**)
2. Find **"Card Payments"** section
3. Toggle **Enable Card Payments** to ON
4. Click **Save Changes**

### Step 3: Business Verification (May Be Required)
Paystack requires business verification for card payments:

1. **Go to**: Settings → **Business Settings**
2. **Complete**:
   - Business Registration Documents
   - Director's Information
   - Bank Account Details
   - Address Verification

3. **Submit for Review**
4. **Wait for Approval** (Usually 24-48 hours)

### Step 4: Test in Test Mode First
1. Switch to **Test Mode** in Paystack dashboard
2. In Test Mode, card payments are usually enabled by default
3. Use test API keys in your `.env` file:
   ```
   PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   ```
4. Test the card addition feature
5. Use Paystack test cards:
   - Success: `4084 0840 8408 4081`
   - Insufficient Funds: `5060 6666 6666 6666 6666`

### Step 5: Switch to Live Mode
Once testing works:
1. Complete business verification (if not done)
2. Wait for approval
3. Switch to **Live Mode** in dashboard
4. Update `.env` with live keys:
   ```
   PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
   ```
5. Ensure card payments are enabled in Live Mode

## 📋 Checklist

Before card payments will work, ensure:

- [ ] Paystack account created and verified
- [ ] Business documents submitted and approved
- [ ] Card payments enabled in dashboard
- [ ] Test mode works with test keys
- [ ] Live mode approved and keys updated
- [ ] Bank account linked to Paystack
- [ ] Settlement account configured

## 🔑 Environment Variables

Make sure your backend has these set:

```bash
# Test Mode
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Live Mode
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx

# Preferred bank for virtual accounts
PAYSTACK_PREFERRED_BANK=wema-bank
```

## 🎯 Alternative: Use Wallet Payment

While waiting for Paystack approval, users can:
1. **Top up wallet** via bank transfer to virtual account
2. **Pay with wallet** at checkout
3. Works immediately without card setup

## 📞 Paystack Support

If you're stuck:
- **Email**: support@paystack.com
- **Phone**: +234 1 888 3333
- **Dashboard Chat**: Available in Paystack dashboard
- **Status**: [https://status.paystack.com](https://status.paystack.com)

## 🧪 Testing Card Addition

### Test in Browser Console:
```javascript
// Check if your Paystack keys are working
fetch('https://api.paystack.co/transaction/initialize', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_SECRET_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    amount: '10000',
    channels: ['card']
  })
})
.then(r => r.json())
.then(console.log)
```

Expected success response:
```json
{
  "status": true,
  "message": "Authorization URL created",
  "data": {
    "authorization_url": "https://checkout.paystack.com/xxxxx",
    "access_code": "xxxxx",
    "reference": "xxxxx"
  }
}
```

### Common Errors:

#### 1. "No active channel"
- **Cause**: Card payments not enabled
- **Fix**: Enable in dashboard → Settings → Payment Channels

#### 2. "Invalid key"
- **Cause**: Wrong or expired API key
- **Fix**: Regenerate keys in dashboard → Settings → API Keys & Webhooks

#### 3. "Business not verified"
- **Cause**: Incomplete KYC
- **Fix**: Complete business verification in dashboard

#### 4. "Invalid amount"
- **Cause**: Amount too low (minimum usually ₦100)
- **Fix**: We now use ₦100 (10000 kobo) for verification

## 🔄 Refund Policy for Card Verification

When a user adds a card:
1. **₦100 is charged** for verification
2. **Paystack verifies** the card is valid
3. **Authorization code** is saved (not card details)
4. **₦100 should be refunded** to user's wallet

### To Implement Auto-Refund:
Update `VerifyCardChargeAndAddCard` in backend to:
1. Verify the card successfully
2. Add card to user account
3. Credit user's wallet with ₦100

## 🎨 User Experience Improvements

We've added:
- ✅ Better error messages explaining Paystack setup
- ✅ Info boxes explaining verification fee
- ✅ Warning about channel activation
- ✅ Fallback to wallet payment
- ✅ Helpful notices on cards page

## 📱 Mobile App Note

If you're building a mobile app:
- Use Paystack's mobile SDKs:
  - iOS: [Paystack iOS SDK](https://github.com/PaystackHQ/paystack-ios)
  - Android: [Paystack Android SDK](https://github.com/PaystackHQ/paystack-android)
- These handle card collection and tokenization
- Still requires backend verification

## ✅ Final Testing Steps

1. **Test Mode**:
   - Enable test mode
   - Use test keys
   - Try adding test card: `4084 0840 8408 4081`
   - Verify card appears in user profile
   - Try checkout with saved card

2. **Live Mode**:
   - Get business approved
   - Switch to live mode
   - Update live keys
   - Try with real card
   - Verify payment goes through
   - Check Paystack dashboard for transaction

## 🚀 Quick Start (For Developers)

### Backend Check:
```bash
# Check if Paystack keys are set
cd backend
env | grep PAYSTACK

# Should show:
# PAYSTACK_SECRET_KEY=sk_test_xxxx
# PAYSTACK_PREFERRED_BANK=wema-bank
```

### Frontend Check:
```bash
# Check if card endpoints are in API
cd frontend
grep -r "getCardAuthorizationUrl" lib/

# Should find it in lib/api.ts
```

### Full Flow Test:
1. Login to app
2. Go to Profile → Manage Cards
3. Click "Add Card"
4. Should redirect to Paystack
5. Enter test card details
6. Redirect back with success
7. Card appears in list

---

## 📌 Summary

**The "No active channel" error means**:
- Paystack card payments not activated
- Business verification incomplete
- Or you're in live mode without approval

**Quick fix**:
1. Use test mode for now
2. Enable card payments in dashboard
3. Complete business verification for live mode
4. Use wallet payment as alternative

**Need help?** Contact Paystack support or check their [documentation](https://paystack.com/docs/payments/accept-payments).

