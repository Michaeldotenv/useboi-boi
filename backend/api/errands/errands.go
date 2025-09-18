package errands

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"boiboi-backend/internal/data"
	"boiboi-backend/utils"
	"strconv"
	"time"

	"firebase.google.com/go/messaging"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type ErrandCheckoutBody struct {
	TotalPrice          float64  `json:"totalPrice"`
	CartId              string   `json:"cartId"`
	StoreId             string   `json:"storeId"`
	IsErrand            bool     `json:"isErrand"`
	DeliveryLocation    *string  `json:"deliveryLocation"`
	DeliveryFee         float64  `json:"deliveryFee"`
	Code                int      `json:"code"`
	CouponPrice         *float64 `json:"couponPrice"`
	DeliveryMapLocation *string  `json:"deliveryMapLocation"`
	DeliveryInstruction *string  `json:"deliveryInstruction"`
	CheckoutType        string   `json:"checkoutType"` // card, wallet
	CardId              *float64 `json:"cardId"`
}

func Checkout(c *gin.Context, db *mongo.Database, fcm *messaging.Client) {
	var checkoutBody ErrandCheckoutBody
	if err := c.ShouldBindJSON(&checkoutBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request " + err.Error()})
		return
	}

	if len(checkoutBody.CartId) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cartId cannot be empty"})
		return
	}

	if len(checkoutBody.StoreId) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cartId cannot be empty"})
		return
	}

	if checkoutBody.IsErrand {
		c.JSON(http.StatusBadRequest, gin.H{"error": "order expected, errand payload sent"})
		return
	}

	if checkoutBody.CheckoutType == "card" {
		CheckoutFromCard(c, db, &checkoutBody, fcm)
	} else if checkoutBody.CheckoutType == "wallet" {
		CheckoutFromWallet(c, db, &checkoutBody, fcm)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request. invalid checkout type"})
		return
	}

}

func CheckoutFromWallet(c *gin.Context, db *mongo.Database, checkoutBody *ErrandCheckoutBody, fcm *messaging.Client) {

	userId, ok := c.Get("userId")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "userId not found"})
		return
	}

	userObjectId, err := primitive.ObjectIDFromHex(userId.(string))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "cannot create objectId from userId " + err.Error()})
		return
	}

	userCollection := db.Collection(utils.USER)
	walletTransactionCollection := db.Collection(utils.WALLET_TRANSACTIONS)

	var user data.User
	result := userCollection.FindOne(c, bson.M{"_id": userObjectId})
	result.Decode(&user)

	if user.ID.IsZero() {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "empty user object"})
		return
	}

	if user.VirtualBankAccount == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no wallet created for user"})
		return
	}

	walletBalance := user.VirtualBankAccount.Balance

	if walletBalance-checkoutBody.TotalPrice < 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "insufficient amount in wallet. Wallet balance cannot be less than 100 after checkout"})
		return
	}

	paymentReference := utils.GeneratePaymentReference()
	order, err := CreateOrder(c, db, checkoutBody, &paymentReference)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to create order " + err.Error()})
		return
	}

	transaction := data.WalletTransactions{
		ID:                   primitive.NewObjectID(),
		PaymentTransactionId: paymentReference,
		UserId:               userObjectId,
		Amount:               checkoutBody.TotalPrice,
		Type:                 "debit",
		CreatedAt:            time.Now(),
	}

	_, err = walletTransactionCollection.InsertOne(c, transaction)
	if err != nil {
		slog.Info("unable to create transaction", "error", err.Error())
	}

	c.JSON(http.StatusOK, *order)

	utils.SendSuccessfulOrderNotificationToCustomer(c, db, fcm, &user)
	utils.SendNewOrderNotificationToRiders(c, db, fcm)
	utils.SendNewOrderNotificationToMerchant(c, db, fcm, order)

}

