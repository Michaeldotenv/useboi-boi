package users

import (
	"bytes"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"os"

	"useboi-boi/backend/internal/data"
	"useboi-boi/backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetUser(c *gin.Context, db *mongo.Database) {

	userStringId := c.Param("id")
	userId, err := primitive.ObjectIDFromHex(userStringId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		slog.Error("Invalid user id", "error", err)
		return
	}

	userCollection := db.Collection(utils.USER)

	var user data.User
	if err := userCollection.FindOne(c, bson.M{"_id": userId}).Decode(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user"})
		slog.Error("failed to fetch user", "error", err)
		return
	}

	type ResponseVirtualBankAccount struct {
		data.VirtualBankAccount
		AccountName   string `json:"accountName"`
		AccountNumber string `json:"accountNumber"`
	}

	type ResponseUser struct {
		data.User
		VirtualBankAccount *ResponseVirtualBankAccount `json:"virtualBankAccount,omitempty"`
	}

	responseUser := ResponseUser{
		User: user,
	}

	if user.VirtualBankAccount != nil {
		responseUser.VirtualBankAccount = &ResponseVirtualBankAccount{
			VirtualBankAccount: *user.VirtualBankAccount,
			AccountName:        user.VirtualBankAccount.AccountName,
			AccountNumber:      user.VirtualBankAccount.AccountNumber,
		}
	}

	c.JSON(http.StatusOK, responseUser)

}

func GetMe(c *gin.Context, db *mongo.Database) {

	userStringId := c.GetString("userId")
	userId, err := primitive.ObjectIDFromHex(userStringId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id. " + err.Error()})
		slog.Info("Invalid user id", "error", err.Error())
		return
	}

	userCollection := db.Collection(utils.USER)

	var user data.User
	if err := userCollection.FindOne(c, bson.M{"_id": userId}).Decode(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user"})
		slog.Info("Invalid user id", "error", err.Error())
		return
	}

	type ResponseVirtualBankAccount struct {
		data.VirtualBankAccount
		AccountName   string `json:"accountName"`
		AccountNumber string `json:"accountNumber"`
	}

	type ResponseUser struct {
		data.User
		VirtualBankAccount *ResponseVirtualBankAccount `json:"virtualBankAccount,omitempty"`
	}

	responseUser := ResponseUser{
		User: user,
	}

	if user.VirtualBankAccount != nil {
		responseUser.VirtualBankAccount = &ResponseVirtualBankAccount{
			VirtualBankAccount: *user.VirtualBankAccount,
			AccountName:        user.VirtualBankAccount.AccountName,
			AccountNumber:      user.VirtualBankAccount.AccountNumber,
		}
	}

	c.JSON(http.StatusOK, responseUser)
}

func EditUser(c *gin.Context, db *mongo.Database) {

	userStringId := c.Param("id")
	userId, err := primitive.ObjectIDFromHex(userStringId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		slog.Info("Invalid user id", "error", err)
		return
	}

	// Only accept specific fields for update
	var updateData struct {
		FirstName   string `json:"firstName"`
		LastName    string `json:"lastName"`
		PhoneNumber string `json:"phoneNumber"`
	}
	
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		slog.Info("Invalid request body", "error", err)
		return
	}

	// Validate required fields
	if updateData.FirstName == "" || updateData.LastName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "firstName and lastName are required"})
		return
	}

	userCollection := db.Collection(utils.USER)

	// Build update fields
	updateFields := bson.M{
		"firstName": updateData.FirstName,
		"lastName":  updateData.LastName,
	}
	
	// Only update phone number if provided
	if updateData.PhoneNumber != "" {
		updateFields["phoneNumber"] = updateData.PhoneNumber
	}

	// Only update allowed fields
	update := bson.M{
		"$set": updateFields,
	}
	
	options := options.FindOneAndUpdate().SetReturnDocument(options.After)

	var user data.User
	if err := userCollection.FindOneAndUpdate(c, bson.M{"_id": userId}, update, options).Decode(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user"})
		slog.Info("Failed to update user", "error", err)
		return
	}

	if user.ID.IsZero() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user"})
		slog.Info("invalid user", "error", err)
		return
	}

	c.JSON(http.StatusOK, user)
}

type TransferRecipientRequest struct {
	AccountNumber string `json:"accountNumber"`
	BankCode      string `json:"bankCode"`
	BankName      string `json:"bankName"`
}

