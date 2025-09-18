package orders

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/Michaeldotenv/useboi-boi/backend/internal/data"
	"github.com/Michaeldotenv/useboi-boi/backend/utils"

	"firebase.google.com/go/messaging"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type CheckoutBody struct {
	TotalPrice          float64  `json:"totalPrice"`
	CartId              string   `json:"cartId"`
	StoreId             string   `json:"storeId"`
	IsErrand            bool     `json:"isErrand"`
	DeliveryLocation    *string  `json:"deliveryLocation"`
	DeliveryFee         float64  `json:"deliveryFee"`
	ServiceCharge       float64  `json:"serviceCharge"`
	Code                int      `json:"code"`
	CouponPrice         *float64 `json:"couponPrice"`
	DeliveryMapLocation *string  `json:"deliveryMapLocation"`
	DeliveryInstruction *string  `json:"deliveryInstruction"`
	CheckoutType        string   `json:"checkoutType"` // card, wallet
	CardId              *float64 `json:"cardId"`
}

func Checkout(c *gin.Context, db *mongo.Database, fcm *messaging.Client) {
	var checkoutBody CheckoutBody
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

	if checkoutBody.TotalPrice < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "order cannot be placed, invalid amount"})
		return
	}

	storeCollection := db.Collection(utils.STORE)

	var store data.Store
	if err := storeCollection.FindOne(c, bson.M{"_id": checkoutBody.StoreId}).Decode(&store); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to get store. " + err.Error()})
		slog.Error("Failed to get store", "error", err.Error())
		return
	}

	if store.Status != "active" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "store is not active. cannot process order"})
		slog.Error("Store is not active. cannot process order", "error", "inactive store")
		return
	}

	switch checkoutBody.CheckoutType {
	case "card":
		CheckoutFromCard(c, db, &checkoutBody, fcm)
	case "wallet":
		CheckoutFromWallet(c, db, &checkoutBody, fcm)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request. invalid checkout type"})
		return
	}

}

