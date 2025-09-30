package vendors

import (
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"

	"useboi-boi/backend/internal/data"
	"useboi-boi/backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// @Summary Get all vendors
// @Description Get a list of all active vendors with resolved category names
// @Tags Vendors
// @Accept json
// @Produce json
// @Success 200 {array} object "List of active vendors with resolved categories"
// @Failure 500 {object} object "Failed to decode stores"
// @Router /vendors [get]
// @Security BearerAuth
func GetAllVendors(c *gin.Context, db *mongo.Database) {

	storeCollection := db.Collection(utils.STORE)

	// Use aggregation pipeline to resolve category IDs to category names for all active stores
	pipeline := []bson.M{
		{"$match": bson.M{"status": "active"}},
		{"$lookup": bson.M{
			"from":         "Category",
			"localField":   "categories",
			"foreignField": "_id",
			"as":           "resolvedCategories",
		}},
		{"$project": bson.M{
			"_id":             1,
			"status":          1,
			"name":            1,
			"image":           1,
			"description":     1,
			"address":         1,
			"categories":      "$resolvedCategories",
			"items":           1,
			"likedByUserIds":  1,
			"mapLocation":     1,
			"ratings":         1,
			"type":            1,
			"openingTime":     1,
			"closingTime":     1,
			"availableDays":   1,
		}},
	}

	cursor, err := storeCollection.Aggregate(c, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get stores. " + err.Error()})
		slog.Info("failed to get stores", "error", err)
		return
	}
	defer cursor.Close(c)

	var stores []bson.M
	if err := cursor.All(c, &stores); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode stores. " + err.Error()})
		slog.Info("failed to decode stores", "error", err)
		return
	}

	c.JSON(http.StatusOK, stores)

}

// Like a store (save)
func LikeStore(c *gin.Context, db *mongo.Database) {
	userIdStr := c.GetString("userId")
	storeIdStr := c.Param("id")

	userId, err := primitive.ObjectIDFromHex(userIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	storeId, err := primitive.ObjectIDFromHex(storeIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid store id"})
		return
	}

	storeCollection := db.Collection(utils.STORE)
	update := bson.M{"$addToSet": bson.M{"likedByUserIds": userId}}
	if _, err := storeCollection.UpdateByID(c, storeId, update); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to like store. " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "liked"})
}

// Unlike a store (unsave)
func UnlikeStore(c *gin.Context, db *mongo.Database) {
	userIdStr := c.GetString("userId")
	storeIdStr := c.Param("id")

	userId, err := primitive.ObjectIDFromHex(userIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	storeId, err := primitive.ObjectIDFromHex(storeIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid store id"})
		return
	}

	storeCollection := db.Collection(utils.STORE)
	update := bson.M{"$pull": bson.M{"likedByUserIds": userId}}
	if _, err := storeCollection.UpdateByID(c, storeId, update); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to unlike store. " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "unliked"})
}

// List saved stores for current user with resolved category names
func GetSavedStores(c *gin.Context, db *mongo.Database) {
	userIdStr := c.GetString("userId")
	userId, err := primitive.ObjectIDFromHex(userIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	storeCollection := db.Collection(utils.STORE)

	// Use aggregation pipeline to resolve category IDs to category names for saved stores
	pipeline := []bson.M{
		{"$match": bson.M{"likedByUserIds": userId, "status": "active"}},
		{"$lookup": bson.M{
			"from":         "Category",
			"localField":   "categories",
			"foreignField": "_id",
			"as":           "resolvedCategories",
		}},
		{"$project": bson.M{
			"_id":             1,
			"status":          1,
			"name":            1,
			"image":           1,
			"description":     1,
			"address":         1,
			"categories":      "$resolvedCategories",
			"items":           1,
			"likedByUserIds":  1,
			"mapLocation":     1,
			"ratings":         1,
			"type":            1,
			"openingTime":     1,
			"closingTime":     1,
			"availableDays":   1,
		}},
	}

	cursor, err := storeCollection.Aggregate(c, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch saved stores. " + err.Error()})
		return
	}
	defer cursor.Close(c)

	var stores []bson.M
	if err := cursor.All(c, &stores); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode stores. " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, stores)
}

type StoreImageRequest struct {
	StoreId string `json:"storeId" validate:"required"`
	Image   string `json:"image" validate:"required"`
}

// @Summary Update store image
// @Description Update the image of a specific store
// @Tags Vendors
// @Accept json
// @Produce json
// @Param request body StoreImageRequest true "Store image update request"
// @Success 200 {object} object "Successfully updated store image"
// @Failure 400 {object} object "Invalid request body or failed to create upload request"
// @Failure 500 {object} object "Internal server error"
// @Router /vendors/image [post]
// @Security BearerAuth
func UpdateStoreImage(c *gin.Context, db *mongo.Database) {

	var payload StoreImageRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to bind json. " + err.Error()})
		return
	}

	validate := validator.New()
	if err := validate.Struct(payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body. " + err.Error()})
		return
	}

	apiURL := "https://api.imgbb.com/1/upload?key="

	apiKey := os.Getenv("IMGBB_API_KEY")

	formData := url.Values{}
	formData.Set("key", apiKey)
	formData.Set("image", payload.Image)

	req, err := http.NewRequest("POST", apiURL, strings.NewReader(formData.Encode()))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to create upload request. " + err.Error()})
		return
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to make upload request. " + err.Error()})
		return
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "error reading response. " + err.Error()})
		return
	}

	var result map[string]interface{}
	err = json.Unmarshal(respBody, &result)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "error error unmarshalling response. " + err.Error()})
		return
	}

	if resp.StatusCode >= 400 && resp.StatusCode <= 500 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "error uploading image. " + strconv.Itoa(resp.StatusCode)})
		return
	}

	responseData, ok := result["data"].(map[string]interface{})
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid response data"})
		return
	}
	imageUrl, ok := responseData["url"].(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid image url"})
		return
	}

	storeCollection := db.Collection(utils.STORE)

	storeId, err := primitive.ObjectIDFromHex(payload.StoreId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid store id"})
		return
	}

	res := storeCollection.FindOneAndUpdate(c, bson.M{"_id": storeId}, bson.M{
		"$set": bson.M{
			"image": imageUrl,
		},
	})

	if res.Err() != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update store. " + res.Err().Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "successfully updated store image"})

}

