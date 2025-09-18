package payments

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"strconv"
	"time"

	"backend/internal/data"
	"backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func CreateDedicatedVirtualAccount(c *gin.Context, customer *data.User) error {

	url := utils.PAYSTACK_BASE_URL + "dedicated_account/assign"
	authorization := "Bearer " + os.Getenv("PAYSTACK_SECRET_KEY")

	data := map[string]interface{}{
		"email":          customer.Email,
		"first_name":     customer.FirstName,
		"last_name":      customer.LastName,
		"phone":          customer.PhoneNumber,
		"preferred_bank": os.Getenv("PAYSTACK_PREFERRED_BANK"),
		"country":        "NG",
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal JSON data"})
		return err
	}

	slog.Info("payment", "message", data)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
		return err
	}

	req.Header.Set("Authorization", authorization)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send request"})
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response"})
		return err
	}

	if resp.StatusCode >= 400 || resp.StatusCode >= 500 {
		c.Data(resp.StatusCode, "application/json", body)
		return fmt.Errorf("error creating dedicated virtual account for user")
	}

	slog.Info("payment", "message", "successfully created virtual account"+string(body))

	return nil

}

func GetUserPayStackAccount(c *gin.Context, db *mongo.Database, userId *primitive.ObjectID, userEmail *string) (*data.VirtualBankAccount, error) {

	page := 1
	url := utils.PAYSTACK_BASE_URL + "dedicated_account?page=" + strconv.Itoa(page)
	authorization := "Bearer " + os.Getenv("PAYSTACK_SECRET_KEY")

	slog.Info("msg", "url", url)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", authorization)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 || resp.StatusCode >= 500 {
		return nil, fmt.Errorf("%s", string(body))
	}

	var result map[string]interface{}

	err = json.Unmarshal(body, &result)
	if err != nil {
		return nil, err
	}

	meta, ok := result["meta"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("failed to parse 'meta' field as an interface")
	}

	pageCount, ok := meta["pageCount"].(float64)
	if !ok {
		return nil, fmt.Errorf("failed to parse 'pageCount' field as an int")
	}

	var virtualAccount data.VirtualBankAccount

	for i := 1; i <= int(pageCount); i++ {
		url := utils.PAYSTACK_BASE_URL + "dedicated_account?page=" + strconv.Itoa(i)
		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			return nil, err
		}

		req.Header.Set("Authorization", authorization)
		req.Header.Set("Content-Type", "application/json")

		client = &http.Client{}
		resp, err = client.Do(req)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()

		body, err = io.ReadAll(resp.Body)
		if err != nil {
			return nil, err
		}

		if resp.StatusCode >= 400 || resp.StatusCode >= 500 {
			return nil, fmt.Errorf("%s", string(body))
		}

		var pageResult map[string]interface{}
		err = json.Unmarshal(body, &pageResult)
		if err != nil {
			return nil, err
		}

		d, ok := pageResult["data"].([]interface{})
		if !ok {
			return nil, fmt.Errorf("failed to parse 'data' field as an array")
		}

		for _, item := range d {
			slog.Info("account to insert", item, "info")
			account, ok := item.(map[string]interface{})
			if !ok {
				continue
			}
			customer, ok := account["customer"].(map[string]interface{})
			if !ok {
				continue
			}
			if email, ok := customer["email"].(string); ok && email == *userEmail {
				if err := utils.MapToStruct(item.(map[string]interface{}), &virtualAccount); err != nil {
					return nil, err
				}
				// If virtual account found, update in DB and return
				userCollection := db.Collection(utils.USER)
				updateResult := userCollection.FindOneAndUpdate(c, bson.M{"_id": *userId}, bson.M{
					"$set": bson.M{
						"virtualBankAccount": virtualAccount,
					},
				})
				if updateResult.Err() != nil {
					return nil, updateResult.Err()
				}
				return &virtualAccount, nil
			}
		}
	}

	return nil, fmt.Errorf("error getting user paystack account")

}

