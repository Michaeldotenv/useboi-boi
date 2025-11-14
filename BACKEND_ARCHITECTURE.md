# Boiboi Backend Architecture - Complete Analysis

## Overview
The Boiboi backend is a **Go-based REST API** built with the **Gin framework**, using **MongoDB** as the database and **Firebase Cloud Messaging (FCM)** for push notifications. It's a food delivery and marketplace platform with three user types: customers, merchants (vendors), and riders.

---

## Tech Stack
- **Language**: Go 1.23+
- **Web Framework**: Gin (v1.10.0)
- **Database**: MongoDB (mongo-driver v1.17.1)
- **Authentication**: JWT (dgrijalva/jwt-go, golang-jwt/jwt)
- **Payment Gateway**: Paystack
- **Push Notifications**: Firebase Cloud Messaging
- **Email**: SMTP via gomail.v2
- **Password Hashing**: bcrypt (golang.org/x/crypto)
- **API Documentation**: Swagger (swaggo)

---

## Project Structure

```
backend/
├── cmd/app/
│   ├── main.go              # Application entry point
│   └── docs/                # Swagger documentation
├── api/
│   ├── routes.go            # Route definitions
│   ├── middlewares.go       # Auth & logging middleware
│   ├── workers.go           # Background workers
│   ├── admin/               # Admin endpoints
│   ├── auth/                # Authentication endpoints
│   ├── carts/               # Shopping cart management
│   ├── coupons/             # Coupon/discount system
│   ├── inventories/         # Store inventory management
│   ├── notifications/       # Push notification registration
│   ├── orders/              # Order processing
│   ├── payments/            # Payment & wallet management
│   ├── public/              # Public endpoints (no auth)
│   ├── support/             # Support ticket system
│   ├── users/               # User profile management
│   └── vendors/             # Store/vendor management
├── internal/data/
│   ├── db.go                # MongoDB connection
│   └── models.go            # Data models
└── utils/
    ├── constants.go         # Collection names & constants
    ├── email.go             # Email templates & sending
    ├── jwt.go               # JWT generation
    ├── notifications.go     # FCM notification helpers
    ├── orders.go            # Order notification logic
    ├── otp.go               # OTP generation
    └── utils.go             # Helper functions
```

---

## Core Data Models

### User Types
1. **Base User** (Customer) - Regular users who place orders
2. **Merchant** - Store owners who manage inventory and fulfill orders
3. **Rider** - Delivery personnel who transport orders

### Key Models

#### User
```go
- ID, FirstName, LastName, Email, PhoneNumber
- Type: "base" | "merchant" | "rider"
- Status: "pending" | "active" | "disabled"
- StoreId: (for merchants)
- DeliveryService: (for riders)
- VirtualBankAccount: Paystack virtual account
- Cards: Saved payment cards
- Banks: Withdrawal bank accounts
- P2PBalance: Peer-to-peer rider balance
```

#### Store
```go
- ID, Name, Description, Image, Address
- Status: "pending" | "active"
- Categories: Array of category IDs
- Items: Array of item IDs
- LikedByUserIds: Users who saved the store
- Ratings: Average rating
- OpeningTime, ClosingTime, AvailableDays
```

#### Order
```go
- ID, CartID, CustomerID, StoreID, RiderID
- Status: "ongoing" | "completed" | "cancelled"
- OrderProgressStatus: 
  * "orderReceivedByVendor"
  * "orderAcceptedByRider"
  * "riderAtVendor"
  * "riderOnHisWay"
  * "riderAtUserLocation"
- Price, DeliveryFee, ServiceCharge, CouponPrice
- Code: 4-digit verification code
- DeliveryLocation, DeliveryMapLocation
- IsPaidFor: boolean
```

#### Cart & CartItem
```go
Cart:
- ID, UserID, StoreID
- CartItems: Array of CartItem IDs
- IsCompleted: boolean

CartItem:
- ID, CartID, ItemID
- Quantity: int
- IsAddedToCart: boolean
```

#### Item (Inventory)
```go
- ID, Name, Description, Image, Price
- StoreID, CategoryID
- CurrentInventory: Stock count
- Status: "active" | "inactive" | "deleted"
```

---

## Authentication & Authorization