func AddBankAccount(c *gin.Context, db *mongo.Database) {

	userId, ok := c.Get("userId")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "no user found"})
		return
	}

	userObjectId, err := primitive.ObjectIDFromHex(userId.(string))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unable to create user object id"})
		return
	}

	userCollection := db.Collection(utils.USER)

	var user data.User
	if err := userCollection.FindOne(c, bson.M{"_id": userObjectId}).Decode(&user); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	if len(user.Banks) == 0 {

		var recipientRequest TransferRecipientRequest

		if err := c.ShouldBindJSON(&recipientRequest); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body " + err.Error()})
			return
		}

		url := "https://api.paystack.co/transferrecipient"
		authorization := "Bearer " + os.Getenv("PAYSTACK_SECRET_KEY")

		bankData := map[string]string{
			"type":           "nuban",
			"name":           user.FirstName + " " + user.LastName,
			"account_number": recipientRequest.AccountNumber,
			"bank_code":      recipientRequest.BankCode,
			"currency":       "NGN",
		}

		jsonData, err := json.Marshal(bankData)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error marshalling JSON " + err.Error()})
			return
		}

		req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error creating request " + err.Error()})
			return
		}

		req.Header.Set("Authorization", authorization)
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error making request: " + err.Error()})
			return
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error reading response: " + err.Error()})
			return
		}

		var result map[string]interface{}
		err = json.Unmarshal(body, &result)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error unmarshalling response: " + err.Error()})
			return
		}

		if result["data"] == nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create transfer recipient", "body": result})
			return
		}

		recipientCode := result["data"].(map[string]interface{})["recipient_code"].(string)

		if resp.StatusCode >= 200 && resp.StatusCode < 300 {

			bankAccount := data.WithdrawalBank{
				ID:            primitive.NewObjectID(),
				Type:          "nuban",
				Name:          user.FirstName + " " + user.LastName,
				BankName:      recipientRequest.BankName,
				AccountNumber: recipientRequest.AccountNumber,
				Status:        "active",
				RecipientCode: recipientCode,
			}

			_, err := userCollection.UpdateOne(c, bson.M{"_id": userObjectId}, bson.M{
				"$set": bson.M{
					"banks": bson.A{},
				},
			})

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to empty bank array. " + err.Error()})
				return
			}

			_, err = userCollection.UpdateOne(c, bson.M{"_id": userObjectId}, bson.M{
				"$push": bson.M{
					"banks": bankAccount,
				},
			})

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add bank account. " + err.Error()})
				return
			}

			c.JSON(http.StatusOK, bankAccount)

		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add bank account"})
			return
		}

	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "you can only add one bank account"})
		return
	}

}

type WalletTransactionWithOrder struct {
	data.WalletTransactions `bson:",inline"`
	Order                   *data.Order `json:"order,omitempty"`
}

func GetWalletTransactions(c *gin.Context, db *mongo.Database) {

	userIdStr := c.GetString("userId")

	userId, err := primitive.ObjectIDFromHex(userIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid associated user id. " + err.Error()})
		return
	}

	transactionCollection := db.Collection(utils.WALLET_TRANSACTIONS)
	orderCollection := db.Collection(utils.ORDER)

	// Use aggregation to join with orders
	pipeline := []bson.M{
		{"$match": bson.M{"userId": userId}},
		{"$sort": bson.M{"createdAt": -1}}, // Sort by newest first
		{"$lookup": bson.M{
			"from":         "Order",
			"localField":   "paymentTransactionId",
			"foreignField": "orderTransactionID",
			"as":           "orderData",
		}},
		{"$addFields": bson.M{
			"order": bson.M{
				"$cond": bson.M{
					"if":   bson.M{"$gt": []interface{}{bson.M{"$size": "$orderData"}, 0}},
					"then": bson.M{"$arrayElemAt": []interface{}{"$orderData", 0}},
					"else": nil,
				},
			},
		}},
		{"$project": bson.M{
			"_id":                   1,
			"paymentTransactionId":  1,
			"userId":                1,
			"amount":                1,
			"type":                  1,
			"createdAt":             1,
			"order._id":             1,
			"order.storeId":         1,
			"order.price":           1,
			"order.status":          1,
			"order.deliveryLocation": 1,
		}},
	}

	cursor, err := transactionCollection.Aggregate(c, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get wallet transaction. " + err.Error()})
		slog.Info("Failed to get wallet transaction", "error", err)
		return
	}

	transactions := []WalletTransactionWithOrder{}
	if err := cursor.All(c, &transactions); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode transactions. " + err.Error()})
		slog.Info("Failed to decode wallet transaction", "error", err)
		return
	}

	c.JSON(http.StatusOK, transactions)

}

func GetPendingWithdrawals(c *gin.Context, db *mongo.Database) {

	userIdStr := c.GetString("userId")

	userId, err := primitive.ObjectIDFromHex(userIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid associated user id. " + err.Error()})
		return
	}

	withdrawalCollection := db.Collection(utils.WITHDRAWAL_REQUEST)

	cursor, err := withdrawalCollection.Find(c, bson.M{"userId": userId})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get withdrawal requests. " + err.Error()})
		slog.Info("Failed to get withdrawal requests", "error", err)
		return
	}

	withRequests := []data.WithdrawalRequest{}
	if err := cursor.All(c, &withRequests); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode withdrawal requests. " + err.Error()})
		slog.Info("Failed to decode withdrawal requests", "error", err)
		return
	}

	c.JSON(http.StatusOK, withRequests)
}