func GetPaystackAccountForUser(ctx context.Context, db *mongo.Database, userId *primitive.ObjectID, userEmail *string) (*data.VirtualBankAccount, error) {
	page := 1
	url := utils.PAYSTACK_BASE_URL + "dedicated_account?page=" + strconv.Itoa(page)
	authorization := "Bearer " + os.Getenv("PAYSTACK_SECRET_KEY")

	slog.Info("msg", "url", url, "request_info", "fetching dedicated account")

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", authorization)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 || resp.StatusCode >= 500 {
		return nil, fmt.Errorf("%s", string(body))
	}

	var result map[string]interface{}

	err = json.Unmarshal(body, &result)
	if err != nil {
		return nil, err
	}

	meta, ok := result["meta"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("failed to parse 'meta' field as an interface")
	}

	pageCount, ok := meta["pageCount"].(float64)
	if !ok {
		return nil, fmt.Errorf("failed to parse 'pageCount' field as an int")
	}

	var virtualAccount data.VirtualBankAccount

	for i := 1; i <= int(pageCount); i++ {
		url := utils.PAYSTACK_BASE_URL + "dedicated_account?page=" + strconv.Itoa(i)
		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			return nil, err
		}

		req.Header.Set("Authorization", authorization)
		req.Header.Set("Content-Type", "application/json")

		client = &http.Client{}
		resp, err = client.Do(req)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()

		body, err = io.ReadAll(resp.Body)
		if err != nil {
			return nil, err
		}

		if resp.StatusCode >= 400 || resp.StatusCode >= 500 {
			return nil, fmt.Errorf("%s", string(body))
		}

		var pageResult map[string]interface{}
		err = json.Unmarshal(body, &pageResult)
		if err != nil {
			return nil, err
		}

		d, ok := pageResult["data"].([]interface{})
		if !ok {
			return nil, fmt.Errorf("failed to parse 'data' field as an array")
		}

		for _, item := range d {
			account, ok := item.(map[string]interface{})
			if !ok {
				continue
			}
			customer, ok := account["customer"].(map[string]interface{})
			if !ok {
				continue
			}
			if email, ok := customer["email"].(string); ok && email == *userEmail {
				if err := utils.MapToStruct(item.(map[string]interface{}), &virtualAccount); err != nil {
					return nil, err
				}
				// If virtual account found, update in DB and return
				userCollection := db.Collection(utils.USER)
				updateResult := userCollection.FindOneAndUpdate(ctx, bson.M{"_id": *userId}, bson.M{
					"$set": bson.M{
						"virtualBankAccount": virtualAccount,
					},
				})
				if updateResult.Err() != nil {
					return nil, updateResult.Err()
				}
				return &virtualAccount, nil
			}
		}
	}

	return nil, fmt.Errorf("error getting user paystack account")
}

func CreateVirtualBankAccountForUser(ctx *gin.Context, db *mongo.Database) {
	idFromAuth, exists := ctx.Get("userId")
	if exists {
		userId := idFromAuth.(string)
		userCollection := db.Collection(utils.USER)

		userObjectId, err := primitive.ObjectIDFromHex(userId)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error getting objectId from userId" + err.Error()})
			return
		}

		var user data.User
		result := userCollection.FindOne(ctx, bson.M{"_id": userObjectId})
		err = result.Decode(&user)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error decoding user" + err.Error()})
			return
		}
		err = CreateDedicatedVirtualAccount(ctx, &user)

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error creating dedicated virtual account" + err.Error()})
			return
		}

		time.Sleep(2 * time.Second)

		virtualAccount, error := GetUserPayStackAccount(ctx, db, &user.ID, &user.Email)

		if error != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error getting dedicated virtual account" + error.Error()})
			return
		}

		ctx.JSON(http.StatusOK, virtualAccount)
		return

	} else {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "userId param is empty"})
		slog.Info("msg", "userId doesn't exist", "error")
		return
	}
}

type FundAmount struct {
	Amount int64 `json:"amount"`
}

type InitializeTransactionRequest struct {
	Email  string `json:"email"`
	Amount string `json:"amount"`
}

func InitializeTransaction(ctx *gin.Context, db *mongo.Database) {

	userEmail, ok := ctx.Get("userEmail")
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "user email not present"})
		return
	}

	var fundAmount FundAmount
	if err := ctx.ShouldBindJSON(&fundAmount); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "error binding json " + err.Error()})
		return
	}

	transactionInitializeUrl := "https://api.paystack.co/transaction/initialize"
	secretKey := os.Getenv("PAYSTACK_SECRET_KEY")

	reqBody := InitializeTransactionRequest{
		Email:  userEmail.(string),
		Amount: strconv.Itoa(int(fundAmount.Amount)),
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		slog.Error("error", "Error marshalling JSON: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request " + err.Error()})
		return
	}

	req, err := http.NewRequest("POST", transactionInitializeUrl, bytes.NewBuffer(jsonData))
	if err != nil {
		slog.Error("error", "Error creating HTTP request: %v", err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create HTTP request " + err.Error()})
		return
	}

	req.Header.Set("Authorization", "Bearer "+secretKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		slog.Error("error", "Error making HTTP request: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to communicate with Paystack " + err.Error()})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		slog.Error("error", "Error reading response body: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response from Paystack " + err.Error()})
		return
	}

	ctx.Data(resp.StatusCode, "application/json", body)

}