### JWT-Based Authentication
- **Signing Key**: Environment variable `JWT_SIGNING_KEY`
- **Token Claims**: `userId`, `email`
- **Middleware**: `AuthMiddleware` validates JWT on protected routes

### User Flows

#### 1. Customer Signup
```
POST /api/auth/signup
→ Generate 4-digit OTP
→ Send OTP via email
→ POST /api/auth/verifySignup
→ Create user account
→ Create Paystack virtual account
→ Return JWT token
```

#### 2. Merchant Signup
```
POST /api/auth/merchantSignup
→ Generate OTP
→ POST /api/auth/verifyMerchantSignup
→ Create user + store (status: "pending")
→ Create virtual account
→ Return JWT token
```

#### 3. Rider Signup
```
POST /api/auth/riderSignup (requires deliveryServiceCode)
→ Generate OTP
→ POST /api/auth/verifyRiderSignup
→ Create rider account (status: "pending")
→ Admin must approve rider
```

#### 4. Login
```
POST /api/auth/login
→ Validate email/password (bcrypt)
→ Check rider approval status
→ Return JWT token + user data
```

---

## Payment System (Paystack Integration)

### Virtual Bank Accounts
- Each user gets a **dedicated Paystack virtual account**
- Funds deposited to this account credit the user's wallet
- Webhook captures payment events: `charge.success`, `charge.failed`

### Wallet System
```go
VirtualBankAccount:
- AccountName, AccountNumber
- Balance: Current wallet balance
- Currency: "NGN"
```

### Checkout Flow

#### Option 1: Wallet Checkout
```
POST /api/orders/checkout (checkoutType: "wallet")
→ Verify wallet balance (must leave ₦100 minimum)
→ Deduct order amount from wallet
→ Create order + transaction
→ Mark cart as completed
→ Send notifications (customer, riders, merchant)
```

#### Option 2: Card Checkout
```
POST /api/orders/checkout (checkoutType: "card", cardId: X)
→ Charge saved card via Paystack
→ Create order if payment succeeds
→ Send notifications
```

### Saved Cards
- Users can save cards via authorization URL
- Cards stored with `authorizationCode` for future charges
- First card is set as default (`isSelected: true`)

### Withdrawals (Merchants & Riders)
```
POST /api/wallet/withdrawals
→ Create withdrawal request (status: "pending")
→ Background worker processes after 24 hours
→ Transfer to user's bank via Paystack
→ Update status to "processed"
```

---

## Order Lifecycle

### 1. Order Creation (Checkout)
```
Customer → Checkout → Order created
Status: "ongoing"
OrderProgressStatus: "orderReceivedByVendor"
```

### 2. Order Progress States
```
orderReceivedByVendor
  ↓ (Rider accepts)
orderAcceptedByRider (RiderID assigned)
  ↓
riderAtVendor
  ↓
riderOnHisWay
  ↓
riderAtUserLocation
  ↓ (Customer enters code)
completed
```

### 3. Order Completion
```
POST /api/orders/:id/complete (with verification code)
→ Validate code
→ Calculate payment splits:
  * SubTotal = Price - DeliveryFee
  * ServiceFee = 3% (≤₦5000), 5% (≤₦9999), 7% (>₦10000)
  * Merchant gets: SubTotal - ServiceFee
  * Rider gets: DeliveryFee
  * Boiboi gets: ServiceFee
→ Credit merchant wallet
→ Credit rider/delivery service wallet
→ Update Boiboi account balance
→ Mark order as "completed"
```

### 4. Order Cancellation
```
PATCH /api/orders/:id/cancel
→ Only allowed if no rider assigned
→ Refund full amount to customer wallet
→ Mark order as "cancelled"
```

---

## Notification System (Firebase FCM)

### Device Token Registration
```
POST /api/notifications/registerDevice
→ Store FCM token for user
```

### Notification Triggers

#### 1. New Order
- **Customer**: "Order placed successfully"
- **All Riders**: "New order available"
- **Merchant**: "New order from [Customer Name]"

#### 2. Order Progress Updates
- **orderAcceptedByRider**: "Rider [Name] accepted your order"
- **riderAtVendor**: "Rider at vendor picking up order"
- **riderOnHisWay**: "Order on the way"
- **riderAtUserLocation**: "Rider arrived. Code: XXXX"

---

## Background Workers

