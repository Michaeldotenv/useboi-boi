# 🚀 Boiboi API - Quick Reference

**Base URL**: `https://your-backend-url.com`

---

## 🔓 Public Endpoints (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register base user |
| `POST` | `/api/auth/merchantSignup` | Register merchant |
| `POST` | `/api/auth/riderSignup` | Register rider |
| `POST` | `/api/auth/verifySignup` | Verify base user OTP |
| `POST` | `/api/auth/verifyMerchantSignup` | Verify merchant OTP |
| `POST` | `/api/auth/verifyRiderSignup` | Verify rider OTP |
| `POST` | `/api/auth/login` | Login (all user types) |
| `POST` | `/api/auth/forgotPassword` | Request password reset |
| `POST` | `/api/auth/resetPassword` | Reset password |
| `POST` | `/api/auth/admin/login` | Admin login |
| `GET` | `/api/public/latestAppVersion` | Get latest app version |
| `GET` | `/api/ping` | Health check |

---

## 🔐 Authenticated Endpoints

**All require**: `Authorization: Bearer {token}`

### 👤 User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/user/me` | Get current user |
| `POST` | `/api/user/{id}` | Get user by ID |
| `PATCH` | `/api/user/{id}` | Update user |
| `POST` | `/api/user/bankAccount` | Add withdrawal bank |
| `GET` | `/api/user/wallet/transactions` | Get wallet transactions |
| `GET` | `/api/user/wallet/withdrawalRequests` | Get pending withdrawals |

### 🏪 Stores/Vendors

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/vendors` | Get all vendors |
| `GET` | `/api/vendors/{id}` | Get vendor by ID |
| `PATCH` | `/api/vendors/{id}` | Update vendor |
| `PATCH` | `/api/vendor/updateStoreImage` | Update store image |
| `GET` | `/api/vendors/{id}/items` | Get vendor items |
| `GET` | `/api/vendors/{id}/categories` | Get vendor categories |
| `POST` | `/api/vendors/{id}/like` | Like/save vendor |
| `DELETE` | `/api/vendors/{id}/like` | Unlike/unsave vendor |
| `GET` | `/api/vendors/saved/me` | Get saved vendors |

### 📦 Inventory (Merchants Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/inventories` | Get store items (paginated) |
| `POST` | `/api/inventories/categories` | Create category |
| `PATCH` | `/api/inventories/categories/{id}` | Update category |
| `DELETE` | `/api/inventories/categories` | Delete category |
| `POST` | `/api/inventories/items` | Add item |
| `GET` | `/api/inventories/items/{id}` | Get item |
| `PATCH` | `/api/inventories/items/{id}` | Update item |
| `DELETE` | `/api/inventories/items/{id}` | Delete item (soft) |

### 🛒 Cart

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/carts/{id}/items` | Get cart items |

### 📋 Orders

| Method | Endpoint | Query Params | Description |
|--------|----------|--------------|-------------|
| `GET` | `/api/orders` | `?storeId=`, `?riderId=`, `?customerId=`, `?status=` | Get orders |
| `GET` | `/api/orders/{id}` | - | Get order by ID |
| `POST` | `/api/orders/checkout` | - | Create order (checkout) |
| `POST` | `/api/orders/{id}/complete` | - | Complete order (with code) |
| `PATCH` | `/api/orders/{id}/cancel` | - | Cancel order |
| `PATCH` | `/api/orders/{id}/orderProgress` | - | Update order status |

### 💳 Payments & Wallet

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/createBankAccount` | Create virtual bank account |
| `POST` | `/api/wallet/initializeTransaction` | Initialize wallet top-up |
| `POST` | `/api/payment/cards/authorization` | Get card authorization URL |
| `GET` | `/api/payment/cards/verify/{reference}` | Verify card and save |
| `POST` | `/api/wallet/withdrawals` | Request withdrawal |

### 🔔 Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/notifications/registerDevice` | Register device for push notifications |

### 💬 Support

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/support/tickets` | Get my support tickets |
| `POST` | `/api/support/tickets` | Create support ticket |

### 🎟️ Coupons

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/coupons` | Get available coupons |

---

## 🔧 Admin Endpoints