func CapturePayment(ctx *gin.Context, db *mongo.Database) {

	// secret := os.Getenv("PAYSTACK_SECRET_KEY")

	// rawBody, err := ctx.GetRawData()
	// if err != nil {
	// 	ctx.JSON(500, gin.H{"error": "Failed to read request body"})
	// 	return
	// }

	// h := hmac.New(sha512.New, []byte(secret))
	// h.Write(rawBody)
	// computedHash := hex.EncodeToString(h.Sum(nil))

	// signature := ctx.GetHeader("x-paystack-signature")
	// if computedHash != signature {
	// 	ctx.JSON(http.StatusForbidden, gin.H{"error": "Invalid signature"})
	// 	return
	// }

	paymentPayload := map[string]interface{}{}

	if err := ctx.ShouldBindJSON(&paymentPayload); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "failure binding json data " + err.Error()})
		return
	}

	event := paymentPayload["event"].(string)
	reference := paymentPayload["data"].(map[string]interface{})["reference"]

	if event == "charge.success" {
		slog.Info("messasge", "--------->", paymentPayload)
		email := paymentPayload["data"].(map[string]interface{})["customer"].(map[string]interface{})["email"].(string)
		requestedAmount := paymentPayload["data"].(map[string]interface{})["requested_amount"].(float64)
		createdAt := paymentPayload["data"].(map[string]interface{})["created_at"]
		metaData, ok := paymentPayload["data"].(map[string]interface{})["metadata"].(map[string]interface{})
		if !ok {
			metaData = map[string]interface{}{}
		}
		paymentType, ok := metaData["type"].(string)
		if !ok {
			paymentType = "wallet"
		}

		if paymentType != "wallet" {
			ctx.Data(http.StatusOK, "application/json", nil)
			return
		}

		transactionCollection := db.Collection(utils.WALLET_TRANSACTIONS)
		userCollection := db.Collection(utils.USER)

		var user data.User
		result := userCollection.FindOne(ctx, bson.M{
			"email": email,
		})
		if err := result.Decode(&user); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error fetching user " + err.Error()})
			slog.Info("payment", "error fetching user ", err.Error())
			return
		}

		timeLayout := time.RFC3339
		parsedCreatedAtDate, err := time.Parse(timeLayout, createdAt.(string))
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error parsing createdAt data"})
			slog.Info("payment", "error parsing createdAt data", err.Error())
			return
		}

		transaction := data.WalletTransactions{
			ID:                   primitive.NewObjectID(),
			PaymentTransactionId: reference.(string),
			Type:                 "credit",
			Amount:               requestedAmount / 100,
			UserId:               user.ID,
			CreatedAt:            parsedCreatedAtDate,
		}

		session, err := db.Client().StartSession()
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start db transaction session: " + err.Error()})
			slog.Info("payment", "Failed to start db transaction session: ", err.Error())
			return
		}
		defer session.EndSession(ctx)

		virtualAccount := user.VirtualBankAccount

		_, err = session.WithTransaction(ctx, func(sessCtx mongo.SessionContext) (interface{}, error) {

			_, err := transactionCollection.InsertOne(sessCtx, transaction)
			if err != nil {
				return nil, err
			}

			slog.Info("msg", "requested amount ", requestedAmount/100)

			virtualAccount.Balance = virtualAccount.Balance + requestedAmount/100

			userCollection.FindOneAndUpdate(ctx, bson.M{"_id": user.ID}, bson.M{
				"$set": bson.M{
					"virtualBankAccount": virtualAccount,
				},
			})

			slog.Info("msg", "virtual account update ", virtualAccount.Balance)

			return nil, nil
		})

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user's account and transactions " + err.Error()})
			slog.Info("payment", "failed to update user's account and transactions", err.Error())
			return
		}

		ctx.Data(http.StatusOK, "application/json", nil)

		paymentReference := reference.(string)

		utils.SendWalletTopupMail(&user.Email, &user.FirstName, &requestedAmount, &paymentReference, &virtualAccount.Balance)

		slog.Info("message", "webhook event successful", "👍🏾")

	} else if event == "charge.failed" {
		ctx.Data(http.StatusOK, "application/json", nil)

		slog.Info("payment", "charge not successful", "charge.failed")

		paymentReference := reference.(string)

		userCollection := db.Collection(utils.USER)

		email := paymentPayload["data"].(map[string]interface{})["customer"].(map[string]interface{})["email"].(string)
		requestedAmount := paymentPayload["data"].(map[string]interface{})["requested_amount"].(float64)

		var user data.User
		result := userCollection.FindOne(ctx, bson.M{
			"email": email,
		})
		if err := result.Decode(&user); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error fetching user " + err.Error()})
			slog.Info("payment", "error fetching user ", err.Error())
			return
		}

		utils.SendFailedWalletTopupMail(&user.Email, &user.FirstName, &requestedAmount, &paymentReference)

		slog.Info("message", "webhook event successful", "👍🏾")

	} else if event == "transfer.success" {

		ctx.Data(http.StatusOK, "application/json", nil)

	} else {

		ctx.Data(http.StatusOK, "application/json", nil)

	}

}

