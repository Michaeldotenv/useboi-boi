# 🚀 Deploy Card Payment Fixes to Production

## ⚠️ IMPORTANT - You're in Production!

These fixes are **CRITICAL** and need to be deployed immediately. Your card payment system is currently broken due to route configuration errors.

## 📋 Pre-Deployment Checklist

- [ ] Backend code changes reviewed
- [ ] Environment variables verified
- [ ] Paystack credentials confirmed
- [ ] Database backup taken (optional but recommended)
- [ ] Testing plan ready

## 🔧 Changes Made

### Backend Changes:
1. **Fixed route paths** in `backend/api/routes.go` (lines 247-252)
2. **Improved error handling** in `backend/api/payments/payment.go`
3. **Added comprehensive logging** for debugging

### Frontend Changes:
1. **Better error parsing** in `frontend/lib/api.ts`

## 🚀 Deployment Steps

### Option A: Render.com (Recommended - Auto Deploy)

#### Backend:
```bash
# 1. Navigate to project root
cd /path/to/USEBOIBOI

# 2. Stage changes
git add backend/api/routes.go
git add backend/api/payments/payment.go

# 3. Commit with clear message
git commit -m "Fix: Critical - Card payment endpoint routes and error handling"

# 4. Push to main branch
git push origin main

# 5. Render will automatically deploy
# Monitor at: https://dashboard.render.com
```

#### Frontend:
```bash
# 1. Stage frontend changes
git add frontend/lib/api.ts

# 2. Commit
git commit -m "Fix: Improved API error handling for card payments"

# 3. Push to main
git push origin main

# 4. Vercel will auto-deploy
# Monitor at: https://vercel.com/dashboard
```

### Option B: Manual Deployment

#### Backend (if self-hosting):
```bash
cd backend

# 1. Pull latest code
git pull origin main

# 2. Build
go build -o main ./cmd/app

# 3. Restart service
# Using systemd:
sudo systemctl restart boiboi-backend

# Or using PM2:
pm2 restart boiboi-backend

# Or direct:
./main
```

#### Frontend (if self-hosting):
```bash
cd frontend

# 1. Pull latest code
git pull origin main

# 2. Install dependencies (if needed)
npm install

# 3. Build
npm run build

# 4. Restart
pm2 restart boiboi-frontend
```

## ✅ Post-Deployment Verification

### 1. Check Backend Health
```bash
# Test ping endpoint
curl https://skulpoint-backend.onrender.com/api/ping

# Should return:
# {"status":"ok","message":"Boiboi Backend is running","timestamp":...}
```

### 2. Check Card Authorization Endpoint
```bash
# Replace {TOKEN} with a valid JWT token
curl -X POST https://skulpoint-backend.onrender.com/api/payment/cards/authorization \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "amount": "10000",
    "callback_url": "https://useboiboi.vercel.app/user-dashboard/profile/cards",
    "channels": ["card"]
  }'

# Should return authorization URL if successful
```

### 3. Test in Browser
1. Open https://useboiboi.vercel.app
2. Login to your account
3. Navigate to Profile → Manage Cards
4. Click "Add Card"
5. Should redirect to Paystack (not show error)

### 4. Monitor Logs

#### On Render.com:
1. Go to https://dashboard.render.com
2. Click on your backend service
3. Click "Logs" tab
4. Look for:
   - `GetAuthorizationUrl: Request received`
   - `VerifyCardChargeAndAddCard: Card added successfully`

#### On Vercel:
1. Go to https://vercel.com/dashboard
2. Click on your project
3. Go to "Runtime Logs"

## 🐛 Troubleshooting

### Backend not updating?
```bash
# Check Render deployment status
# Go to: https://dashboard.render.com → Your Service → Events

# Force redeploy if needed:
# Dashboard → Your Service → Manual Deploy → Deploy Latest Commit
```

### Frontend not updating?
```bash
# Check Vercel deployment
# Go to: https://vercel.com/dashboard → Your Project → Deployments

# Force redeploy:
# Deployments → ⋮ Menu → Redeploy
```

### Still getting 404 errors?
```bash
# 1. Verify backend is running latest code
curl https://skulpoint-backend.onrender.com/api/ping

# 2. Check git commit hash matches deployed version
git log -1 --oneline

# 3. Check Render dashboard shows latest commit

# 4. Try manual deploy in Render dashboard
```

### Cards still not adding?
1. Check Paystack dashboard for failed transactions
2. Review backend logs for errors
3. Verify Paystack API keys are correct
4. Ensure card payments are enabled in Paystack

## 📊 Monitoring After Deployment

### First 30 Minutes:
- [ ] Monitor backend logs for errors
- [ ] Test card addition yourself
- [ ] Check Paystack dashboard for transactions
- [ ] Verify no new error reports from users

### First 24 Hours:
- [ ] Monitor error tracking (if you have Sentry/similar)
- [ ] Check database for new card entries
- [ ] Review Paystack dashboard for verification charges
- [ ] Collect user feedback

## 🎯 Quick Test Script

Save this as `test-card-payment.sh`:
```bash
#!/bin/bash

API_URL="https://skulpoint-backend.onrender.com"
TOKEN="your-jwt-token-here"

echo "Testing Card Payment Endpoints..."

# Test 1: Health check
echo -e "\n1. Testing Health Check..."
curl -s "$API_URL/api/ping" | jq '.'

# Test 2: Get authorization URL
echo -e "\n2. Testing Card Authorization..."
curl -s -X POST "$API_URL/api/payment/cards/authorization" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "amount": "10000",
    "callback_url": "https://useboiboi.vercel.app/user-dashboard/profile/cards",
    "channels": ["card"],
    "metadata": {
      "purpose": "card_verification"
    }
  }' | jq '.'

echo -e "\n✅ Tests completed!"
```

Run it:
```bash
chmod +x test-card-payment.sh
./test-card-payment.sh
```

## 🔐 Security Reminder

Before deploying, verify:
- [ ] `PAYSTACK_SECRET_KEY` is set correctly
- [ ] JWT_SIGNING_KEY is strong (32+ characters)
- [ ] MongoDB URI is secure
- [ ] No secrets in git history
- [ ] CORS allows your frontend domain

## 📞 Support

If issues persist after deployment:

1. **Check Backend Logs** first
2. **Check Paystack Dashboard** for transaction status
3. **Verify Environment Variables** in Render/Vercel
4. **Test API endpoints** directly with curl
5. **Review** `CARD_PAYMENT_FIXES.md` for detailed troubleshooting

## ✨ Expected Outcome

After successful deployment:
- ✅ Card addition works without 404 errors
- ✅ Users can add cards and see them in their profile
- ✅ Better error messages if something fails
- ✅ Comprehensive logs for debugging
- ✅ Duplicate card detection works

---

**Deploy Time**: ~5-10 minutes (automatic)
**Downtime**: None (rolling deployment)
**Risk Level**: Low (only fixes bugs, no breaking changes)

**READY TO DEPLOY!** 🚀