// @Summary Get a vendor by ID
// @Description Get a single vendor by its ID with resolved category names
// @Tags Vendors
// @Accept json
// @Produce json
// @Param id path string true "Vendor ID"
// @Success 200 {object} data.Store "Vendor object with resolved categories"
// @Failure 400 {object} object "Invalid vendor ID"
// @Failure 500 {object} object "Error fetching store"
// @Router /vendors/{id} [get]
// @Security BearerAuth
func GetVendor(c *gin.Context, db *mongo.Database) {
	stringId := c.Param("id")
	id, err := primitive.ObjectIDFromHex(stringId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	storeCollection := db.Collection(utils.STORE)

	// Use aggregation pipeline to resolve category IDs to category names
	pipeline := []bson.M{
		{"$match": bson.M{"_id": id}},
		{"$lookup": bson.M{
			"from":         "Category",
			"localField":   "categories",
			"foreignField": "_id",
			"as":           "resolvedCategories",
		}},
		{"$project": bson.M{
			"_id":             1,
			"status":          1,
			"name":            1,
			"image":           1,
			"description":     1,
			"address":         1,
			"categories":      "$resolvedCategories",
			"items":           1,
			"likedByUserIds":  1,
			"mapLocation":     1,
			"ratings":         1,
			"type":            1,
			"openingTime":     1,
			"closingTime":     1,
			"availableDays":   1,
		}},
	}

	cursor, err := storeCollection.Aggregate(c, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching store " + err.Error()})
		return
	}
	defer cursor.Close(c)

	var stores []bson.M
	if err := cursor.All(c, &stores); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding store " + err.Error()})
		return
	}

	if len(stores) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No store found with this id"})
		return
	}

	c.JSON(http.StatusOK, stores[0])
}

