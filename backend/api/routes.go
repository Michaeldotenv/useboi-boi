package api

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"useboi-boi/backend/api/admin"
	"useboi-boi/backend/api/admin/manage_orders"
	"useboi-boi/backend/api/auth"
	"useboi-boi/backend/api/carts"
	"useboi-boi/backend/api/coupons"
	"useboi-boi/backend/api/inventories"
	"useboi-boi/backend/api/notifications"
	"useboi-boi/backend/api/orders"
	"useboi-boi/backend/api/payments"
	"useboi-boi/backend/api/public"
	"useboi-boi/backend/api/users"
	"useboi-boi/backend/api/vendors"

	"firebase.google.com/go/messaging"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetupRoutes(r *gin.Engine, db *mongo.Database, fcm *messaging.Client) {

	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		allowedOrigins := map[string]bool{
			"http://localhost:5173":          true,
			"https://admin.useboiboi.com":    true,
			"https://accounts.useboiboi.com": true,
			"https://useboiboi.vercel.app":   true,
		}

		if allowedOrigins[origin] {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}

		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, PATCH")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusOK)
			return
		}

		c.Next()
	})

	authRoute := r.Group("api/auth")

	publicRoute := r.Group("api/public")

	adminRoute := r.Group("api/admin")
	adminRoute.Use(AdminMiddleware(db))

	webhookRoute := r.Group("webhook")
	webhookRoute.Use(PaystackWebhooktMiddleware())

	mainRoute := r.Group("api")
	mainRoute.Use(AuthMiddleware(db))

	// Admin
	authRoute.POST("/admin/login", func(ctx *gin.Context) {
		admin.AdminLogin(ctx, db)
	})

	adminRoute.GET("/stores", func(ctx *gin.Context) {
		admin.GetStores(ctx, db)
	})
	adminRoute.GET("/stores/:id", func(ctx *gin.Context) {
		admin.GetStore(ctx, db)
	})
	adminRoute.PATCH("/stores/:id", func(ctx *gin.Context) {
		admin.EditStore(ctx, db)
	})
	adminRoute.POST("/store/:id/inventories", func(ctx *gin.Context) {
		admin.AddItemToStoreInventory(ctx, db)
	})

	adminRoute.GET("/deliveryServices", func(ctx *gin.Context) {
		admin.GetDeliveryServices(ctx, db)
	})
	adminRoute.GET("/deliveryServices/:id", func(ctx *gin.Context) {
		admin.GetDeliveryService(ctx, db)
	})
	adminRoute.PATCH("/deliveryServices/:id", func(ctx *gin.Context) {
		admin.EditDeliveryService(ctx, db)
	})
	adminRoute.GET("/riders", func(ctx *gin.Context) {
		admin.GetRiders(ctx, db)
	})
	adminRoute.PATCH("/riders/:id", func(ctx *gin.Context) {
		admin.ChangeRiderStatus(ctx, db)
	})

	adminRoute.GET("/orders", func(ctx *gin.Context) {
		manage_orders.GetAllOrders(ctx, db)
	})
	adminRoute.GET("/orders/:id", func(ctx *gin.Context) {
		manage_orders.GetOrder(ctx, db)
	})

	// Auth
	authRoute.POST("/signup", func(ctx *gin.Context) {
		auth.Signup(ctx, db)
	})
	authRoute.POST("/merchantSignup", func(ctx *gin.Context) {
		auth.MerchantSignup(ctx, db)
	})
	authRoute.POST("/riderSignup", func(ctx *gin.Context) {
		auth.RiderSignup(ctx, db)
	})
	authRoute.POST("/verifySignup", func(ctx *gin.Context) {
		auth.VerifySignup(ctx, db)
	})
	authRoute.POST("/verifyMerchantSignup", func(ctx *gin.Context) {
		auth.VerifyMerchantSignup(ctx, db)
	})
	authRoute.POST("/verifyRiderSignup", func(ctx *gin.Context) {
		auth.VerifyRiderSignup(ctx, db)
	})
	authRoute.POST("/login", func(ctx *gin.Context) {
		auth.Login(ctx, db)
	})
	authRoute.POST("/forgotPassword", func(ctx *gin.Context) {
		auth.ForgotPassword(ctx, db)
	})
	authRoute.POST("/resetPassword", func(ctx *gin.Context) {
		auth.ResetPassword(ctx, db)
	})

	// Vendors and Items
	mainRoute.GET("/vendors", func(ctx *gin.Context) {
		vendors.GetAllVendors(ctx, db)
	})
	mainRoute.GET("/vendors/:id", func(ctx *gin.Context) {
		vendors.GetVendor(ctx, db)
	})
	mainRoute.PATCH("/vendors/:id", func(ctx *gin.Context) {
		vendors.UpdateVendor(ctx, db)
	})
	mainRoute.GET("/vendors/:id/categories/", func(ctx *gin.Context) {
		inventories.GetCategories(ctx, db)
	})
	mainRoute.PATCH("/vendor/updateStoreImage", func(ctx *gin.Context) {
		vendors.UpdateStoreImage(ctx, db)
	})
	mainRoute.GET("/vendors/:id/items", func(ctx *gin.Context) {
		vendors.GetVendorItems(ctx, db)
	})

	// Vendor Inventories
	mainRoute.GET("/inventories/", func(ctx *gin.Context) {
		inventories.GetStoreItems(ctx, db)
	})
	mainRoute.POST("/inventories/categories/", func(ctx *gin.Context) {
		inventories.CreateCategory(ctx, db)
	})
	mainRoute.PATCH("/inventories/categories/:id", func(ctx *gin.Context) {
		inventories.UpdateCategory(ctx, db)
	})
	mainRoute.DELETE("/inventories/categories/", func(ctx *gin.Context) {
		inventories.DeleteCategory(ctx, db)
	})
	mainRoute.POST("/inventories/items/", func(ctx *gin.Context) {
		inventories.AddItemToStoreInventory(ctx, db)
	})
	mainRoute.GET("/inventories/items/:id", func(ctx *gin.Context) {
		inventories.GetItem(ctx, db)
	})
	mainRoute.PATCH("/inventories/items/:id", func(ctx *gin.Context) {
		inventories.UpdateItem(ctx, db)
	})
	mainRoute.DELETE("/inventories/items/:id", func(ctx *gin.Context) {
		inventories.RemoveItemFromStoreInventory(ctx, db)
	})

	// Coupons
	mainRoute.GET("/coupons", func(ctx *gin.Context) {
		coupons.GetCoupons(ctx, db)
	})

	// Carts
	mainRoute.GET("/carts/:id/items", func(ctx *gin.Context) {
		carts.GetItemsInCart(ctx, db)
	})

	// Orders
	mainRoute.GET("/orders", func(ctx *gin.Context) {
		orders.GetOrders(ctx, db)
	})
	mainRoute.GET("/orders/:id", func(ctx *gin.Context) {
		orders.GetOrder(ctx, db)
	})
	mainRoute.POST("/orders/checkout", func(ctx *gin.Context) {
		orders.Checkout(ctx, db, fcm)
	})
	mainRoute.POST("/orders/:id/complete", func(ctx *gin.Context) {
		orders.MarkOrderAsComplete(ctx, db)
	})
	mainRoute.PATCH("/orders/:id/cancel", func(ctx *gin.Context) {
		orders.CancelOrder(ctx, db)
	})
	mainRoute.PATCH("/orders/:id/orderProgress", func(ctx *gin.Context) {
		orders.UpdateOrderState(ctx, db, fcm)
	})

	// Payments
	mainRoute.POST("/createBankAccount", func(ctx *gin.Context) {
		payments.CreateVirtualBankAccountForUser(ctx, db)
	})
	mainRoute.POST("/wallet/initializeTransaction", func(ctx *gin.Context) {
		payments.InitializeTransaction(ctx, db)
	})
	webhookRoute.POST("/payment/capture", func(ctx *gin.Context) {
		payments.CapturePayment(ctx, db)
	})
	mainRoute.POST("payment/cards/authorization", func(ctx *gin.Context) {
		payments.GetAuthorizationUrl(ctx)
	})
	mainRoute.GET("payment/cards/verify/:reference", func(ctx *gin.Context) {
		payments.VerifyCardChargeAndAddCard(ctx, db)
	})
	mainRoute.POST("/wallet/withdrawals", func(ctx *gin.Context) {
		payments.WithdrawlFromWallet(ctx, db)
	})

	// Notifications
	mainRoute.POST("/notifications/registerDevice", func(ctx *gin.Context) {
		notifications.RegisterDevice(ctx, db)
	})

	// User
	mainRoute.POST("/user/bankAccount", func(ctx *gin.Context) {
		users.AddBankAccount(ctx, db)
	})
	mainRoute.POST("/user/:id", func(ctx *gin.Context) {
		users.GetUser(ctx, db)
	})
	mainRoute.GET("/user/me", func(ctx *gin.Context) {
		users.GetMe(ctx, db)
	})
	mainRoute.POST("/user/me", func(ctx *gin.Context) {
		users.GetMe(ctx, db)
	})
	mainRoute.PATCH("/user/:id", func(ctx *gin.Context) {
		users.EditUser(ctx, db)
	})
	mainRoute.GET("/user/wallet/transactions", func(ctx *gin.Context) {
		users.GetWalletTransactions(ctx, db)
	})
	mainRoute.GET("/user/wallet/withdrawalRequests", func(ctx *gin.Context) {
		users.GetPendingWithdrawals(ctx, db)
	})

	// Public
	publicRoute.GET("/latestAppVersion", func(ctx *gin.Context) {
		public.GetCustomerAppVersion(ctx, db)
	})

	// Health check endpoint
	r.GET("/api/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"message":   "Boiboi Backend is running",
			"timestamp": time.Now().Unix(),
		})
	})

	go WithdrawalProcessor(db)

	go VirtualAccountProcessor(db)

	go RatingComputer(db)

	go func() {
		for {
			_, err := http.Get(os.Getenv("PING_URL"))
			if err != nil {
				fmt.Println("Error pinging the endpoint:", err)
			}
			time.Sleep(14 * time.Minute)
		}
	}()

}
