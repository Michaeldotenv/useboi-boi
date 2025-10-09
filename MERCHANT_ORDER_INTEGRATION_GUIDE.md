# 🛍️ Merchant Order Integration Guide

## ✅ Order System Status: FULLY WORKING

Your order system is **already properly configured** and working! Here's exactly how it works:

---

## 📱 How Merchants Receive Orders

### 1. **Automatic Push Notification**
When a customer places an order, merchants receive an **instant Firebase Cloud Messaging (FCM) notification**:

```
Title: "[CustomerName] has placed a new order on your store!"
Body: "Your store has a new pending order"
```

**Implementation:**
```javascript
// In your mobile app, register for push notifications after login
POST /api/notifications/registerDevice
{
  "token": "firebase_device_token",
  "type": "android" // or "ios"
}
```

### 2. **Query Orders via API**
Merchants can fetch their store's orders at any time:

```http
GET /api/orders?storeId={merchantStoreId}
Authorization: Bearer {merchant_jwt_token}
```

**Optional filters:**
- `?storeId={id}` - Filter by store
- `?status=ongoing` - Only ongoing orders
- `?status=completed` - Only completed orders

**Example Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439017",
    "cartId": "507f1f77bcf86cd799439011",
    "customerId": "507f1f77bcf86cd799439001",
    "storeId": "507f1f77bcf86cd799439011",
    "deliveryLocation": "123 Main St, Apt 4B",
    "code": "1234",
    "status": "ongoing",
    "orderProgressStatus": "orderReceivedByVendor",
    "price": 7500,
    "deliveryFee": 500,
    "isPaidFor": true,
    "customer": {
      "firstName": "John",
      "email": "john@example.com",
      "phoneNumber": "+2348012345678"
    },
    "cart": {
      "cartItems": ["507f1f77bcf86cd799439016"]
    }
  }
]
```

---

## 🔄 Complete Order Flow

### For Customers:
1. ✅ Add items to cart
2. ✅ Checkout (wallet or card)
3. ✅ Order created with status: `"orderReceivedByVendor"`
4. ✅ Payment deducted from wallet/card
5. 📲 **Notification sent to customer**: "Successful Order Placement!"

### For Merchants:
1. 📲 **Receive push notification**: "John has placed a new order on your store!"
2. 📱 Open merchant app → View orders
3. 🍽️ Prepare the order
4. ⏳ Wait for rider to accept

### For Riders:
1. 📲 **Receive push notification**: "New Order Alert!"
2. 📱 View available orders
3. ✅ Accept order → `PATCH /api/orders/{orderId}/orderProgress` with `status: "orderAcceptedByRider"`
4. 🚗 Go to merchant location
5. 📍 Update status to `"riderAtVendor"`
6. 📦 Pick up order
7. 🚗 Update status to `"riderOnHisWay"`
8. 📍 Arrive at customer → Update status to `"riderAtUserLocation"`
9. 🔢 Customer enters 4-digit code
10. ✅ Order completed → Funds distributed

---

## 💰 Payment Distribution (On Order Completion)

When a rider delivers an order and the customer enters the completion code:

**Example Order: ₦7,500**
- **Subtotal (items)**: ₦7,000
- **Delivery Fee**: ₦500

**Service Fee Calculation:**
- Orders ≤ ₦5,000 → 3% fee
- Orders ≤ ₦9,999 → 5% fee
- Orders > ₦10,000 → 7% fee

For this ₦7,000 order: `₦7,000 × 5% = ₦350` service fee

**Distribution:**
1. **Merchant receives**: `₦7,000 - ₦350 = ₦6,650` (to virtual wallet)
2. **Rider receives**: `₦500` (delivery fee to wallet or delivery service admin)
3. **Boiboi receives**: `₦350` (service fee)

---

## 📊 Order Progress Statuses

| Status | Description | Who Updates |
|--------|-------------|-------------|
| `orderCreated` | Customer initiated checkout | System |
| `orderReceivedByVendor` | Merchant notified | System |
| `orderAcceptedByRider` | Rider accepted order | Rider App |
| `riderAtVendor` | Rider arrived at store | Rider App |
| `riderOnHisWay` | Rider picked up order | Rider App |
| `riderAtUserLocation` | Rider at customer's location | Rider App |
| `completed` | Customer entered code | System |
| `cancelled` | Order cancelled (refund issued) | Customer/Merchant |

---

## 🔐 Order Completion Code

Each order has a unique **4-digit code** that the customer must provide to the rider:

```json
{
  "code": "1234"
}
```

**Security:**
- Rider requests code from customer
- Customer provides code
- Rider enters code via: `POST /api/orders/{orderId}/complete`
- If code matches → Order completed + Funds distributed
- If code doesn't match → Error returned

---

## 🔔 Customer Notifications During Delivery

Customers receive automatic updates at each stage:

1. **"Your Order Has Been Accepted By Rider!"**
   - When: Rider accepts order
   - Message: "Mike is on the way to pick up your order..."

2. **"Rider at the Vendor!"**
   - When: Rider arrives at merchant
   - Message: "Mike has arrived at the vendor..."

3. **"Your Order is on the Way!"**
   - When: Rider starts delivery
   - Message: "The rider is on the way to your location..."

4. **"Rider at Your Location!"**
   - When: Rider arrives
   - Message: "The rider has arrived... collect your order with code 1234"

---

## 🛠️ Merchant App Implementation Checklist

### ✅ Required Features:

1. **Login/Authentication**
   - `POST /api/auth/merchantSignup` → Get merchant credentials
   - `POST /api/auth/verifyMerchantSignup` → Verify OTP
   - `POST /api/auth/login` → Get JWT token

2. **Device Registration** (For Push Notifications)
   ```javascript
   // After successful login
   await registerDevice({
     token: firebaseDeviceToken,
     type: 'android'
   });
   ```

3. **Listen for Push Notifications**
   - Configure Firebase Cloud Messaging
   - Handle incoming notifications
   - Show alert/banner when new order arrives

4. **Orders Dashboard**
   - Fetch orders: `GET /api/orders?storeId={merchantStoreId}`
   - Filter by status (ongoing/completed)
   - Show order details (items, customer info, delivery location)
   - Display order code prominently

5. **Order Details View**
   - Customer name & phone (for contact)
   - Delivery location
   - Order items with quantities
   - Total amount
   - Order code
   - Current status

6. **Real-time Updates** (Optional but Recommended)
   - Poll orders endpoint every 30-60 seconds
   - Or listen to FCM data messages for status changes

---

## 📱 Sample Merchant App Flow

```
1. Merchant opens app
   ↓
