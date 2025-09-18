package data

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type User struct {
	ID                 primitive.ObjectID  `bson:"_id" json:"id"`
	FirstName          string              `bson:"firstName" json:"firstName"`
	LastName           string              `bson:"lastName" json:"lastName"`
	Email              string              `bson:"email" json:"email"`
	Status             string              `bson:"status" json:"status"` // pending, active, disabled
	PhoneNumber        string              `bson:"phoneNumber,omitempty" json:"phoneNumber,omitempty"`
	Type               string              `bson:"type" json:"type"` // base, merchant, rider
	IsAdmin            *bool               `bson:"isAdmin,omitempty" json:"isAdmin,omitempty"`
	DeliveryService    *primitive.ObjectID `bson:"deliveryService,omitempty" json:"deliveryService,omitempty"`
	Username           string              `bson:"username" json:"username"`
	Password           string              `bson:"password" json:"password"`
	StoreId            *primitive.ObjectID `bson:"storeId,omitempty" json:"storeId,omitempty"`
	VirtualBankAccount *VirtualBankAccount `bson:"virtualBankAccount,omitempty" json:"virtualBankAccount,omitempty"`
	Cards              []Card              `bson:"cards,omitempty" json:"cards,omitempty"`
	Banks              []WithdrawalBank    `bson:"banks,omitempty" json:"banks,omitempty"`
	P2PBalance         float64             `bson:"p2pBalance,omitempty" json:"p2pBalance,omitempty"`
}

type VirtualBankAccount struct {
	AccountName   string     `bson:"accountname" json:"account_name"`
	AccountNumber string     `bson:"accountnumber" json:"account_number"`
	Assigned      bool       `json:"assigned"`
	Currency      string     `json:"currency"`
	Balance       float64    `json:"balance"`
	Active        bool       `json:"active"`
	ID            int        `json:"id"`
	CreatedAt     time.Time  `bson:"createdAt" json:"created_at"`
	UpdatedAt     time.Time  `bson:"updatedAt" json:"updated_at"`
	Assignment    Assignment `json:"assignment"`
	Customer      Customer   `json:"customer"`
}

type WithdrawalBank struct {
	ID            primitive.ObjectID `bson:"_id" json:"id"`
	Type          string             `bson:"type" json:"type"` // nuban
	Name          string             `bson:"name" json:"name"`
	BankName      string             `bson:"bankName" json:"bankName"`
	AccountNumber string             `bson:"accountNumber" json:"accountNumber"`
	Status        string             `bson:"status" json:"status"`
	RecipientCode string             `bson:"recipientCode" json:"recipientCode"`
}

type SignupRequest struct {
	FirstName       string `json:"firstName"`
	LastName        string `json:"lastName"`
	Email           string `json:"email"`
	Phone           string `json:"phone"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirmPassword"`
}

type RiderSignupRequest struct {
	FirstName           string `json:"firstName"`
	LastName            string `json:"lastName"`
	Email               string `json:"email"`
	Phone               string `json:"phone"`
	Password            string `json:"password"`
	ConfirmPassword     string `json:"confirmPassword"`
	DeliveryServiceCode string `json:"deliveryServiceCode"`
}

type MerchantSignupRequest struct {
	FirstName        string `json:"firstName"`
	LastName         string `json:"lastName"`
	Email            string `json:"email"`
	Phone            string `json:"phone"`
	Password         string `json:"password"`
	ConfirmPassword  string `json:"confirmPassword"`
	NameOfStore      string `json:"nameOfStore"`
	StoreDescription string `json:"storeDescription"`
}

type OtpRequest struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

type OtpModel struct {
	Email       string    `json:"email" bson:"email"`
	Code        string    `json:"code" bson:"code"`
	FirstName   string    `json:"firstName" bson:"firstName"`
	LastName    string    `json:"lastName" bson:"lastName"`
	Phone       string    `json:"phone" bson:"phone"`
	Password    string    `json:"password" bson:"password"`
	TimeCreated time.Time `json:"timeCreated" bson:"timeCreated"`
}

type MerchantOtpModel struct {
	OtpModel         `bson:"inline"`
	NameOfStore      string `json:"nameOfStore" bson:"nameOfStore"`
	StoreDescription string `json:"storeDescription" bson:"storeDescription"`
}

