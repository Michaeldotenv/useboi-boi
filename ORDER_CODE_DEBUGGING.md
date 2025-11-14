# Order Code Debugging Guide

## Problem
Order codes are showing "LOADING..." instead of actual 4-digit codes.

## Root Cause
The backend is not returning the `code` field in the order object.

## Solution Steps

### Step 1: Check Browser Console
1. Open your order details page
2. Press F12 to open Developer Tools
3. Go to the "Console" tab
4. Look for messages starting with:
   - `🔍 Order Code Debug:` (on order details page)
   - `⚠️ Order missing code:` (on orders list)

### Step 2: Check What Backend Returns
You should see output like this:
```javascript
🔍 Order Code Debug: {
  'order.code': undefined,  // ← This is the problem if it's undefined
  'order.orderCode': undefined,
  'order.completionCode': undefined,
  'apiCodeRaw': undefined,
  'Full order object': { ... }
}
```

### Step 3: Verify Backend API Response
Check if the order API endpoint is returning the `code` field:

**Endpoint**: `GET /api/orders/{orderId}` or `GET /api/orders?customerId={id}`

The response should include:
```json
{
  "code": "1234",  // ← This field must exist
  "id": "...",
  "status": "...",
  ...
}
```

### Step 4: Check Backend Code
Verify that the Go backend is setting the code field when creating orders:

**File**: `backend/api/orders/orders.go` (lines 367-386)

Look for this section:
```go
order := data.Order{
    ID:                  primitive.NewObjectID(),
    CartID:              cartId,
    CustomerID:          userObjectId,
    StoreID:             storeId,
    DeliveryInstruction: checkoutBody.DeliveryInstruction,
    DeliveryLocation:    checkoutBody.DeliveryLocation,
    DeliveryMapLocation: checkoutBody.DeliveryMapLocation,
    Code:                strconv.Itoa(checkoutBody.Code),  // ← This line
    Status:              &orderStatus,
    // ...
}
```

### Step 5: Check Frontend Checkout
Verify that the frontend is sending the code when creating an order:

**File**: `frontend/app/components/tabs/CartTab.tsx` (lines 76-90)

Look for this:
```typescript
const orderCode = generateOrderCode();  // Generate code

const payload = {
  totalPrice: grandTotal,
  cartId: cartStore.cartId || '',
  storeId: cartVendorId,
  // ...
  code: orderCode,  // ← This must be sent
  isErrand: false,
};
```

## Quick Fix (If Backend Is Working)
If backend is returning codes but frontend shows "LOADING...", the issue is likely:
1. **Backend not returning the field** - Check API response
2. **Field name mismatch** - Backend might return `Code` (capital C) instead of `code`
3. **Caching** - Clear browser cache and hard refresh (Ctrl+Shift+R)

## Test Steps
1. Place a new order
2. Immediately check the order details
3. Look at console logs
4. Share the console output with developer

