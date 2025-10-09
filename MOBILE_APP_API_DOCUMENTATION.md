# Boiboi Mobile App - API Documentation

**Base URL**: `https://your-backend-url.com`  
**API Version**: 1.0  
**Authentication**: Bearer Token (JWT)

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Stores/Vendors](#storesvendors)
4. [Inventory & Items](#inventory--items)
5. [Cart Management](#cart-management)
6. [Orders](#orders)
7. [Payments & Wallet](#payments--wallet)
8. [Notifications](#notifications)
9. [Support](#support)
10. [Coupons](#coupons)
11. [Admin (Merchants Only)](#admin-merchants-only)

---

## 🔐 Authentication

### 1. User Signup (Base User)
```http
POST /api/auth/signup
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+2348012345678",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}

Response 200:
{
  "message": "OTP code sent to email address"
}
```

### 2. Merchant Signup
```http
POST /api/auth/merchantSignup
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@store.com",
  "phone": "+2348087654321",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "nameOfStore": "Jane's Grocery",
  "storeDescription": "Fresh groceries daily"
}

Response 200:
{
  "message": "OTP code sent to email address"
}
```

### 3. Rider Signup
```http
POST /api/auth/riderSignup
Content-Type: application/json

{
  "firstName": "Mike",
  "lastName": "Rider",
  "email": "mike@delivery.com",
  "phone": "+2348099887766",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "deliveryServiceCode": "BBP2P"
}

Response 200:
{
  "message": "OTP code sent to email address"
}
```

### 4. Verify Signup (Base User)
```http
POST /api/auth/verifySignup
Content-Type: application/json

{
  "email": "john@example.com",
  "code": "1234"
}

Response 200:
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+2348012345678",
    "type": "base",
    "username": "skulabcd",
    "virtualBankAccount": {
      "accountName": "John Doe",
      "accountNumber": "9876543210",
      "balance": 0
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 5. Verify Merchant Signup
```http
POST /api/auth/verifyMerchantSignup
Content-Type: application/json

{
  "email": "jane@store.com",
  "code": "1234"
}

Response 200:
{
  "user": { /* merchant user object */ },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 6. Verify Rider Signup
```http
POST /api/auth/verifyRiderSignup
Content-Type: application/json

{
  "email": "mike@delivery.com",
  "code": "1234"
}

Response 200:
{
  "status": "pending"  // For BBP2P riders (awaiting admin approval)
}
// OR
{
  "user": { /* rider user object */ },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 7. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "type": "base",
    "virtualBankAccount": { /* ... */ }
  }
}
```

### 8. Forgot Password
```http
POST /api/auth/forgotPassword
Content-Type: application/json

{
  "email": "john@example.com"
}

Response 200:
{
  "message": "email sent to email"
}
```

### 9. Reset Password
```http
POST /api/auth/resetPassword
Content-Type: application/json

{
  "email": "john@example.com",
  "token": "abc123",
  "password": "NewPassword123"
}

Response 200:
{
  "message": "successful"
}
```

---

## 👤 User Management

**Authentication Required**: All endpoints require `Authorization: Bearer {token}` header

### 1. Get Current User
```http
GET /api/user/me
Authorization: Bearer {token}

Response 200:
{
  "_id": "507f1f77bcf86cd799439011",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+2348012345678",
  "type": "base",
  "status": "active",
  "username": "skulabcd",
  "virtualBankAccount": {
    "accountName": "John Doe",
    "accountNumber": "9876543210",
    "balance": 15000.50,
    "currency": "NGN",
    "active": true
  },
  "cards": [
    {
      "id": 12345,
      "authorizationCode": "AUTH_xxxxx",
      "bank": "GTBank",
      "cardType": "visa",
      "isSelected": true
    }
  ],
  "banks": [],
  "p2pBalance": 0
}
```

### 2. Get User by ID
```http
POST /api/user/{userId}
Authorization: Bearer {token}

Response 200:
{
  /* user object */
}
```

### 3. Update User
```http
PATCH /api/user/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John Updated",
  "phoneNumber": "+2348011112222"
}

Response 200:
{
  /* updated user object */
}
```

### 4. Add Bank Account (For Withdrawals)
```http
POST /api/user/bankAccount
Authorization: Bearer {token}
Content-Type: application/json

{
  "accountNumber": "0123456789",
  "bankCode": "058",
  "bankName": "GTBank"
}

Response 200:
{
  "id": "507f1f77bcf86cd799439011",
  "type": "nuban",
  "name": "John Doe",
  "bankName": "GTBank",
  "accountNumber": "0123456789",
  "status": "active",
  "recipientCode": "RCP_xxxxx"
}
```

### 5. Get Wallet Transactions
```http
GET /api/user/wallet/transactions
Authorization: Bearer {token}

Response 200:
[
  {
    "id": "507f1f77bcf86cd799439011",
    "paymentTransactionId": "TXN_123456",
    "userId": "507f1f77bcf86cd799439011",
    "amount": 5000,
    "type": "credit",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "paymentTransactionId": "TXN_123457",
    "userId": "507f1f77bcf86cd799439011",
    "amount": 2500,
    "type": "debit",
    "createdAt": "2024-01-15T14:00:00Z"
  }
]
```

### 6. Get Pending Withdrawals
```http
GET /api/user/wallet/withdrawalRequests
Authorization: Bearer {token}

Response 200:
[
  {
    "id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439011",
    "amount": 10000,
    "type": "merchant",
    "status": "pending",
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

---

## 🏪 Stores/Vendors

### 1. Get All Vendors
```http
GET /api/vendors
Authorization: Bearer {token}

Response 200:
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "status": "active",
    "name": "Jane's Grocery",
    "image": "https://example.com/store.jpg",
    "description": "Fresh groceries daily",
    "address": "123 Main St, Lagos",
    "categories": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Groceries",
        "storeId": "507f1f77bcf86cd799439011"
      }
    ],
    "items": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"],
    "likedByUserIds": [],
    "mapLocation": "6.5244,3.3792",
    "ratings": 4.5,
    "type": "grocery",
    "openingTime": "08:00",
    "closingTime": "20:00",
    "availableDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  }
]
```

### 2. Get Vendor by ID
```http
GET /api/vendors/{vendorId}
Authorization: Bearer {token}

Response 200:
{
  "_id": "507f1f77bcf86cd799439011",
  "status": "active",
  "name": "Jane's Grocery",
  /* ... full vendor details with resolved categories ... */
}
```

### 3. Update Vendor (Merchant Only)
```http
PATCH /api/vendors/{vendorId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "Updated description",
  "openingTime": "07:00",
  "closingTime": "21:00"
}

Response 200:
{
  /* updated vendor object */
}
```

### 4. Update Store Image (Merchant Only)
```http
PATCH /api/vendor/updateStoreImage
Authorization: Bearer {token}
Content-Type: application/json

{
  "storeId": "507f1f77bcf86cd799439011",
  "image": "base64_encoded_image_string"
}

Response 200:
{
  "message": "successfully updated store image"
}
```

### 5. Get Vendor Items
```http
GET /api/vendors/{vendorId}/items
Authorization: Bearer {token}

Query Parameters (optional):
- name: string (search by item name)

Response 200:
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "status": "active",
    "categoryId": "507f1f77bcf86cd799439012",
    "category": "Groceries",
    "currentInventory": 50,
    "desc": "Fresh organic tomatoes",
    "image": "https://example.com/tomato.jpg",
    "name": "Tomatoes",
    "price": 500,
    "storeId": "507f1f77bcf86cd799439011",
    "store": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Jane's Grocery",
      "image": "https://example.com/store.jpg"
    },
    "createdAt": "2024-01-10T08:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

### 6. Get Vendor Categories
```http
GET /api/vendors/{vendorId}/categories
Authorization: Bearer {token}

Response 200:
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Groceries",
    "storeId": "507f1f77bcf86cd799439011"
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Fresh Produce",
    "storeId": "507f1f77bcf86cd799439011"
  }
]
```

### 7. Like/Save Vendor
```http
POST /api/vendors/{vendorId}/like
Authorization: Bearer {token}

Response 200:
{
  "message": "liked"
}
```

### 8. Unlike/Unsave Vendor
```http
DELETE /api/vendors/{vendorId}/like
Authorization: Bearer {token}

Response 200:
{
  "message": "unliked"
}
```

### 9. Get Saved Vendors
```http
GET /api/vendors/saved/me
Authorization: Bearer {token}

Response 200:
[
  {
    /* vendor objects that user has liked */
  }
]
```

---

## 📦 Inventory & Items

**For Merchants Only**

### 1. Get Store Items
```http
GET /api/inventories
Authorization: Bearer {token}

Query Parameters (optional):
- storeId: string
- categoryId: string
- name: string
- page: number (default: 1)
- limit: number (default: 10)

Response 200:
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "status": "active",
      "name": "Tomatoes",
      "price": 500,
      "currentInventory": 50,
      /* ... */
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 45,
  "page_count": 5
}
```

### 2. Create Category
```http
POST /api/inventories/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Fresh Produce",
  "storeId": "507f1f77bcf86cd799439011"
}

Response 201:
{
  "_id": "507f1f77bcf86cd799439014",
  "name": "Fresh Produce",
  "storeId": "507f1f77bcf86cd799439011"
}
```

### 3. Update Category
```http
PATCH /api/inventories/categories/{categoryId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Organic Produce"
}

Response 200:
{
  /* updated category object */
}
```

### 4. Delete Category
```http
DELETE /api/inventories/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Category Name",
  "storeId": "507f1f77bcf86cd799439011"
}

Response 200:
{
  "error": "deleted category successfully"
}
```

### 5. Add Item to Inventory
```http
POST /api/inventories/items
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Organic Tomatoes",
  "desc": "Fresh organic tomatoes from local farms",
  "price": 600,
  "currentInventory": 100,
  "category": "Fresh Produce",
  "storeId": "507f1f77bcf86cd799439011",
  "image": "base64_encoded_image_string"
}

Response 201:
{
  "_id": "507f1f77bcf86cd799439015",
  "name": "Organic Tomatoes",
  "desc": "Fresh organic tomatoes from local farms",
  "price": 600,
  "currentInventory": 100,
  "category": "Fresh Produce",
  "storeId": "507f1f77bcf86cd799439011",
  "image": "https://i.ibb.co/xxxxx/image.jpg",
  "status": "active"
}
```

### 6. Get Item by ID
```http
GET /api/inventories/items/{itemId}
Authorization: Bearer {token}

Response 200:
{
  "_id": "507f1f77bcf86cd799439015",
  "name": "Organic Tomatoes",
  "price": 600,
  /* ... full item details ... */
}
```

### 7. Update Item
```http
PATCH /api/inventories/items/{itemId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "price": 650,
  "currentInventory": 75,
  "status": "active"
}

Response 200:
{
  /* updated item object */
}
```

### 8. Delete Item (Soft Delete)
```http
DELETE /api/inventories/items/{itemId}
Authorization: Bearer {token}

Response 200:
{
  "message": "Item removed successfully"
}
```

---

## 🛒 Cart Management

### 1. Get Cart Items
```http
GET /api/carts/{cartId}/items
Authorization: Bearer {token}

Response 200:
[
  {
    "_id": "507f1f77bcf86cd799439016",
    "cartId": "507f1f77bcf86cd799439011",
    "isAddedToCart": true,
    "quantity": 2,
    "itemId": "507f1f77bcf86cd799439015",
    "item": {
      "_id": "507f1f77bcf86cd799439015",
      "name": "Organic Tomatoes",
      "price": 600,
      "image": "https://i.ibb.co/xxxxx/image.jpg",
      "currentInventory": 75
    }
  }
]
```

---

## 📋 Orders

### 1. Get Orders
```http
GET /api/orders
Authorization: Bearer {token}

Query Parameters (optional):
- storeId: string (for merchants)
- riderId: string (for riders)
- customerId: string (for customers)
- status: string (ongoing, completed, cancelled)

Response 200:
[
  {
    "_id": "507f1f77bcf86cd799439017",
    "cartId": "507f1f77bcf86cd799439011",
    "customerId": "507f1f77bcf86cd799439001",
    "storeId": "507f1f77bcf86cd799439011",
    "riderId": "507f1f77bcf86cd799439002",
    "deliveryInstruction": "Ring the doorbell",
    "deliveryLocation": "123 Main St, Apt 4B",
    "deliveryMapLocation": "6.5244,3.3792",
    "code": "1234",
    "status": "ongoing",
    "orderProgressStatus": "riderOnHisWay",
    "price": 7500,
    "serviceCharge": 225,
    "deliveryFee": 500,
    "couponPrice": 0,
    "isPaidFor": true,
    "orderTransactionID": "507f1f77bcf86cd799439018",
    "createdAt": "2024-01-15T14:30:00Z",
    "updatedAt": "2024-01-15T15:00:00Z",
    "store": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Jane's Grocery",
      "image": "https://example.com/store.jpg"
    },
    "customer": {
      "_id": "507f1f77bcf86cd799439001",
      "email": "john@example.com",
      "firstName": "John"
    },
    "cart": {
      "_id": "507f1f77bcf86cd799439011",
      "cartItems": ["507f1f77bcf86cd799439016"],
      "userId": "507f1f77bcf86cd799439001",
      "storeId": "507f1f77bcf86cd799439011",
      "isCompleted": true
    }
  }
]
```

### 2. Get Order by ID
```http
GET /api/orders/{orderId}
Authorization: Bearer {token}

Response 200:
{
  "_id": "507f1f77bcf86cd799439017",
  /* ... full order details including customer phone number ... */
  "customer": {
    "_id": "507f1f77bcf86cd799439001",
    "email": "john@example.com",
    "firstName": "John",
    "phoneNumber": "+2348012345678"
  }
}
```

### 3. Checkout (Create Order)
```http
POST /api/orders/checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "totalPrice": 7500,
  "cartId": "507f1f77bcf86cd799439011",
  "storeId": "507f1f77bcf86cd799439011",
  "isErrand": false,
  "deliveryLocation": "123 Main St, Apt 4B",
  "deliveryMapLocation": "6.5244,3.3792",
  "deliveryInstruction": "Ring the doorbell",
  "deliveryFee": 500,
  "serviceCharge": 225,
  "code": 1234,
  "couponPrice": 0,
  "checkoutType": "wallet",
  "cardId": null
}

Response 200:
{
  "_id": "507f1f77bcf86cd799439017",
  "cartId": "507f1f77bcf86cd799439011",
  "customerId": "507f1f77bcf86cd799439001",
  "storeId": "507f1f77bcf86cd799439011",
  "status": "ongoing",
  "orderProgressStatus": "orderReceivedByVendor",
  "price": 7500,
  "isPaidFor": true,
  /* ... */
}
```

**Checkout Types:**
- `"wallet"`: Deducts from user's virtual bank account (requires min ₦100 balance after checkout)
- `"card"`: Charges user's saved card (requires `cardId`)

### 4. Update Order Progress
```http
PATCH /api/orders/{orderId}/orderProgress
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "riderOnHisWay"
}

Response 200:
{
  "message": "successfully updated order progress status"
}
```

**Valid Order Progress Statuses:**
- `orderCreated`
- `orderReceivedByVendor`
- `orderAcceptedByRider` (auto-assigns rider to order)
- `riderAtVendor`
- `riderOnHisWay`
- `riderAtUserLocation`

### 5. Complete Order
```http
POST /api/orders/{orderId}/complete
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "1234"
}

Response 200:
{
  /* completed order object */
}
```

**Note**: This triggers fund distribution:
- Store receives: `(price - deliveryFee) - serviceFee`
- Rider receives: `deliveryFee`
- Boiboi receives: `serviceFee`

**Service Fee Calculation:**
- ≤ ₦5,000: 3%
- ≤ ₦9,999: 5%
- > ₦10,000: 7%

### 6. Cancel Order
```http
PATCH /api/orders/{orderId}/cancel
Authorization: Bearer {token}

Response 200:
{
  /* cancelled order object with refund processed */
}
```

**Note**: 
- Can only cancel orders not yet assigned to a rider
- Refunds full amount to wallet

---

## 💳 Payments & Wallet

### 1. Create Virtual Bank Account
```http
POST /api/createBankAccount
Authorization: Bearer {token}

Response 200:
{
  "accountName": "John Doe",
  "accountNumber": "9876543210",
  "assigned": true,
  "currency": "NGN",
  "balance": 0,
  "active": true,
  "id": 12345,
  "createdAt": "2024-01-10T08:00:00Z",
  "updatedAt": "2024-01-10T08:00:00Z",
  "assignment": { /* ... */ },
  "customer": { /* ... */ }
}
```

### 2. Initialize Wallet Top-up
```http
POST /api/wallet/initializeTransaction
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 5000
}

Response 200:
{
  "status": true,
  "message": "Authorization URL created",
  "data": {
    "authorization_url": "https://checkout.paystack.com/xxxxxxxxx",
    "access_code": "xxxxxxxxx",
    "reference": "xxxxxxxxx"
  }
}
```

**Note**: User should be redirected to `authorization_url` to complete payment. Paystack will send webhook to backend on success.

### 3. Get Card Authorization URL
```http
POST /api/payment/cards/authorization
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "john@example.com",
  "amount": "100",
  "callback_url": "https://your-app.com/verify",
  "channels": ["card"],
  "metadata": {
    "type": "card_authorization"
  }
}

Response 200:
{
  "status": true,
  "message": "Authorization URL created",
  "data": {
    "authorization_url": "https://checkout.paystack.com/xxxxxxxxx",
    "access_code": "xxxxxxxxx",
    "reference": "xxxxxxxxx"
  }
}
```

### 4. Verify Card and Add to Account
```http
GET /api/payment/cards/verify/{reference}
Authorization: Bearer {token}

Response 200:
{
  "message": "card added successfully"
}
```

### 5. Withdraw from Wallet (Merchants/Riders Only)
```http
POST /api/wallet/withdrawals
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 10000
}

Response 200:
{
  "id": "507f1f77bcf86cd799439019",
  "userId": "507f1f77bcf86cd799439001",
  "amount": 10000,
  "type": "merchant",
  "status": "pending",
  "createdAt": "2024-01-15T16:00:00Z"
}
```

**Note**: 
- Requires bank account to be added first
- Wallet balance must be > ₦100 after withdrawal
- Processed within 24 hours by background worker

---

## 🔔 Notifications

### 1. Register Device for Push Notifications
```http
POST /api/notifications/registerDevice
Authorization: Bearer {token}
Content-Type: application/json

{
  "token": "firebase_device_token_here",
  "type": "android"
}

Response 200:
{
  "message": "Device registered successfully"
}
```

**Device Types:**
- `"android"`
- `"ios"`
- `"web"`

**Notification Events:**
- New order (merchant & riders)
- Order status updates (customers)
- Payment confirmations
- Wallet top-ups
- Withdrawal confirmations

---

## 💬 Support

### 1. Create Support Ticket
```http
POST /api/support/tickets
Authorization: Bearer {token}
Content-Type: application/json

{
  "subject": "Issue with order delivery",
  "message": "My order #1234 was not delivered properly..."
}

Response 200:
{
  "id": "507f1f77bcf86cd799439020",
  "userId": "507f1f77bcf86cd799439001",
  "subject": "Issue with order delivery",
  "message": "My order #1234 was not delivered properly...",
  "status": "open",
  "createdAt": "2024-01-15T16:30:00Z",
  "updatedAt": "2024-01-15T16:30:00Z"
}
```

### 2. Get My Support Tickets
```http
GET /api/support/tickets
Authorization: Bearer {token}

Response 200:
[
  {
    "id": "507f1f77bcf86cd799439020",
    "userId": "507f1f77bcf86cd799439001",
    "subject": "Issue with order delivery",
    "message": "My order #1234 was not delivered properly...",
    "status": "in_progress",
    "createdAt": "2024-01-15T16:30:00Z",
    "updatedAt": "2024-01-15T17:00:00Z"
  }
]
```

**Ticket Statuses:**
- `open`
- `in_progress`
- `closed`

---

## 🎟️ Coupons

### 1. Get Available Coupons
```http
GET /api/coupons
Authorization: Bearer {token}

Response 200:
[
  {
    "id": "507f1f77bcf86cd799439021",
    "desc": "10% off your first order",
    "code": "FIRST10",
    "type": "generic",
    "chargeType": "percent",
    "image": "https://example.com/coupon.jpg",
    "discount": 10,
    "isActive": true,
    "storeId": null
  },
  {
    "id": "507f1f77bcf86cd799439022",
    "desc": "₦500 off orders above ₦5000",
    "code": "SAVE500",
    "type": "store",
    "chargeType": "flat",
    "discount": 500,
    "isActive": true,
    "storeId": "507f1f77bcf86cd799439011"
  }
]
```

**Coupon Types:**
- `generic`: Works on all stores
- `store`: Works only on specific store

**Charge Types:**
- `percent`: Discount is a percentage (e.g., 10%)
- `flat`: Discount is a fixed amount (e.g., ₦500)

---

## 🔧 Admin (Merchants Only)

### Admin Login
```http
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@boiboi.com",
  "password": "AdminPass123"
}

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get All Stores (Admin)
```http
GET /api/admin/stores
Authorization: Bearer {admin_token}

Response 200:
[
  /* array of all stores */
]
```

### Get Store (Admin)
```http
GET /api/admin/stores/{storeId}
Authorization: Bearer {admin_token}

Response 200:
{
  /* store details */
}
```

### Edit Store (Admin)
```http
PATCH /api/admin/stores/{storeId}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "active"
}

Response 200:
{
  /* updated store */
}
```

### Get All Orders (Admin)
```http
GET /api/admin/orders
Authorization: Bearer {admin_token}

Response 200:
[
  /* array of all orders with full details */
]
```

### Get Riders (Admin)
```http
GET /api/admin/riders
Authorization: Bearer {admin_token}

Response 200:
[
  /* array of all riders */
]
```

### Change Rider Status (Admin)
```http
PATCH /api/admin/riders/{riderId}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "active"
}

Response 200:
{
  /* updated rider */
}
```

---

## 🌐 Public Endpoints (No Authentication Required)

### Get Latest App Version
```http
GET /api/public/latestAppVersion

Response 200:
{
  "id": "507f1f77bcf86cd799439023",
  "versionCode": 123,
  "latestVersionString": "1.2.3",
  "appName": "Boiboi",
  "kind": "customer"
}
```

### Health Check
```http
GET /api/ping

Response 200:
{
  "status": "ok",
  "message": "Boiboi Backend is running",
  "timestamp": 1705329600
}
```

---

## 📊 Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Access denied (e.g., admin-only route)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## 🔑 Authentication Header Format

All authenticated endpoints require:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 💡 Best Practices

1. **Store JWT token securely** in device's secure storage
2. **Handle token expiration**: Token expires after 1 year
3. **Register device for notifications** immediately after login
4. **Implement retry logic** for network failures
5. **Cache user data** to improve performance
6. **Show loading states** during API calls
7. **Handle errors gracefully** and show user-friendly messages
8. **Validate input** before sending to API
9. **Use HTTPS only** in production
10. **Update order status in real-time** using push notifications

---

## 🚀 Example Integration Flow

### Customer Order Flow:
1. User logs in → Store token
2. Register device for notifications
3. Browse vendors → `GET /api/vendors`
4. View vendor items → `GET /api/vendors/{id}/items`
5. Add items to cart (local state)
6. Checkout → `POST /api/orders/checkout`
7. Receive notification when order status changes
8. Track order → `GET /api/orders/{orderId}`
9. Complete order with code → `POST /api/orders/{orderId}/complete`

### Merchant Order Flow:
1. Merchant logs in → Store token
2. Register device for notifications
3. Receive push notification for new order
4. Fetch orders → `GET /api/orders?storeId={merchantStoreId}`
5. View order details → `GET /api/orders/{orderId}`
6. Prepare order (no API call needed)
7. Wait for rider acceptance

### Rider Order Flow:
1. Rider logs in → Store token
2. Register device for notifications
3. Receive push notification for new orders
4. View available orders → `GET /api/orders` (no filters = all orders)
5. Accept order → `PATCH /api/orders/{orderId}/orderProgress` with `status: "orderAcceptedByRider"`
6. Update progress as you go:
   - At vendor → `status: "riderAtVendor"`
   - On the way → `status: "riderOnHisWay"`
   - At customer → `status: "riderAtUserLocation"`
7. Customer completes order with code

---

## 📞 Support

For API issues or questions, contact: dev@useboiboi.com

---

**Generated**: January 2025  
**Version**: 1.0.0