func CheckoutFromCard(c *gin.Context, db *mongo.Database, checkoutBody *ErrandCheckoutBody, fcm *messaging.Client) {

	if checkoutBody.CardId == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cardId cannot be empty"})
		return
	}

	userId, ok := c.Get("userId")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "userId not found"})
		return
	}

	userObjectId, err := primitive.ObjectIDFromHex(userId.(string))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "userId not found"})
		return
	}

	userCollection := db.Collection(utils.USER)

	var user data.User
	result := userCollection.FindOne(c, bson.M{"_id": userObjectId})
	if err := result.Decode(&user); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "failed to decode user object"})
		return
	}

	cardId := checkoutBody.CardId
	var selectedCard *data.Card

	for _, c := range user.Cards {
		if c.ID == *cardId {
			selectedCard = &c
			break
		}
	}

	if selectedCard == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "selected card doesn't exist"})
		return
	}

	cardAuthCode := selectedCard.AuthorizationCode

	chargeRequestBody := map[string]interface{}{
		"email":              user.Email,
		"amount":             strconv.FormatFloat(checkoutBody.TotalPrice*100, 'f', 2, 64),
		"authorization_code": cardAuthCode,
		"metadata": map[string]interface{}{
			"type": "card",
		},
	}

	url := "https://api.paystack.co/transaction/charge_authorization"
	apiKey := os.Getenv("PAYSTACK_SECRET_KEY")

	payload, err := json.Marshal(chargeRequestBody)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encode request"})
		return
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
		return
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to make request"})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response"})
		return
	}

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {

		var responseData map[string]interface{}
		if err := json.Unmarshal(body, &responseData); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error unmarshaling JSON into map"})
			return
		}

		status := responseData["data"].(map[string]interface{})["status"].(string)
		gatewayResponse := responseData["data"].(map[string]interface{})["gateway_response"].(string)
		reference := responseData["data"].(map[string]interface{})["reference"].(string)

		if status != "success" && gatewayResponse != "Approved" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed chackout payment"})
			return
		}

		order, err := CreateOrder(c, db, checkoutBody, &reference)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "failed to create order " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, *order)

		utils.SendSuccessfulOrderNotificationToCustomer(c, db, fcm, &user)
		utils.SendNewOrderNotificationToRiders(c, db, fcm)
		utils.SendNewOrderNotificationToMerchant(c, db, fcm, order)

		return

	} else {
		var errorResponse map[string]interface{}
		jsonErr := json.Unmarshal(body, &errorResponse)
		if jsonErr != nil {
			fmt.Println("Error unmarshaling error response:", jsonErr)
			fmt.Println("Raw body:", string(body))
			c.JSON(http.StatusInternalServerError, errorResponse)
			return
		}
		c.JSON(http.StatusInternalServerError, errorResponse)
		return
	}

}

func CreateOrder(c *gin.Context, db *mongo.Database, checkoutBody *ErrandCheckoutBody, paymentReferenceId *string) (*data.Order, error) {

	var orderToCreate *data.Order

	userId, ok := c.Get("userId")
	if !ok {
		return nil, fmt.Errorf("UserId not found")
	}

	userObjectId, err := primitive.ObjectIDFromHex(userId.(string))
	if err != nil {
		return nil, err
	}

	orderTransactionCollection := db.Collection(utils.ORDER_TRANSACTIONS)
	orderCollection := db.Collection(utils.ORDER)
	cartCollection := db.Collection(utils.CART)
	userCollection := db.Collection(utils.USER)

	session, err := db.Client().StartSession()
	if err != nil {
		slog.Info("payment", "Failed to start db transaction session", err.Error())
		return nil, err
	}
	defer session.EndSession(c)

	_, err = session.WithTransaction(c, func(sessCtx mongo.SessionContext) (interface{}, error) {

		var user data.User
		result := userCollection.FindOne(c, bson.M{"_id": userObjectId})
		err := result.Decode(&user)
		if err != nil {
			return nil, err
		}

		if user.ID.IsZero() {
			return nil, fmt.Errorf("valid user not found")
		}

		virtualAccount := user.VirtualBankAccount

		cartId, err := primitive.ObjectIDFromHex(checkoutBody.CartId)
		if err != nil {
			return nil, err
		}
		storeId, err := primitive.ObjectIDFromHex(checkoutBody.StoreId)
		if err != nil {
			return nil, err
		}

		orderTransaction := data.OrderTransaction{
			ID:                     primitive.NewObjectID(),
			CartID:                 &cartId,
			CustomerID:             userObjectId,
			TotalPrice:             checkoutBody.TotalPrice,
			VendorID:               storeId,
			TransactionReferenceID: *paymentReferenceId,
			CreatedAt:              time.Now(),
			UpdatedAt:              time.Now(),
		}

		orderStatus := "ongoing"
		orderProgressStatus := "orderReceivedByVendor"
		createdAt := time.Now()

		order := data.Order{
			ID:                  primitive.NewObjectID(),
			CartID:              cartId,
			CustomerID:          userObjectId,
			StoreID:             storeId,
			DeliveryInstruction: checkoutBody.DeliveryInstruction,
			DeliveryLocation:    checkoutBody.DeliveryLocation,
			DeliveryMapLocation: checkoutBody.DeliveryMapLocation,
			Code:                strconv.Itoa(checkoutBody.Code),
			Status:              &orderStatus,
			OrderProgressStatus: &orderProgressStatus,
			Price:               checkoutBody.TotalPrice,
			DeliveryFee:         &checkoutBody.DeliveryFee,
			CouponPrice:         checkoutBody.CouponPrice,
			IsPaidFor:           true,
			OrderTransactionID:  &orderTransaction.ID,
			CreatedAt:           &createdAt,
			UpdatedAt:           &createdAt,
		}

		_, err = orderTransactionCollection.InsertOne(sessCtx, orderTransaction)
		if err != nil {
			return nil, err
		}

		_, err = orderCollection.InsertOne(sessCtx, order)
		if err != nil {
			return nil, err
		}

		cartCollection.FindOneAndUpdate(sessCtx, bson.M{"_id": order.CartID}, bson.M{
			"$set": bson.M{
				"isCompleted": true,
			},
		})

		userCollection.FindOneAndUpdate(sessCtx, bson.M{"_id": userObjectId}, bson.M{
			"$set": bson.M{
				"currentCartId": nil,
			},
		})

		userCollection.FindOneAndUpdate(sessCtx, bson.M{"_id": userObjectId}, bson.M{
			"$set": bson.M{
				"virtualBankAccount.balance": virtualAccount.Balance - order.Price,
			},
		})

		orderToCreate = &order

		return nil, nil

	})

	if err != nil {
		return nil, err
	}

	return orderToCreate, nil
}

