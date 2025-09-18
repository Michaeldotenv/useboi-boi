package admin

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"github.com/Michaeldotenv/useboi-boi/backend/api/inventories"
	"github.com/Michaeldotenv/useboi-boi/backend/internal/data"
	"github.com/Michaeldotenv/useboi-boi/backend/utils"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

func SetupAdmin(db *mongo.Database) {

	adminCollection := db.Collection(utils.ADMIN_ACCOUNT)

	var admin data.AdminAccount
	result := adminCollection.FindOne(context.TODO(), bson.M{})

	if result.Err() == mongo.ErrNoDocuments {

		key := os.Getenv("ADMIN_KEY")
		hashedAdminKey, err := bcrypt.GenerateFromPassword([]byte(key), bcrypt.DefaultCost)
		if err != nil {
			panic("Failed to hash admin key")
		}

		admin = data.AdminAccount{
			ID:  primitive.NewObjectID(),
			Key: string(hashedAdminKey),
		}

		_, err = adminCollection.InsertOne(context.TODO(), admin)
		if err != nil {
			panic("Failed to insert admin account")
		}

		return
	}

	if err := result.Decode(&admin); err != nil {
		panic("Failed to decode admin account" + err.Error())
	}

	if !admin.ID.IsZero() {
		slog.Info("message", "admin account exists already", "ok")
		return
	}

}

type AdminLoginRequest struct {
	Key string `json:"key"`
}

// AdminLogin handles admin login and JWT token generation
// @Summary Admin login and JWT token generation
// @Description Allows admin to log in using their admin key and receive a JWT token
// @Tags Admin
// @Accept json
// @Produce json
// @Param adminLoginRequest body AdminLoginRequest true "Admin login request body"
// @Success 200 {object} data.JWTResponse "JWT token"
// @Failure 400 {object} data.Error "Invalid request or wrong admin key"
// @Failure 500 {object} data.Error "Internal Server Error"
// @Router /auth/admin/login [post]
func AdminLogin(c *gin.Context, db *mongo.Database) {
	var reqBody AdminLoginRequest

	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to bind json. " + err.Error()})
		return
	}

	var admin data.AdminAccount
	adminCollection := db.Collection(utils.ADMIN_ACCOUNT)

	if err := adminCollection.FindOne(c, bson.M{}).Decode(&admin); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "no admin found" + err.Error()})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.Key), []byte(reqBody.Key)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Wrong admin key"})
		return
	}

	signingKey := os.Getenv("JWT_SIGNING_KEY")

	claims := jwt.MapClaims{
		"adminKey": admin.Key,
		"iss":      "urn:skulpoint:issuer",
		"aud":      "urn:skulpoint:auth",
		"iat":      time.Now().Unix(),
		"exp":      time.Now().Add(time.Hour * 8760).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	jwt, err := token.SignedString([]byte(signingKey))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to generate jwt. " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, data.JWTResponse{Token: jwt})

}

// GetStore handles retrieving a single store by its ID
// @Summary Get a store by ID
// @Description Fetch a single store using the provided ID
// @Tags Admin
// @Security BearerAuth
// @Param id path string true "Store ID"  // The ID of the store to retrieve
// @Produce json
// @Success 200 {object} data.Store "Store details"
// @Failure 400 {object} data.Error "Invalid ID or store not found"
// @Failure 500 {object} data.Error "Internal Server Error"
// @Router /admin/stores/{id} [get]
func GetStore(c *gin.Context, db *mongo.Database) {

	storesCollection := db.Collection(utils.STORE)

	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusBadRequest, gin.H{"error": "no store with id"})
			return
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id. " + err.Error()})
			return
		}
	}

	filter := bson.M{"_id": id}

	var store data.Store
	if err := storesCollection.FindOne(c, filter).Decode(&store); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error getting store. " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, store)
}

type StoreUpdate struct {
	Status string `json:"status"`
}