### 1. Withdrawal Processor
```go
Runs: Every 1 hour
→ Find withdrawal requests > 24 hours old
→ Process via Paystack transfer API
→ Update status to "processed"
→ Send email notification
```

### 2. Rating Computer
```go
Runs: Every 24 hours
→ Calculate rider ratings (last 30 completed orders)
→ Calculate store ratings (last 30 completed orders)
→ Update RiderRating and Store collections
```

### 3. Virtual Account Processor
```go
Runs: Every 7 hours
→ Find users without virtual accounts
→ Fetch from Paystack API
→ Update user records
```

### 4. Health Check Pinger
```go
Runs: Every 14 minutes
→ Ping PING_URL to keep service alive
```

---

## API Endpoints Summary

### Public Routes (No Auth)
```
POST   /api/auth/signup
POST   /api/auth/merchantSignup
POST   /api/auth/riderSignup
POST   /api/auth/verifySignup
POST   /api/auth/verifyMerchantSignup
POST   /api/auth/verifyRiderSignup
POST   /api/auth/login
POST   /api/auth/forgotPassword
POST   /api/auth/resetPassword
GET    /api/public/latestAppVersion
POST   /api/auth/admin/login
```

### Protected Routes (Requires JWT)

#### Users
```
GET    /api/user/me
PATCH  /api/user/:id
POST   /api/user/bankAccount
GET    /api/user/wallet/transactions
GET    /api/user/wallet/withdrawalRequests
```

#### Vendors/Stores
```
GET    /api/vendors
GET    /api/vendors/:id
PATCH  /api/vendors/:id
GET    /api/vendors/:id/items
POST   /api/vendors/:id/like
DELETE /api/vendors/:id/like
GET    /api/vendors/saved/me
PATCH  /api/vendor/updateStoreImage
```

#### Inventory
```
GET    /api/inventories/
POST   /api/inventories/items/
GET    /api/inventories/items/:id
PATCH  /api/inventories/items/:id
DELETE /api/inventories/items/:id
POST   /api/inventories/categories/
PATCH  /api/inventories/categories/:id
DELETE /api/inventories/categories/
```

#### Carts
```
POST   /api/carts
GET    /api/carts/:id/items
POST   /api/carts/:id/items
PATCH  /api/carts/:id/items/:itemId
DELETE /api/carts/:id/items/:itemId
```

#### Orders
```
GET    /api/orders (query: storeId, riderId, customerId, status)
GET    /api/orders/:id
POST   /api/orders/checkout
POST   /api/orders/:id/complete
PATCH  /api/orders/:id/cancel
PATCH  /api/orders/:id/orderProgress
```

#### Payments
```
POST   /api/createBankAccount
POST   /api/wallet/initializeTransaction
POST   /api/payment/cards/authorization
GET    /api/payment/cards/verify/:reference
POST   /api/wallet/withdrawals
```

#### Webhooks (IP Whitelisted)
```
POST   /webhook/payment/capture (Paystack webhook)
```

#### Admin Routes
```
GET    /api/admin/stores
GET    /api/admin/stores/:id
PATCH  /api/admin/stores/:id
GET    /api/admin/deliveryServices
GET    /api/admin/riders
PATCH  /api/admin/riders/:id
GET    /api/admin/orders
GET    /api/admin/orders/:id
```

---

## Security Features

### 1. Middleware Protection
- **AuthMiddleware**: Validates JWT, checks user exists and is active
- **AdminMiddleware**: Validates admin JWT with special admin key
- **PaystackWebhookMiddleware**: IP whitelist for Paystack webhooks

### 2. CORS Configuration
```go
Allowed Origins:
- http://localhost:5173
- https://admin.useboiboi.com
- https://accounts.useboiboi.com
- https://useboiboi.vercel.app
```

### 3. Password Security
- Passwords hashed with **bcrypt** (DefaultCost)
- OTP codes expire after **10 minutes**
- Reset tokens are single-use

### 4. Transaction Safety
- MongoDB sessions for atomic operations
- Wallet balance checks before deductions
- Minimum balance enforcement (₦100)

---

## Email System

### Templates (Embedded HTML)
1. **OTP Verification** - Account signup
2. **Welcome Email** - Customer, Merchant, Rider variants
3. **Wallet Topup** - Successful/Failed
4. **Withdrawal** - Successful/Failed
5. **Forgot Password** - Reset link