func MarkOrderAsComplete(c *gin.Context, db *mongo.Database) {

	orderStringId := c.Param("id")

	requestBody := map[string]interface{}{}
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "error binding json " + err.Error()})
		return
	}
	code := requestBody["code"].(string)

	orderObjectId, err := primitive.ObjectIDFromHex(orderStringId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to get order objectId"})
		return
	}

	orderCheckoutCollection := db.Collection(utils.ORDER_CHECKOUT_SETTINGS)
	orderCollection := db.Collection(utils.ORDER)
	walletTransactionCollection := db.Collection(utils.WALLET_TRANSACTIONS)
	userCollection := db.Collection(utils.USER)
	boiboiCollection := db.Collection(utils.BOIBOI_ACCOUNT)

	var order data.Order
	if err := orderCollection.FindOne(c, bson.M{"_id": orderObjectId}).Decode(&order); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "order not found"})
		return
	}

	if code != order.Code {
		c.JSON(http.StatusBadRequest, gin.H{"error": "wrong order code inputted "})
		return
	}

	if *order.Status == "completed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "order has been marked as completed already"})
		return
	}

	if *order.Status == "cancelled" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "order has been marked as cancelled already"})
		return
	}

	session, err := db.Client().StartSession()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to start db transaction session: "})
		return
	}
	defer session.EndSession(c)

	// TODO()
	_, err = session.WithTransaction(c, func(sessCtx mongo.SessionContext) (interface{}, error) {

		var checkoutSettings data.OrderCheckoutSettings
		if err := orderCheckoutCollection.FindOne(sessCtx, bson.M{}).Decode(&checkoutSettings); err != nil {
			return nil, err
		}

		amountToPayToStore := (checkoutSettings.StorePercent / 100) * (order.Price - *order.DeliveryFee)
		amountToPayToRider := *order.DeliveryFee
		amountToPayToBoiboi := (checkoutSettings.StorePercent / 100) * (order.Price - *order.DeliveryFee)

		userCollection.FindOneAndUpdate(sessCtx, bson.M{"storeId": order.StoreID}, bson.M{
			"$inc": bson.M{
				"virtualBankAccount.balance": amountToPayToStore,
			},
		})

		var rider data.User
		if err := userCollection.FindOne(sessCtx, bson.M{"_id": order.RiderID}).Decode(&rider); err != nil {
			return nil, err
		}

		var deliveryAdmin data.User
		if err := userCollection.FindOne(sessCtx, bson.M{"deliveryService": rider.DeliveryService, "isAdmin": true}).Decode(&deliveryAdmin); err != nil {
			return nil, err
		}

		riderTransaction := data.WalletTransactions{
			ID:        primitive.NewObjectID(),
			UserId:    deliveryAdmin.ID,
			Amount:    amountToPayToRider,
			Type:      "credit",
			CreatedAt: time.Now(),
		}

		userCollection.FindOneAndUpdate(sessCtx, bson.M{"_id": deliveryAdmin.ID}, bson.M{
			"$inc": bson.M{
				"virtualBankAccount.balance": amountToPayToRider,
			},
		})

		_, err := walletTransactionCollection.InsertOne(sessCtx, riderTransaction)
		if err != nil {
			return nil, err
		}

		boiboiCollection.FindOneAndUpdate(sessCtx, bson.M{}, bson.M{
			"$inc": bson.M{
				"balance": amountToPayToBoiboi,
			},
		})

		orderCollection.FindOneAndUpdate(sessCtx, bson.M{"_id": orderObjectId}, bson.M{
			"$set": bson.M{
				"status": "completed",
			},
		})

		orderStatus := "completed"
		order.Status = &orderStatus

		return nil, nil

	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error marking order as complete " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, order)

}

func CancelOrder(c *gin.Context, db *mongo.Database) {

	orderId := c.Param("id")
	orderObjectId, err := primitive.ObjectIDFromHex(orderId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to create order object id " + err.Error()})
		return
	}

	orderCollection := db.Collection(utils.ORDER)
	userCollection := db.Collection(utils.USER)
	walletTransactionCollection := db.Collection(utils.WALLET_TRANSACTIONS)

	var order data.Order

	if err := orderCollection.FindOne(c, bson.M{"_id": orderObjectId}).Decode(&order); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "order not found. " + err.Error()})
		return
	}

	if *order.Status == "cancelled" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "order has been marked as cancelled already"})
		return
	}

	session, err := db.Client().StartSession()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to start db transaction session: "})
		return
	}
	defer session.EndSession(c)

	_, err = session.WithTransaction(c, func(sessCtx mongo.SessionContext) (interface{}, error) {

		orderCollection.FindOneAndUpdate(sessCtx, bson.M{"_id": orderObjectId}, bson.M{
			"$set": bson.M{
				"status": "cancelled",
			},
		})

		orderStatus := "cancelled"
		order.Status = &orderStatus

		userCollection.FindOneAndUpdate(sessCtx, bson.M{"_id": order.CustomerID}, bson.M{
			"$inc": bson.M{
				"virtualBankAccount.balance": order.Price,
			},
		})

		transaction := data.WalletTransactions{
			ID:                   primitive.NewObjectID(),
			PaymentTransactionId: utils.GeneratePaymentReference(),
			UserId:               order.CustomerID,
			Amount:               order.Price,
			Type:                 "credit",
			CreatedAt:            time.Now(),
		}

		_, err = walletTransactionCollection.InsertOne(sessCtx, transaction)
		if err != nil {
			return nil, err
		}

		return nil, nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error marking order as cancelled " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, order)

}

type OrderState struct {
	Status string `json:"status"`
}

func UpdateOrderState(c *gin.Context, db *mongo.Database, fcm *messaging.Client) {

	orderId := c.Param("id")
	orderObjectId, err := primitive.ObjectIDFromHex(orderId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to create order object id. " + err.Error()})
		return
	}

	var orderState OrderState
	if err := c.ShouldBindJSON(&orderState); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body " + err.Error()})
		return
	}

	if orderState.Status == "orderCreated" || orderState.Status == "orderReceivedByVendor" ||
		orderState.Status == "orderAcceptedByRider" || orderState.Status == "riderAtVendor" ||
		orderState.Status == "riderOnHisWay" || orderState.Status == "riderAtUserLocation" {
		orderCollection := db.Collection(utils.ORDER)

		_, err = orderCollection.UpdateOne(c, bson.M{"_id": orderObjectId}, bson.M{
			"$set": bson.M{
				"orderProgressStatus": orderState.Status,
			},
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update order progress status " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "successfully updated order progress status"})

		var order data.Order
		if err := orderCollection.FindOne(c, bson.M{"_id": orderObjectId}).Decode(&order); err != nil {
			slog.Info("error fetching order", "error", err.Error())
		}
		utils.SendOrderUpdateToCustomer(c, db, fcm, &order)

		return

	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "not a valid order progress status"})
		return
	}

}