// @Summary Update store status
// @Description Updates the status of a store based on the provided ID.
// @Tags Admin
// @Accept json
// @Produce json
// @Param id path string true "Store ID"
// @Param body body StoreUpdate true "Store status update request"
// @Success 200 {object} data.Store "Successfully updated store"
// @Failure 400 {object} map[string]string "Invalid request body or ID"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /stores/{id} [patch]
// @Security BearerAuth
func EditStore(c *gin.Context, db *mongo.Database) {

	var reqBody StoreUpdate
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body. " + err.Error()})
		return
	}

	storesCollection := db.Collection(utils.STORE)

	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusBadRequest, gin.H{"error": "no store with id"})
			return
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id. " + err.Error()})
			return
		}
	}

	filter := bson.M{"_id": id}

	var store data.Store
	if err := storesCollection.FindOne(c, filter).Decode(&store); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error getting store. " + err.Error()})
		return
	}

	store.Status = reqBody.Status

	_, err = storesCollection.UpdateOne(c, filter, bson.M{
		"$set": store,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error updating store. " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, store)
}

// GetStores handles retrieving a list of stores
// @Summary Get a list of stores
// @Description Fetch a list of stores, optionally filtered by status
// @Tags Admin
// @Security BearerAuth
// @Param status query string false "Status filter"  // Optional query parameter to filter stores by status
// @Produce json
// @Success 200 {array} data.Store "List of stores"
// @Failure 500 {object} data.Error "Internal Server Error"
// @Router /admin/stores [get]
func GetStores(c *gin.Context, db *mongo.Database) {

	storesCollection := db.Collection(utils.STORE)

	status := c.Query("status")

	filter := bson.M{}
	if status != "" {
		filter["status"] = status
	}

	cursor, err := storesCollection.Find(c, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error getting stores. " + err.Error()})
		return
	}

	stores := []data.Store{}
	err = cursor.All(c, &stores)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error decoding stores. " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, stores)

}

// GetDeliveryService godoc
// @Summary Get a delivery service by ID
// @Description Retrieves a specific delivery service using its ID
// @Tags Admin
// @Produce json
// @Security BearerAuth
// @Param id path string true "Delivery Service ID"
// @Success 200 {object} data.DeliveryService
// @Failure 400 {object} data.Error "Invalid ID or No Delivery Service Found"
// @Failure 401 {object} data.Error "Unauthorized"
// @Failure 500 {object} data.Error "Server Error"
// @Router /admin/deliveryServices/{id} [get]
func GetDeliveryService(c *gin.Context, db *mongo.Database) {

	deliveryServicesCollection := db.Collection(utils.DELIVERY_SERVICE)

	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id. " + err.Error()})
		return
	}

	filter := bson.M{"_id": id}

	var store data.DeliveryService
	if err := deliveryServicesCollection.FindOne(c, filter).Decode(&store); err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusBadRequest, gin.H{"error": "no delivery service with id"})
			return
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error getting delivery service. " + err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, store)
}

// GetDeliveryServices handles retrieving a list of delivery services
// @Summary Get delivery services
// @Description Fetch a list of delivery services, optionally filtered by status
// @Tags Admin
// @Security BearerAuth
// @Param status query string false "Status filter"  // Optional query parameter to filter by delivery service status
// @Produce json
// @Success 200 {array} data.DeliveryService "List of delivery services"
// @Failure 400 {object} data.Error "Invalid filter or parameters"
// @Failure 500 {object} data.Error "Internal Server Error"
// @Router /admin/deliveryServices [get]
func GetDeliveryServices(c *gin.Context, db *mongo.Database) {

	deliveryServicesCollection := db.Collection(utils.DELIVERY_SERVICE)

	status := c.Query("status")

	filter := bson.M{}
	if status != "" {
		filter["status"] = status
	}

	cursor, err := deliveryServicesCollection.Find(c, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error getting delivery services. " + err.Error()})
		return
	}

	deliveryServices := []data.DeliveryService{}
	err = cursor.All(c, &deliveryServices)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error decoding delivery services. " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, deliveryServices)

}

type StatusUpdate struct {
	Status string `json:"status"`
}