type RiderOtpModel struct {
	OtpModel            `bson:"inline"`
	DeliveryServiceCode string `json:"deliveryServiceCode"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Store struct {
	ID             primitive.ObjectID   `bson:"_id" json:"id"`
	Status         string               `bson:"status" json:"status"`
	Name           string               `bson:"name" json:"name"`
	Image          *string              `bson:"image" json:"image"`
	Description    string               `bson:"description" json:"description"`
	Address        *string              `bson:"address,omitempty" json:"address,omitempty"`
	Categories     []primitive.ObjectID `bson:"categories" json:"categories"`
	Items          []primitive.ObjectID `bson:"items" json:"items"`
	LikedByUserIds []primitive.ObjectID `bson:"likedByUserIds" json:"likedByUserIds"`
	MapLocation    *string              `bson:"mapLocation,omitempty" json:"mapLocation,omitempty"`
	Ratings        *float64             `bson:"ratings,omitempty" json:"ratings,omitempty"`
	Type           string               `bson:"type" json:"type"`
	OpeningTime    string               `bson:"openingTime,omitempty" json:"openingTime,omitempty"`
	ClosingTime    string               `bson:"closingTime,omitempty" json:"closingTime,omitempty"`
	AvailableDays  []string             `bson:"availableDays,omitempty" json:"availableDays,omitempty"`
}

type OrderTransaction struct {
	ID                     primitive.ObjectID  `bson:"_id,omitempty" json:"id,omitempty"`
	CartID                 *primitive.ObjectID `bson:"cartId,omitempty" json:"cartId,omitempty"`
	CreatedAt              time.Time           `bson:"createdAt" json:"createdAt"`
	CustomerID             primitive.ObjectID  `bson:"customerId" json:"customerId"`
	TotalPrice             float64             `bson:"totalPrice" json:"totalPrice"`
	TransactionReferenceID string              `bson:"transactionReferenceId" json:"transactionReferenceId"`
	UpdatedAt              time.Time           `bson:"updatedAt" json:"updatedAt"`
	VendorID               primitive.ObjectID  `bson:"vendorId" json:"vendorId"`
}

type ServiceFee struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Fee      float64            `bson:"fee" json:"fee"`
	Location *string            `bson:"location,omitempty" json:"location,omitempty"`
}

type Coupon struct {
	ID         primitive.ObjectID  `bson:"_id,omitempty" json:"id,omitempty"`
	Desc       string              `bson:"desc" json:"desc"`
	Code       string              `bson:"code" json:"code"`
	Type       string              `bson:"type" json:"type"`             // generic, store
	ChargeType string              `bson:"chargeType" json:"chargeType"` // flat, percent
	Image      *string             `bson:"image,omitempty" json:"image,omitempty"`
	Discount   float64             `bson:"discount" json:"discount"`
	IsActive   bool                `bson:"isActive" json:"isActive"`
	StoreID    *primitive.ObjectID `bson:"storeId,omitempty" json:"storeId,omitempty"`
}

type DeliveryService struct {
	ID                 primitive.ObjectID `bson:"_id" json:"id"`
	Status             string             `bson:"status" json:"status"`
	AdminID            primitive.ObjectID `bson:"adminId" json:"adminId"`
	SignupCode         string             `bson:"signupCode" json:"signupCode"`
	Name               string             `bson:"name" json:"name"`
	VirtualBankAccount VirtualBankAccount `bson:"virtualBankAccount" json:"virtualBankAccount"`
}

type DeliveryFee struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Distance     float64            `bson:"distance" json:"distance"`
	DistanceUnit string             `bson:"distanceUnit" json:"distanceUnit"`
	Fee          float64            `bson:"fee" json:"fee"`
}

type Item struct {
	ID               primitive.ObjectID  `bson:"_id,omitempty" json:"id,omitempty"`
	Status           *string             `bson:"status,omitempty" json:"status,omitempty"` // active, deleted, inactive
	CategoryID       *primitive.ObjectID `bson:"categoryId,omitempty" json:"categoryId,omitempty"`
	Category         *string             `bson:"category,omitempty" json:"category,omitempty"`
	CurrentInventory *int                `bson:"currentInventory,omitempty" json:"currentInventory,omitempty"`
	Desc             *string             `bson:"desc,omitempty" json:"desc,omitempty"`
	Image            *string             `bson:"image,omitempty" json:"image,omitempty"`
	Name             *string             `bson:"name,omitempty" json:"name,omitempty"`
	Price            *float64            `bson:"price,omitempty" json:"price,omitempty"`
	StoreID          *primitive.ObjectID `bson:"storeId,omitempty" json:"storeId,omitempty"`
	CreatedAt        *time.Time          `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt        *time.Time          `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}

type Notification struct {
	ID           primitive.ObjectID  `bson:"_id,omitempty" json:"id,omitempty"`
	CreatedAt    *primitive.ObjectID `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	Message      *string             `bson:"message,omitempty" json:"message,omitempty"`
	ReceipientID *primitive.ObjectID `bson:"receipientId,omitempty" json:"receipientId,omitempty"`
}