func GetAuthorizationUrl(c *gin.Context) {
	var requestBody data.TransactionRequest
	if err := c.BindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body " + err.Error()})
		return
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	req, err := http.NewRequest("POST", "https://api.paystack.co/transaction/initialize", bytes.NewBuffer(jsonBody))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	req.Header.Set("Authorization", "Bearer "+os.Getenv("PAYSTACK_SECRET_KEY"))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send HTTP request"})
		return
	}
	defer resp.Body.Close()

	var responseBody map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&responseBody)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode JSON response"})
		return
	}

	c.JSON(resp.StatusCode, responseBody)

}

func VerifyCardChargeAndAddCard(c *gin.Context, db *mongo.Database) {

	reference := c.Param("reference")

	req, err := http.NewRequest("GET", "https://api.paystack.co/transaction/verify/"+reference, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	req.Header.Set("Authorization", "Bearer "+os.Getenv("PAYSTACK_SECRET_KEY"))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send HTTP request"})
		return
	}
	defer resp.Body.Close()

	var responseBody map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&responseBody)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode JSON response"})
		return
	}

	id := responseBody["data"].(map[string]interface{})["id"].(float64)
	status := responseBody["data"].(map[string]interface{})["status"].(string)
	authorization := responseBody["data"].(map[string]interface{})["authorization"].(map[string]interface{})

	if authorization["authorization_code"] == nil {
		if status != "success" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "transaction not verified"})
			return
		}
	}

	authorizationCode := authorization["authorization_code"].(string)
	bank := authorization["bank"].(string)
	cardType := authorization["card_type"].(string)

	if status != "success" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "transaction not verified"})
		return
	}

	card := data.Card{
		ID:                id,
		AuthorizationCode: authorizationCode,
		Bank:              bank,
		CardType:          cardType,
		IsSelected:        false,
	}

	userId, ok := c.Get("userId")
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "no user found"})
		return
	}

	userObjectId, err := primitive.ObjectIDFromHex(userId.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "unable to create user object id"})
		return
	}

	userCollection := db.Collection(utils.USER)

	slog.Info("message", "user object id", userId)

	var user data.User

	// userCollection.FindOne(c, bson.M{"_id": userObjectId}).Decode(&user)
	if err := userCollection.FindOne(c, bson.M{"_id": userObjectId}).Decode(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user not found" + err.Error()})
		return
	}

	if len(user.Cards) == 0 {
		card.IsSelected = true
	}

	if user.Cards == nil {
		res := userCollection.FindOneAndUpdate(c, bson.M{"_id": userObjectId}, bson.M{
			"$set": bson.M{
				"cards": bson.A{},
			},
		})

		if res.Err() != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "unable to empty card array. " + res.Err().Error()})
			return
		}
	}

	res := userCollection.FindOneAndUpdate(c, bson.M{"_id": userObjectId}, bson.M{
		"$push": bson.M{
			"cards": card,
		},
	})

	if res.Err() != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "unable to add card. " + res.Err().Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "card added successfully"})

}

func WithdrawlFromWallet(c *gin.Context, db *mongo.Database) {

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

	if (user.Type == "merchant") || (user.Type == "rider" && *user.IsAdmin) {

		if len(user.Banks) < 1 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "no withdrawal bank present"})
			return
		}

		withdrawalRequest := map[string]interface{}{}
		if err = c.ShouldBindJSON(&withdrawalRequest); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "error binding json " + err.Error()})
			return
		}

		if withdrawalRequest["amount"] == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "amount cannot be nil"})
			return
		}

		_, ok := withdrawalRequest["amount"].(float64)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "amount must be a number"})
			return
		}

		amount := withdrawalRequest["amount"].(float64)

		if user.VirtualBankAccount.Balance-amount > 100 {

			withdrawalRequest := data.WithdrawalRequest{
				ID:        primitive.NewObjectID(),
				UserID:    userObjectId,
				Status:    "pending",
				Type:      user.Type,
				Amount:    amount,
				CreatedAt: time.Now(),
			}

			_, err = db.Collection(utils.WITHDRAWAL_REQUEST).InsertOne(c, withdrawalRequest)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "failed to create wuthdrawal request"})
				return
			}

			c.JSON(http.StatusOK, withdrawalRequest)

		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "insufficient wallet balance for withdrawal"})
			return
		}

	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "withdrawal not available for this user"})
		return
	}

}