// @Summary Update delivery service status
// @Description Updates the status of a delivery service based on the provided ID.
// @Tags Admin
// @Accept json
// @Produce json
// @Param id path string true "DeliveryService ID"
// @Param body body data.DeliveryService true "DeliveryService status update request"
// @Success 200 {object} data.DeliveryService "Successfully updated delivery service"
// @Failure 400 {object} map[string]string "Invalid request body or ID"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /deliveryServices/{id} [patch]
// @Security BearerAuth
func EditDeliveryService(c *gin.Context, db *mongo.Database) {

	var reqBody StatusUpdate
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body. " + err.Error()})
		return
	}

	deliveryServicesCollection := db.Collection(utils.DELIVERY_SERVICE)

	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusBadRequest, gin.H{"error": "no delivery service with id"})
			return
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id. " + err.Error()})
			return
		}
	}

	filter := bson.M{"_id": id}

	var deliveryService data.DeliveryService
	if err := deliveryServicesCollection.FindOne(c, filter).Decode(&deliveryService); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error getting delivery service. " + err.Error()})
		return
	}

	deliveryService.Status = reqBody.Status

	_, err = deliveryServicesCollection.UpdateOne(c, filter, bson.M{
		"$set": deliveryService,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error updating delivery service. " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, deliveryService)
}

func GetRiders(c *gin.Context, db *mongo.Database) {

	ridersCollection := db.Collection(utils.USER)

	status := c.Query("status")

	filter := bson.M{"type": "rider"}
	if status != "" {
		filter["status"] = status
	}

	cursor, err := ridersCollection.Find(c, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error getting stores. " + err.Error()})
		return
	}

	riders := []data.User{}
	err = cursor.All(c, &riders)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error decoding stores. " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, riders)

}

func ChangeRiderStatus(c *gin.Context, db *mongo.Database) {

	var reqBody StatusUpdate
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body. " + err.Error()})
		return
	}

	ridersCollection := db.Collection(utils.USER)

	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id. " + err.Error()})
		return
	}

	filter := bson.M{"_id": id}

	var rider data.User
	if err := ridersCollection.FindOne(c, filter).Decode(&rider); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error fetching rider. " + err.Error()})
		return
	}

	rider.Status = reqBody.Status

	_, err = ridersCollection.UpdateOne(c, filter, bson.M{
		"$set": rider,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error updating rider. " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, rider)
}

// AddItemToStoreInventory godoc
// @Summary Add item to store inventory (Admin)
// @Description Admin adds a new item to a store's inventory
// @Tags Admin, Inventories
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Store ID"
// @Param item body data.Item true "Item object"
// @Success 201 {object} data.Item
// @Failure 400 {object} data.Error
// @Failure 500 {object} data.Error
// @Router /admin/store/{id}/inventories [post]
func AddItemToStoreInventory(c *gin.Context, db *mongo.Database) {

	var item data.Item

	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error binding json " + err.Error()})
		return
	}

	if item.StoreID == nil || item.StoreID.IsZero() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "storeId cannot be empty"})
		return
	}

	if item.CurrentInventory != nil && *item.CurrentInventory < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Inventory cannot be less than 1"})
		return
	}

	itemsCollection := db.Collection(utils.ITEM)
	storeCollection := db.Collection(utils.STORE)
	categoryCollection := db.Collection(utils.CATEGORY)

	result := storeCollection.FindOne(c, bson.M{"_id": item.StoreID})
	if result.Err() == mongo.ErrNoDocuments {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No store found matching storeId"})
		return
	}

	session, err := db.Client().StartSession()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start session: " + err.Error()})
		return
	}
	defer session.EndSession(c)

	_, err = session.WithTransaction(c, func(sessCtx mongo.SessionContext) (interface{}, error) {

		if item.Image != nil {
			imageUrl, err := inventories.UploadItemImage(*item.Image)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error uploading item image. " + err.Error()})
				return nil, err
			}
			item.Image = imageUrl
		}

		result, err := itemsCollection.InsertOne(c, item)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating item " + err.Error()})
			return nil, err
		}

		insertedID, ok := result.InsertedID.(primitive.ObjectID)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to convert InsertedID to ObjectID"})
			return nil, err
		}

		item.ID = insertedID

		if item.CategoryID != nil && !item.CategoryID.IsZero() {
			result := categoryCollection.FindOne(c, bson.M{"_id": item.CategoryID})
			if result.Err() == mongo.ErrNoDocuments {
				c.JSON(http.StatusBadRequest, gin.H{"error": "No category found matching categoryId"})
				return nil, result.Err()
			}
		}

		return nil, err
	})

	if err != nil {
		return
	}

	c.JSON(http.StatusCreated, item)

}