// Order Progress Statuses: orderCreated, orderReceivedByVendor, orderAcceptedByRider, riderAtVendor, riderOnHisWay, riderAtUserLocation
// Errand Progress Statuses: errandCreated, errandReceivedByRider, riderOnHisWay, riderAtUserLocation

type Order struct {
	ID                  primitive.ObjectID  `bson:"_id,omitempty" json:"id,omitempty"`
	CartID              primitive.ObjectID  `bson:"cartId" json:"cartId"`
	CustomerID          primitive.ObjectID  `bson:"customerId" json:"customerId"`
	StoreID             primitive.ObjectID  `bson:"storeId" json:"storeId"`
	DeliveryInstruction *string             `bson:"deliveryInstruction,omitempty" json:"deliveryInstruction,omitempty"`
	DeliveryLocation    *string             `bson:"deliveryLocation,omitempty" json:"deliveryLocation,omitempty"`
	Code                string              `bson:"code" json:"code"`
	DeliveryMapLocation *string             `bson:"deliveryMapLocation,omitempty" json:"deliveryMapLocation,omitempty"`
	Status              *string             `bson:"status,omitempty" json:"status,omitempty"`
	OrderProgressStatus *string             `bson:"orderProgressStatus,omitempty" json:"orderProgressStatus,omitempty"`
	Price               float64             `bson:"price" json:"price"`
	DeliveryFee         *float64            `bson:"deliveryFee,omitempty" json:"deliveryFee,omitempty"`
	ServiceCharge       *float64            `bson:"serviceCharge,omitempty" json:"serviceCharge,omitempty"`
	CouponPrice         *float64            `bson:"couponPrice,omitempty" json:"couponPrice,omitempty"`
	IsPaidFor           bool                `bson:"isPaidFor" json:"isPaidFor"`
	OrderTransactionID  *primitive.ObjectID `bson:"orderTransactionId,omitempty" json:"orderTransactionId,omitempty"`
	RiderID             *primitive.ObjectID `bson:"riderId,omitempty" json:"riderId,omitempty"`
	RiderRating         *int                `bson:"riderRating,omitempty" json:"riderRating,omitempty"`
	RiderReviewID       *primitive.ObjectID `bson:"riderReviewId,omitempty" json:"riderReviewId,omitempty"`
	VendorRating        *int                `bson:"vendorRating,omitempty" json:"vendorRating,omitempty"`
	VendorReviewID      *primitive.ObjectID `bson:"vendorReviewId,omitempty" json:"vendorReviewId,omitempty"`
	CreatedAt           *time.Time          `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt           *time.Time          `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}

type Location struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	IsActive    bool               `bson:"isActive" json:"isActive"`
	Address     string             `bson:"address" json:"address"`
	MapLocation *string            `bson:"mapLocation,omitempty" json:"mapLocation,omitempty"`
}

type Cart struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty" json:"id,omitempty"`
	IsCompleted *bool                `bson:"isCompleted,omitempty" json:"isCompleted,omitempty"`
	CartItems   []primitive.ObjectID `bson:"cartItems" json:"cartItems"`
	UserID      primitive.ObjectID   `bson:"userId" json:"userId"`
	StoreID     primitive.ObjectID   `bson:"storeId" json:"storeId"`
}

type CartItem struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	CartID        primitive.ObjectID `bson:"cartId" json:"cartId"`
	ItemID        primitive.ObjectID `bson:"itemId,omitempty" json:"itemId,omitempty"`
	Quantity      int                `bson:"quantity" json:"quantity"`
	IsAddedToCart bool               `bson:"isAddedToCart" json:"isAddedToCart"`
}

type Category struct {
	ID      primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name    string             `bson:"name" json:"name"`
	StoreId primitive.ObjectID `bson:"storeId" json:"storeId"`
}

type Review struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	CustomerID  primitive.ObjectID `bson:"customerId" json:"customerId"`
	Description *string            `bson:"description,omitempty" json:"description,omitempty"`
	OrderID     primitive.ObjectID `bson:"orderId" json:"orderId"`
	StoreID     primitive.ObjectID `bson:"storeId" json:"storeId"`
	CreatedAt   *time.Time         `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt   *time.Time         `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}