### SMTP Configuration
```
Server: mail.privateemail.com:465
From: Boiboi Team <hey@tackstry.com>
```

---

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://...
DB_NAME=boiboi

# JWT
JWT_SIGNING_KEY=secret_key

# Paystack
PAYSTACK_SECRET_KEY=sk_...
PAYSTACK_PREFERRED_BANK=wema-bank

# Firebase
GOOGLE_APPLICATION_CREDENTIALS=path/to/firebase-key.json
FIREBASE_PROJECT_ID=boiboi-775e3

# Email
BOIBOI_MAIL_PASSWORD=email_password

# Image Upload
IMGBB_API_KEY=imgbb_key

# Health Check
PING_URL=https://...

# Environment
APP_ENV=development|production
```

---

## Key Business Logic

### Service Fee Calculation
```go
if subTotal <= 5000:
    serviceFee = 3% of subTotal
elif subTotal <= 9999:
    serviceFee = 5% of subTotal
else:
    serviceFee = 7% of subTotal
```

### Delivery Services
- **BBP2P**: Boiboi's peer-to-peer delivery (riders get direct payment)
- **Third-party**: Delivery service admin receives payment

### Store Likes/Saves
- Users can save favorite stores
- Stored in `Store.likedByUserIds` array
- Endpoint to retrieve saved stores

### Coupon System
```go
Types: "generic" | "store"
ChargeType: "flat" | "percent"
Discount: Amount or percentage
```

---

## Database Collections

```
User                    - All user accounts
Store                   - Vendor stores
Item                    - Store inventory items
Category                - Item categories per store
Cart                    - Shopping carts
CartItem                - Items in carts
Order                   - Order records
OrderTransaction        - Payment transactions
WalletTransactions      - Wallet credit/debit history
WithdrawalRequest       - Pending withdrawals
DeliveryService         - Delivery companies
RiderRating             - Rider performance ratings
DeviceToken             - FCM push tokens
Otp                     - Signup OTP codes
ResetPasswordToken      - Password reset tokens
BoiboiAccount           - Platform revenue account
OrderCheckoutSettings   - Payment split configuration
SupportTicket           - Customer support
Coupon                  - Discount coupons
AdminAccount            - Admin credentials
AppVersion              - App version control
```

---

## Deployment

### Build Commands
```bash
# Development
make run

# Production build
make build              # Local
make build-linux        # Linux binary

# Docker
make docker-build
make docker-run

# Dependencies
make deps

# Swagger docs
make swagger
```

### Docker
```dockerfile
Port: 8082
Env file: skulpoint.env
```

---

## API Documentation
- **Swagger UI**: Available at `/swagger/*any`
- Generated with `swag init -g cmd/app/main.go -o cmd/app/docs`

---

## Error Handling Patterns

### Standard Error Response
```json
{
  "error": "Error message here"
}
```

### Success Response
```json
{
  "message": "Success message",
  "data": { ... }
}
```

---

## Performance Considerations

1. **MongoDB Aggregation Pipelines**: Used for complex queries with joins
2. **Indexing**: Likely on User.email, Order.customerId, Order.storeId
3. **Background Workers**: Offload heavy processing
4. **Connection Pooling**: MongoDB driver handles connection management
5. **Goroutines**: Workers run concurrently

---

## Potential Improvements

1. **Rate Limiting**: No rate limiting middleware currently
2. **Request Validation**: Could use more comprehensive validation
3. **Logging**: Basic logging, could use structured logging throughout
4. **Caching**: No caching layer (Redis) for frequently accessed data
5. **Testing**: No test files visible in structure
6. **API Versioning**: No version prefix in routes
7. **Pagination**: Not implemented for list endpoints
8. **Soft Deletes**: Items use status field, but not consistent across models

---

## Summary

The Boiboi backend is a well-structured food delivery platform with:
- ✅ Robust payment integration (Paystack)
- ✅ Real-time notifications (FCM)
- ✅ Multi-user type support (customers, merchants, riders)
- ✅ Wallet system with virtual accounts
- ✅ Order lifecycle management
- ✅ Background job processing
- ✅ Email notifications
- ✅ Admin panel support
- ✅ JWT authentication
- ✅ MongoDB transactions for data consistency

The architecture follows a clean separation of concerns with dedicated packages for different domains, making it maintainable and scalable.