**Requires**: `Authorization: Bearer {admin_token}`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/stores` | Get all stores |
| `GET` | `/api/admin/stores/{id}` | Get store |
| `PATCH` | `/api/admin/stores/{id}` | Edit store |
| `POST` | `/api/admin/store/{id}/inventories` | Add item to store |
| `GET` | `/api/admin/deliveryServices` | Get delivery services |
| `GET` | `/api/admin/deliveryServices/{id}` | Get delivery service |
| `PATCH` | `/api/admin/deliveryServices/{id}` | Edit delivery service |
| `GET` | `/api/admin/riders` | Get all riders |
| `PATCH` | `/api/admin/riders/{id}` | Change rider status |
| `GET` | `/api/admin/orders` | Get all orders |
| `GET` | `/api/admin/orders/{id}` | Get order |

---

## 🎯 Most Used Endpoints by User Type

### 📱 Customer App

```
1. POST /api/auth/login
2. POST /api/notifications/registerDevice
3. GET  /api/vendors
4. GET  /api/vendors/{id}/items
5. POST /api/orders/checkout
6. GET  /api/orders?customerId={id}
7. GET  /api/orders/{id}
8. GET  /api/user/me
9. GET  /api/user/wallet/transactions
10. POST /api/wallet/initializeTransaction
```

### 🏪 Merchant App

```
1. POST /api/auth/merchantSignup
2. POST /api/auth/login
3. POST /api/notifications/registerDevice
4. GET  /api/orders?storeId={id}
5. GET  /api/orders/{id}
6. GET  /api/inventories?storeId={id}
7. POST /api/inventories/items
8. PATCH /api/inventories/items/{id}
9. GET  /api/user/me
10. POST /api/wallet/withdrawals
```

### 🚗 Rider App

```
1. POST /api/auth/riderSignup
2. POST /api/auth/login
3. POST /api/notifications/registerDevice
4. GET  /api/orders (all unassigned orders)
5. GET  /api/orders?riderId={id}
6. GET  /api/orders/{id}
7. PATCH /api/orders/{id}/orderProgress
8. POST /api/orders/{id}/complete
9. GET  /api/user/me
10. GET  /api/user/wallet/transactions
```

---

## 📊 Order Status Flow

```
Customer Checkout
    ↓
orderCreated → orderReceivedByVendor
    ↓                ↓
    ↓           [Merchant Notified]
    ↓                ↓
    ↓          [Rider Accepts]
    ↓                ↓
    ↓         orderAcceptedByRider
    ↓                ↓
    ↓          riderAtVendor
    ↓                ↓
    ↓          riderOnHisWay
    ↓                ↓
    ↓        riderAtUserLocation
    ↓                ↓
    ↓        [Customer Enters Code]
    ↓                ↓
    └──────────> completed
```

**Update Status:**
```http
PATCH /api/orders/{orderId}/orderProgress
{ "status": "riderOnHisWay" }
```

---

## 🔑 Authentication Flow

```
1. Signup → POST /api/auth/signup
2. Verify OTP → POST /api/auth/verifySignup
   Response: { token: "...", user: {...} }
3. Store token securely
4. Use token in all requests:
   Authorization: Bearer {token}
```

---

## 💡 Quick Tips

### Get Store ID (Merchants)
```http
GET /api/user/me
Response: { "storeId": "507f1f77bcf86cd799439011" }
```

### Check Wallet Balance
```http
GET /api/user/me
Response: { 
  "virtualBankAccount": { 
    "balance": 15000.50 
  } 
}
```

### Filter Orders by Store (Merchants)
```http
GET /api/orders?storeId={yourStoreId}
```

### Filter Orders by Status
```http
GET /api/orders?status=ongoing
GET /api/orders?status=completed
GET /api/orders?status=cancelled
```

### Add Multiple Filters
```http
GET /api/orders?storeId={id}&status=ongoing
```

---

## 🌐 CORS Configuration

**Allowed Origins:**
- `http://localhost:5173`
- `https://admin.useboiboi.com`
- `https://accounts.useboiboi.com`
- `https://useboiboi.vercel.app`

**Allowed Methods:**
- `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`

**Required Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}` (for authenticated endpoints)

---

## 📱 Push Notification Events

| Event | Recipient | Trigger |
|-------|-----------|---------|
| "Successful Order Placement!" | Customer | Order created |
| "New Order Alert!" | All Riders | Order created |
| "[Customer] has placed a new order!" | Merchant | Order created |
| "Order Accepted By Rider!" | Customer | Rider accepts |
| "Rider at the Vendor!" | Customer | Rider at store |
| "Your Order is on the Way!" | Customer | Rider starts delivery |
| "Rider at Your Location!" | Customer | Rider arrives |

**Register Device:**
```http
POST /api/notifications/registerDevice
{
  "token": "firebase_device_token",
  "type": "android" // or "ios", "web"
}
```

---

## ⚡ Response Time Tips

1. **Cache user data** after login
2. **Cache vendor list** for 5 minutes
3. **Poll orders** every 30-60 seconds (active screens only)
4. **Use push notifications** for real-time updates
5. **Implement pull-to-refresh** on lists
6. **Show loading skeletons** for better UX

---

## 🐛 Error Handling

```javascript
try {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }
  
  return await response.json();
} catch (error) {
  // Handle network errors
  console.error('API Error:', error.message);
  // Show user-friendly message
}
```

---

## 🔒 Security Checklist

- ✅ Store JWT token securely (encrypted storage)
- ✅ Never log sensitive data
- ✅ Use HTTPS in production
- ✅ Implement token refresh (if needed)
- ✅ Clear token on logout
- ✅ Validate user input before sending
- ✅ Handle expired tokens gracefully

---

**For detailed request/response examples, see**: `MOBILE_APP_API_DOCUMENTATION.md`

**For merchant integration guide, see**: `MERCHANT_ORDER_INTEGRATION_GUIDE.md`

---

**Last Updated**: January 2025  
**API Version**: 1.0