type RiderRating struct {
	ID        primitive.ObjectID `bson:"_id" json:"id"`
	UserId    primitive.ObjectID `bson:"customerId" json:"customerId"`
	Value     float64            `bson:"value" json:"value"`
	UpdatedAt *time.Time         `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}

type DistanceTimeFactor struct {
	ID     primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Factor float64            `bson:"factor" json:"factor"`
}

type Assignment struct {
	Integration  int       `json:"integration"`
	AssigneeID   int       `json:"assignee_id"`
	AssigneeType string    `json:"assignee_type"`
	Expired      bool      `json:"expired"`
	AccountType  string    `json:"account_type"`
	AssignedAt   time.Time `json:"assigned_at"`
}

type Customer struct {
	ID           int    `json:"id"`
	FirstName    string `json:"first_name"`
	LastName     string `json:"last_name"`
	Email        string `json:"email"`
	CustomerCode string `json:"customer_code"`
	Phone        string `json:"phone"`
	RiskAction   string `json:"risk_action"`
}

type WalletTransactions struct {
	ID                   primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	PaymentTransactionId string             `bson:"paymentTransactionId" json:"paymentTransactionId"`
	UserId               primitive.ObjectID `bson:"userId" json:"userId"`
	Amount               float64            `bson:"amount" json:"amount"`
	Type                 string             `bson:"type" json:"type"` // debit, credit
	CreatedAt            time.Time          `bson:"createdAt" json:"createdAt"`
}

type TransactionRequest struct {
	Email       string            `json:"email"`
	Amount      string            `json:"amount"`
	CallbackURL string            `json:"callback_url"`
	Channels    []string          `json:"channels,omitempty"`
	Metadata    map[string]string `json:"metadata"`
}

type Card struct {
	ID                float64 `bson:"id" json:"id"`
	AuthorizationCode string  `bson:"authorizationCode" json:"authorizationCode"`
	Bank              string  `bson:"bank" json:"bank"`
	CardType          string  `bson:"cardType" json:"cardType"`
	IsSelected        bool    `bson:"isSelected" json:"isSelected"`
}

type BoiboiAccount struct {
	ID        primitive.ObjectID `bson:"_id" json:"id"`
	Currency  string             `bson:"currency" json:"currency"`
	Balance   float64            `bson:"balance" json:"balance"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type OrderCheckoutSettings struct {
	ID            primitive.ObjectID `bson:"_id" json:"id"`
	StorePercent  float64            `bson:"storePercent" json:"storePercent"`
	BoiboiPercent float64            `bson:"boiboiPercent" json:"boiboiPercent"`
}

type WithdrawalRequest struct {
	ID        primitive.ObjectID `bson:"_id" json:"id"`
	UserID    primitive.ObjectID `bson:"userId" json:"userId"`
	Amount    float64            `bson:"amount" json:"amount"`
	Type      string             `bson:"type" json:"type"` // merchant, rider
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	Status    string             `bson:"status" json:"status"` // "pending", "processed"
}

func (o OtpModel) IsOTPValid(enteredOTP string, savedOtp *OtpModel) bool {
	if enteredOTP != savedOtp.Code {
		return false
	}

	timeElapsed := time.Since(savedOtp.TimeCreated)

	return 10*time.Minute > timeElapsed
}

type DeviceToken struct {
	ID        primitive.ObjectID `bson:"_id" json:"id"`
	UserId    primitive.ObjectID `bson:"userId" json:"userId"`
	Token     string             `bson:"token" json:"token"`
	Type      string             `bson:"type" json:"type"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}

type AdminAccount struct {
	ID  primitive.ObjectID `bson:"_id" json:"id"`
	Key string             `bson:"key" json:"key"`
}

type Error struct {
	Error string `json:"error"`
}

type JWTResponse struct {
	Token string `json:"token"`
}

type ResetPasswordToken struct {
	ID    primitive.ObjectID `bson:"_id" json:"id"`
	Email string             `bson:"email" json:"email"`
	Token string             `bson:"token" json:"token"`
}

type AppVersion struct {
	ID                  primitive.ObjectID `bson:"_id" json:"id"`
	VersionCode         int64              `bson:"versionCode" json:"versionCode"`
	LatestVersionString string             `bson:"latestVersionString" json:"latestVersionString"`
	AppName             string             `bson:"appName" json:"appName"`
	Kind                string             `bson:"kind" json:"kind"`
}