func ProcessWithdrawal(request data.WithdrawalRequest, db *mongo.Database) error {

	userId := request.UserID

	userCollection := db.Collection(utils.USER)

	var user data.User
	if err := userCollection.FindOne(context.TODO(), bson.M{"_id": userId}).Decode(&user); err != nil {
		return err
	}

	if len(user.Banks) < 1 {
		return fmt.Errorf("user withdrawal bank cannot be empty")
	}

	userWithdrawalBank := user.Banks[0]

	url := "https://api.paystack.co/transfer"
	apiKey := os.Getenv("PAYSTACK_SECRET_KEY")
	authorization := "Bearer " + apiKey

	reqData := map[string]interface{}{
		"source":    "balance",
		"reason":    "Withdrawal",
		"amount":    request.Amount,
		"recipient": userWithdrawalBank.RecipientCode,
	}

	jsonData, err := json.Marshal(reqData)
	if err != nil {
		return fmt.Errorf("error marshalling JSON: %v", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Authorization", authorization)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("error making request: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("error reading response: %v", err)
	}

	if resp.StatusCode >= 400 && resp.StatusCode <= 500 {
		return fmt.Errorf("error fulfiling transaction %v", err)
	}

	var result map[string]interface{}
	err = json.Unmarshal(body, &result)
	if err != nil {
		return fmt.Errorf("error unmarshalling response: %v", err)
	}

	status := result["data"].(map[string]interface{})["status"].(string)
	// transferCode := result["data"].(map[string]interface{})["transfer_code"].(string)
	id := int(result["data"].(map[string]interface{})["id"].(float64))
	stringId := strconv.Itoa(id)

	slog.Info("message", "transaction status", status)

	time.Sleep(1 * time.Second)

	if err := fetchTransfer(&stringId, db); err != nil {
		return err
	}

	return nil

}

func fetchTransfer(id *string, db *mongo.Database) error {
	url := "https://api.paystack.co/transfer/" + *id

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		slog.Info("message", "Error creating request:", err)
		return err
	}

	req.Header.Set("Authorization", "Bearer "+os.Getenv("PAYSTACK_SECRET_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		slog.Info("message", "Error making request:", err)
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		slog.Info("message", "Error reading response body:", err)
		return err
	}

	var result map[string]interface{}
	err = json.Unmarshal(body, &result)
	if err != nil {
		return fmt.Errorf("error unmarshalling response: %v", err)
	}

	slog.Info("message", "fetch transfer result", result)

	recipientCode, ok := result["data"].(map[string]interface{})["recipient"].(map[string]interface{})["recipient_code"].(string)
	if !ok {
		recipientCode = ""
	}
	reference, ok := result["data"].(map[string]interface{})["reference"].(string)
	if !ok {
		reference = ""
	}
	amount, ok := result["data"].(map[string]interface{})["amount"].(float64)
	if !ok {
		amount = 0
	}

	var user data.User
	db.Collection(utils.USER).FindOne(context.TODO(), bson.M{"banks.recipientCode": recipientCode}).Decode(&user)

	walletTransactionsCollection := db.Collection(utils.WALLET_TRANSACTIONS)
	transaction := data.WalletTransactions{
		ID:                   primitive.NewObjectID(),
		PaymentTransactionId: reference,
		UserId:               user.ID,
		Amount:               amount,
		Type:                 "debit",
		CreatedAt:            time.Now(),
	}

	_, err = walletTransactionsCollection.InsertOne(context.TODO(), transaction)
	if err != nil {
		mailErr := utils.SendFailedWithdrawalMail(&user.Email, &user.FirstName, &amount, &reference)
		if mailErr != nil {
			slog.Info("error sending email", "error", mailErr.Error())
		}
		return err
	}

	mailErr := utils.SendSuccessfulWithdrawalMail(&user.Email, &user.FirstName, &amount, &reference)
	if mailErr != nil {
		slog.Info("error sending email", "error", mailErr.Error())
	}

	return nil

}
