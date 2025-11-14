# Wallet Top-Up and Virtual Account Fix

## Issues
1. Wallet balance was not updating on the frontend after a successful top-up via Paystack
2. Virtual bank account number was showing "Not available"
3. Balance showing ₦0 even after top-ups

## Root Causes Identified

### 1. Virtual Account Not Being Fetched After Creation
- `CreateDedicatedVirtualAccount` only created the account on Paystack but didn't fetch and store it
- Async fetch in signup was happening too quickly (before Paystack processed the account)
- No retry mechanism if initial fetch failed
- Users ended up with no account number in the database

### 2. Frontend Not Refetching After Payment
- User was redirected back from Paystack but the profile page didn't detect the return
- No automatic refetch of user data was triggered
- Balance remained stale until manual page refresh

### 3. Backend Transaction Context Issue
- The `FindOneAndUpdate` in the webhook was using wrong context (`ctx` instead of `sessCtx`)
- This could cause the balance update to fail silently outside the transaction
- No error checking on the update result

### 4. Metadata Type Filtering
- Webhook was only accepting `type: "wallet"` but frontend was sending `type: "wallet_topup"`
- This could cause legitimate top-ups to be ignored

## Changes Made

### Backend (`backend/api/payments/payment.go`)

1. **Improved Virtual Account Creation**
   - Enhanced `CreateVirtualBankAccountForUser` to check if account already exists
   - Increased wait time from 2s to 3s for Paystack processing
   - Better error handling and logging

2. **New Refresh Endpoint**
   - Added `RefreshVirtualBankAccount` function
   - Fetches latest account info from Paystack
   - Creates account if it doesn't exist
   - Automatically retries after creation

3. **Fixed Transaction Context**
   - Changed `userCollection.FindOneAndUpdate(ctx, ...)` to use `sessCtx`
   - Added error checking on the update result
   - Ensures balance update is part of the atomic transaction

4. **Enhanced Metadata Handling**
   - Added logging for metadata and payment type
   - Updated filter to accept both `"wallet"` and `"wallet_topup"` types
   - Added logging when non-wallet payments are skipped

### Backend (`backend/api/routes.go`)

1. **New Route**
   - Added `GET /api/wallet/refresh` endpoint
   - Allows frontend to manually refresh virtual account data

### Frontend (`frontend/app/user-dashboard/profile/page.tsx`)

1. **Payment Return Detection**
   - Added `useEffect` to detect Paystack callback parameters (`reference` or `trxref`)
   - Automatically refetches user data when returning from payment
   - Invalidates wallet transactions cache
   - Cleans up URL parameters
   - Shows toast notification to user

2. **Balance Update Callback**
   - Added `onBalanceUpdate` prop to `WalletSection`
   - Triggers refetch when transactions update
   - Ensures balance stays in sync

### Frontend (`frontend/lib/api.ts`)

1. **New API Function**
   - Added `refreshWallet()` function
   - Calls the new `/api/wallet/refresh` endpoint

### Frontend (`frontend/app/components/WalletSection.tsx`)

1. **Auto-Refresh on Mount**
   - Automatically calls `refreshWallet()` if account number is missing
   - Triggers parent refetch after successful refresh
   - Silent error handling (logs to console)

2. **Added Balance Update Callback**
   - New optional `onBalanceUpdate` prop
   - Calls parent refetch when transactions change
   - Maintains 30-second polling interval

3. **Transaction Refetch**
   - Exposed `refetch` from transactions query
   - Triggers parent update when new transactions arrive

## How It Works Now

1. **User Initiates Top-Up**
   - Enters amount in WalletSection modal
   - Frontend calls `/api/payments/initialize-transaction`
   - User is redirected to Paystack with callback URL

2. **Payment Processing**
   - User completes payment on Paystack
   - Paystack sends webhook to backend `/api/payments/capture-payment`
   - Backend updates balance in atomic transaction
   - Backend creates wallet transaction record

3. **User Returns to App**
   - Paystack redirects to profile page with `?reference=xxx`
   - Profile page detects the parameter
   - Automatically refetches user data after 1 second delay
   - Invalidates transaction cache
   - Shows "Payment processed" toast
   - Cleans up URL

4. **Balance Updates**
   - New balance appears immediately
   - Transaction appears in recent activity
   - 30-second polling keeps data fresh

## Testing Checklist

### Virtual Account
- [ ] New user signup shows account number within 3-5 seconds
- [ ] Existing users without account get it auto-created on profile visit
- [ ] Account number is displayed correctly in wallet card
- [ ] Manual refresh works if account is missing

### Top-Up
- [ ] Top-up with small amount (₦100)
- [ ] Top-up with large amount (₦10,000)
- [ ] Verify balance updates immediately after return
- [ ] Check transaction appears in history
- [ ] Verify webhook logs show correct metadata
- [ ] Test with slow network (balance should still update)
- [ ] Verify transaction is atomic (both balance and transaction record)

## Additional Improvements

### Recommended Next Steps
1. Add WebSocket support for real-time balance updates
2. Add loading state while waiting for webhook processing
3. Implement retry mechanism for failed webhook updates
4. Add balance verification endpoint to double-check sync
5. Show pending transaction state while webhook processes

### Monitoring
- Check backend logs for "virtual account update" messages
- Monitor for "failed to update virtual account balance" errors
- Track webhook metadata to ensure correct type filtering