func CheckoutFromWallet(c *gin.Context, db *mongo.Database, checkoutBody *CheckoutBody, fcm *messaging.Client) {

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

func CheckoutFromCard(c *gin.Context, db *mongo.Database, checkoutBody *CheckoutBody, fcm *messaging.Client) {

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

func CreateOrder(c *gin.Context, db *mongo.Database, checkoutBody *CheckoutBody, paymentReferenceId *string) (*data.Order, error) {

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
		slog.Info("Failed to start db transaction session: " + err.Error())
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
			ServiceCharge:       &checkoutBody.ServiceCharge,
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
	deliveryServiceCollection := db.Collection(utils.DELIVERY_SERVICE)
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

	_, err = session.WithTransaction(c, func(sessCtx mongo.SessionContext) (interface{}, error) {

		var checkoutSettings data.OrderCheckoutSettings
		if err := orderCheckoutCollection.FindOne(sessCtx, bson.M{}).Decode(&checkoutSettings); err != nil {
			return nil, err
		}

		delFee := 0.0
		if order.DeliveryFee != nil {
			delFee = *order.DeliveryFee
		}

		serviceFee := 0.0

		subTotalPrice := order.Price - delFee

		if subTotalPrice <= 5000 {
			serviceFee = 0.03 * subTotalPrice
		} else if subTotalPrice <= 9999 {
			serviceFee = 0.05 * subTotalPrice
		} else {
			serviceFee = 0.07 * subTotalPrice
		}

		amountToPayToStore := subTotalPrice - serviceFee
		amountToPayToRider := delFee
		amountToPayToBoiboi := serviceFee

		var vendorAdmin data.User
		if err := userCollection.FindOne(sessCtx, bson.M{"storeId": order.StoreID}).Decode(&vendorAdmin); err != nil {
			return nil, fmt.Errorf("no vendor admin connected to store. " + err.Error())
		}

		vendorTransaction := data.WalletTransactions{
			ID:        primitive.NewObjectID(),
			UserId:    vendorAdmin.ID,
			Amount:    amountToPayToStore,
			Type:      "credit",
			CreatedAt: time.Now(),
		}

		if err := userCollection.FindOneAndUpdate(sessCtx, bson.M{"storeId": order.StoreID}, bson.M{
			"$inc": bson.M{
				"virtualBankAccount.balance": amountToPayToStore,
			},
		}).Err(); err != nil {
			return nil, err
		}

		var rider data.User
		if err := userCollection.FindOne(sessCtx, bson.M{"_id": order.RiderID}).Decode(&rider); err != nil {
			return nil, err
		}

		var deliveryService data.DeliveryService
		if err := deliveryServiceCollection.FindOne(sessCtx, bson.M{"_id": rider.DeliveryService}).Decode(&deliveryService); err != nil {
			return nil, fmt.Errorf("no delivery service found. " + err.Error())
		}

		if deliveryService.SignupCode == "BBP2P" {

			_, err := userCollection.UpdateOne(sessCtx, bson.M{"_id": rider.ID}, bson.M{"$inc": bson.M{
				"p2pBalance": amountToPayToRider,
			}})
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update rider balance"})
				return nil, fmt.Errorf("failed to update rider balance. " + err.Error())
			}

			riderTransaction := data.WalletTransactions{
				ID:        primitive.NewObjectID(),
				UserId:    rider.ID,
				Amount:    amountToPayToRider,
				Type:      "credit",
				CreatedAt: time.Now(),
			}

			_, err = walletTransactionCollection.InsertOne(sessCtx, vendorTransaction)
			if err != nil {
				return nil, err
			}

			_, err = walletTransactionCollection.InsertOne(sessCtx, riderTransaction)
			if err != nil {
				return nil, err
			}

			if err := boiboiCollection.FindOneAndUpdate(sessCtx, bson.M{}, bson.M{
				"$inc": bson.M{
					"balance": amountToPayToBoiboi,
				},
			}).Err(); err != nil {
				return nil, err
			}

			orderCollection.FindOneAndUpdate(sessCtx, bson.M{"_id": orderObjectId}, bson.M{
				"$set": bson.M{
					"status": "completed",
				},
			})

			orderStatus := "completed"
			order.Status = &orderStatus
		} else {
			var deliveryAdmin data.User
			if err := userCollection.FindOne(sessCtx, bson.M{"deliveryService": rider.DeliveryService, "isAdmin": true}).Decode(&deliveryAdmin); err != nil {
				return nil, fmt.Errorf("no delivery service admin connected to delivery service")
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

			_, err := walletTransactionCollection.InsertOne(sessCtx, vendorTransaction)
			if err != nil {
				return nil, err
			}

			_, err = walletTransactionCollection.InsertOne(sessCtx, riderTransaction)
			if err != nil {
				return nil, err
			}

			if err := boiboiCollection.FindOneAndUpdate(sessCtx, bson.M{}, bson.M{
				"$inc": bson.M{
					"balance": amountToPayToBoiboi,
				},
			}).Err(); err != nil {
				return nil, err
			}

			if err := orderCollection.FindOneAndUpdate(sessCtx, bson.M{"_id": orderObjectId}, bson.M{
				"$set": bson.M{
					"status": "completed",
				},
			}).Err(); err != nil {
				return nil, err
			}

			orderStatus := "completed"
			order.Status = &orderStatus
		}

		return nil, nil

	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error marking order as complete " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, order)

}

func CancelOrder(c *gin.Context, db *mongo.Database) {

	associatedUserStringId := c.GetString("userId")

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

	if order.RiderID != nil && order.CustomerID.Hex() == associatedUserStringId {
		c.JSON(http.StatusBadRequest, gin.H{"error": "you can't cancel an order that has been assigned"})
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

	fmt.Println("omooo wetin dey sup")

	if orderState.Status == "orderCreated" || orderState.Status == "orderReceivedByVendor" ||
		orderState.Status == "orderAcceptedByRider" || orderState.Status == "riderAtVendor" ||
		orderState.Status == "riderOnHisWay" || orderState.Status == "riderAtUserLocation" {

		orderCollection := db.Collection(utils.ORDER)

		if orderState.Status == "orderAcceptedByRider" {

			riderIdStr := c.GetString("userId")

			slog.Info("Adding riderId ", "msg", riderIdStr)

			riderId, err := primitive.ObjectIDFromHex(riderIdStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid userId associated with request. " + err.Error()})
				slog.Info("Invalid userId associated with request", "error", err)
				return
			}

			_, err = orderCollection.UpdateOne(c, bson.M{"_id": orderObjectId}, bson.M{
				"$set": bson.M{
					"riderId": riderId,
				},
			})
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update riderId " + err.Error()})
				slog.Info("Failed to update riderId", "error", err)
				return
			}
		}

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

type OrderData struct {
	data.Order `bson:",inline"`
	Store      data.Store `json:"store"`
	Customer   data.User  `json:"customer"`
	Cart       data.Cart  `json:"cart"`
}

func GetOrders(c *gin.Context, db *mongo.Database) {

	filter := map[string]interface{}{}

	storeIdStr := c.Query("storeId")
	riderIdStr := c.Query("riderId")
	customerIdStr := c.Query("customerId")
	status := c.Query("status")

	if len(storeIdStr) > 0 {
		storeId, err := primitive.ObjectIDFromHex(storeIdStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid storeId. " + err.Error()})
			slog.Info("Invalid storeId", "error", err)
			return
		}
		filter["storeId"] = storeId
	}

	if len(riderIdStr) > 0 {
		riderId, err := primitive.ObjectIDFromHex(riderIdStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid riderId. " + err.Error()})
			slog.Info("Invalid riderId "+riderIdStr, "error", err)
			return
		}
		filter["riderId"] = riderId
	}

	if len(customerIdStr) > 0 {
		customerId, err := primitive.ObjectIDFromHex(customerIdStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid customerId. " + err.Error()})
			slog.Info("Invalid customerId", "error", err)
			return
		}
		filter["customerId"] = customerId
	}

	if len(status) > 0 {
		filter["status"] = status
	}

	orderCollection := db.Collection(utils.ORDER)

	pipeline := []bson.M{
		{"$match": filter},
		{"$lookup": bson.M{
			"from":         "Store",
			"localField":   "storeId",
			"foreignField": "_id",
			"as":           "store",
		}},
		{"$unwind": "$store"},
		{"$lookup": bson.M{
			"from":         "User",
			"localField":   "customerId",
			"foreignField": "_id",
			"as":           "customer",
		}},
		{"$unwind": "$customer"},
		{"$lookup": bson.M{
			"from":         "Cart",
			"localField":   "cartId",
			"foreignField": "_id",
			"as":           "cart",
		}},
		{"$unwind": "$cart"},
		{"$project": bson.M{
			"_id":                 1,
			"cartId":              1,
			"customerId":          1,
			"storeId":             1,
			"riderId":             1,
			"deliveryInstruction": 1,
			"deliveryLocation":    1,
			"deliveryMapLocation": 1,
			"code":                1,
			"status":              1,
			"orderProgressStatus": 1,
			"price":               1,
			"serviceCharge":       1,
			"deliveryFee":         1,
			"couponPrice":         1,
			"isPaidFor":           1,
			"orderTransactionID":  1,
			"createdAt":           1,
			"updatedAt":           1,
			"store": bson.M{
				"_id":   "$store._id",
				"name":  "$store.name",
				"image": "$store.image",
			},
			"customer": bson.M{
				"_id":       "$customer._id",
				"email":     "$customer.email",
				"firstName": "$customer.firstName",
			},
			"cart": "$cart",
		}},
	}

	cursor, err := orderCollection.Aggregate(c, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get orders. " + err.Error()})
		slog.Info("Failed to get orders", "error", err)
		return
	}

	defer cursor.Close(c)

	ordersData := []OrderData{}
	if err := cursor.All(c, &ordersData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode orders. " + err.Error()})
		slog.Info("Failed to decode orders", "error", err)
		return
	}

	c.JSON(http.StatusOK, ordersData)

}

func GetOrder(c *gin.Context, db *mongo.Database) {

	idStr := c.Param("id")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id. " + err.Error()})
		slog.Info("Invalid order id", "error", err)
		return
	}

	orderCollection := db.Collection(utils.ORDER)

	pipeline := []bson.M{
		{"$match": bson.M{"_id": id}},
		{"$lookup": bson.M{
			"from":         "Store",
			"localField":   "storeId",
			"foreignField": "_id",
			"as":           "store",
		}},
		{"$unwind": "$store"},
		{"$lookup": bson.M{
			"from":         "User",
			"localField":   "customerId",
			"foreignField": "_id",
			"as":           "customer",
		}},
		{"$unwind": "$customer"},
		{"$lookup": bson.M{
			"from":         "Cart",
			"localField":   "cartId",
			"foreignField": "_id",
			"as":           "cart",
		}},
		{"$unwind": "$cart"},
		{"$project": bson.M{
			"_id":                 1,
			"cartId":              1,
			"customerId":          1,
			"storeId":             1,
			"riderId":             1,
			"deliveryInstruction": 1,
			"deliveryLocation":    1,
			"deliveryMapLocation": 1,
			"code":                1,
			"status":              1,
			"orderProgressStatus": 1,
			"price":               1,
			"serviceCharge":       1,
			"deliveryFee":         1,
			"couponPrice":         1,
			"isPaidFor":           1,
			"orderTransactionID":  1,
			"createdAt":           1,
			"updatedAt":           1,
			"store": bson.M{
				"_id":   "$store._id",
				"name":  "$store.name",
				"image": "$store.image",
			},
			"customer": bson.M{
				"_id":         "$customer._id",
				"email":       "$customer.email",
				"firstName":   "$customer.firstName",
				"phoneNumber": "$customer.phoneNumber",
			},
			"cart": "$cart",
		}},
	}

	var orderData OrderData

	cursor, err := orderCollection.Aggregate(c, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get order. " + err.Error()})
		slog.Info("Failed to get order", "error", err)
		return
	}

	if cursor.Next(c) {
		if err := cursor.Decode(&orderData); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode order. " + err.Error()})
			slog.Info("Failed to decode order", "error", err)
			return
		}
	} else {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}

	defer cursor.Close(c)

	c.JSON(http.StatusOK, orderData)

}