// @Summary Update a vendor by ID
// @Description Update an existing vendor's information by its ID
// @Tags Vendors
// @Accept json
// @Produce json
// @Param id path string true "Vendor ID"
// @Param request body data.Store true "Vendor update request"
// @Success 200 {object} data.Store "Updated vendor object"
// @Failure 400 {object} object "Invalid request body or invalid vendor ID"
// @Failure 500 {object} object "Failed to update store"
// @Router /vendors/{id} [put]
// @Security BearerAuth
func UpdateVendor(c *gin.Context, db *mongo.Database) {
	stringId := c.Param("id")
	id, err := primitive.ObjectIDFromHex(stringId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var updateRequest data.Store
	if err := c.ShouldBindJSON(&updateRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body. " + err.Error()})
		slog.Info("Invalid request body", "error", err)
		return
	}

	vendorsCollection := db.Collection(utils.STORE)

	update := bson.M{"$set": updateRequest}
	options := options.FindOneAndUpdate().SetReturnDocument(options.After)

	var updatedStore data.Store
	if err := vendorsCollection.FindOneAndUpdate(c, bson.M{"_id": id}, update, options).Decode(&updatedStore); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update store. " + err.Error()})
		slog.Info("Failed to update store", "error", err)
		return
	}

	c.JSON(http.StatusOK, updatedStore)

}

// type CategoryRequest struct {
// 	Name    string `json:"name" validate:"required"`
// 	StoreId string `json:"storeId" validate:"required"`
// }

// func CreateItemCategory(c *gin.Context, db *mongo.Database) {

// 	var request CategoryRequest
// 	if err := c.ShouldBindJSON(&request); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body. " + err.Error()})
// 		slog.Error("Invalid request body", "error", err)
// 		return
// 	}

// 	validate := validator.New()
// 	if err := validate.Struct(request); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body. " + err.Error()})
// 		slog.Error("Invalid request body", "error", err)
// 		return
// 	}

// 	categoryCollection := db.Collection(utils.CATEGORY)

// 	storeId, err := primitive.ObjectIDFromHex(request.StoreId)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid store id. " + err.Error()})
// 		slog.Error("Invalid store id", "error", err)
// 		return
// 	}

// 	category := data.Category{
// 		ID:      primitive.NewObjectID(),
// 		Name:    request.Name,
// 		StoreId: storeId,
// 	}

// 	_, err = categoryCollection.InsertOne(c, category)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create category. " + err.Error()})
// 		slog.Error("failed to create category", "error", err)
// 		return
// 	}

// 	c.JSON(http.StatusOK, category)
// }

func GetVendorItems(c *gin.Context, db *mongo.Database) {
	storeIdString := c.Param("id")
	storeId, err := primitive.ObjectIDFromHex(storeIdString)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid storeId. " + err.Error()})
		slog.Error("Invalid storeId", "error", err.Error())
		return
	}

	nameQuery := c.Query("name")

	itemCollection := db.Collection(utils.ITEM)

	filter := bson.M{"storeId": storeId}
	if len(nameQuery) > 0 {
		filter["name"] = bson.M{
			"$regex":   nameQuery,
			"$options": "i",
		}
	}

	fmt.Println("filter ", filter)

	pipeline := []bson.M{
		{"$match": filter},
		{"$lookup": bson.M{
			"from":         "Store",
			"localField":   "storeId",
			"foreignField": "_id",
			"as":           "store",
		}},
		{"$unwind": "$store"},
		{"$project": bson.M{
			"_id":              1,
			"status":           1,
			"categoryId":       1,
			"category":         1,
			"currentInventory": 1,
			"desc":             1,
			"image":            1,
			"name":             1,
			"price":            1,
			"storeId":          1,
			"store":            "$store",
			"createdAt":        1,
			"updatedAt":        1,
		}},
	}

	cursor, err := itemCollection.Aggregate(c, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to aggregate items. " + err.Error()})
		slog.Error("Failed to aggregate items", "error", err)
		return
	}
	defer cursor.Close(c)

	type ItemResponse struct {
		data.Item `bson:",inline"`
		Store     data.Store `bson:"store" json:"store"`
	}

	items := []ItemResponse{}

	if err := cursor.All(c, &items); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode items. " + err.Error()})
		slog.Error("Failed to decode items", "error", err)
		return
	}

	c.JSON(http.StatusOK, items)

}