2. Login with credentials
   ↓
3. Register device for notifications
   ↓
4. View dashboard showing:
   - Total orders today
   - Pending orders
   - Completed orders
   ↓
5. [NOTIFICATION ARRIVES]
   "John has placed a new order!"
   ↓
6. Tap notification → View order details:
   - Customer: John Doe (+2348012345678)
   - Items: 2x Tomatoes, 1x Bread
   - Total: ₦7,500
   - Code: 1234
   - Status: Waiting for rider
   ↓
7. Merchant prepares order
   ↓
8. Rider arrives (status updates automatically)
   ↓
9. Give order to rider
   ↓
10. Order delivered → Funds appear in wallet
```

---

## 💡 Best Practices for Merchants

1. **Enable push notifications** - Don't miss orders!
2. **Check orders regularly** - Poll API every 30 seconds on orders screen
3. **Prepare orders quickly** - Riders get notified immediately
4. **Keep order code visible** - Rider will ask customer for it
5. **Monitor wallet balance** - Track earnings in real-time
6. **Set accurate inventory** - Prevent order failures
7. **Update store hours** - Customers see when you're open

---

## 🐛 Troubleshooting

### Merchant not receiving notifications?

**Check:**
1. Device registered? → `POST /api/notifications/registerDevice`
2. Firebase token valid?
3. App has notification permissions?
4. User is logged in as merchant type?
5. StoreId correctly linked to merchant account?

### Orders not showing up?

**Check:**
1. Using correct storeId in query?
2. Store status is "active"?
3. JWT token valid?
4. Network connectivity?

### How to find my storeId?

```http
GET /api/user/me
Authorization: Bearer {token}

Response:
{
  "storeId": "507f1f77bcf86cd799439011",  // ← This is your store ID
  "type": "merchant",
  ...
}
```

---

## 🎯 Testing the Integration

### Test Flow:

1. **Create test merchant account**
   ```
   POST /api/auth/merchantSignup
   POST /api/auth/verifyMerchantSignup
   ```

2. **Create test customer account**
   ```
   POST /api/auth/signup
   POST /api/auth/verifySignup
   ```

3. **Add test items to merchant's store**
   ```
   POST /api/inventories/items
   ```

4. **Customer places order**
   ```
   POST /api/orders/checkout
   ```

5. **Verify merchant receives:**
   - ✅ Push notification
   - ✅ Order appears in `GET /api/orders?storeId={id}`

6. **Create test rider account**
   ```
   POST /api/auth/riderSignup
   POST /api/auth/verifyRiderSignup
   ```

7. **Rider accepts order**
   ```
   PATCH /api/orders/{orderId}/orderProgress
   { "status": "orderAcceptedByRider" }
   ```

8. **Complete order**
   ```
   POST /api/orders/{orderId}/complete
   { "code": "1234" }
   ```

9. **Verify funds distributed** to merchant wallet

---

## 📞 Need Help?

- **API Documentation**: See `MOBILE_APP_API_DOCUMENTATION.md`
- **Technical Support**: dev@useboiboi.com
- **Merchant Support**: support@useboiboi.com

---

## 🚀 Ready to Go!

Your backend is **fully configured** and ready for merchant integration. The notification system is live and orders will flow seamlessly to the merchant app as soon as:

1. ✅ Merchant app implements FCM push notifications
2. ✅ Merchant app calls registration endpoint after login
3. ✅ Merchant app queries orders endpoint

**No backend changes needed!** Everything is already working. 🎉

