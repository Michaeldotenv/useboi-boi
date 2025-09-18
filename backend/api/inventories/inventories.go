package inventories

import (
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"math"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/Michaeldotenv/useboi-boi/backend/internal/data"
	"github.com/Michaeldotenv/useboi-boi/backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetStoreItems(c *gin.Context, db *mongo.Database) {
	storeIdString := c.Query("storeId")
	categoryIdString := c.Query("categoryId")
	nameQuery := c.Query("name")

	storeId, _ := primitive.ObjectIDFromHex(storeIdString)
	categoryId, _ := primitive.ObjectIDFromHex(categoryIdString)

	filter := bson.M{"status": bson.M{"$ne": "deleted"}}
	if !storeId.IsZero() {
		filter["storeId"] = storeId
	}
	if !categoryId.IsZero() {

		categoryCollection := db.Collection(utils.CATEGORY)

		var category data.Category
		if err := categoryCollection.FindOne(c, bson.M{"_id": categoryId}).Decode(&category); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category id. " + err.Error()})
			slog.Error("Invalid category id", "error", err)
			return
		}

		filter["$or"] = bson.A{
			bson.M{"categoryId": categoryId},
			bson.M{"category": category.Name},
		}
	}
	if len(nameQuery) > 0 {
		filter["name"] = nameQuery
	}

	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}
	skip := (page - 1) * limit

	opts := options.Find().SetSkip(int64(skip)).SetLimit(int64(limit))
	itemsCollection := db.Collection(utils.ITEM)
	cursor, err := itemsCollection.Find(c, filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching items: " + err.Error()})
		return
	}
	defer cursor.Close(c)

	items := []data.Item{}
	if err := cursor.All(c, &items); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding items: " + err.Error()})
		return
	}

	total, err := itemsCollection.CountDocuments(c, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error counting items: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       items,
		"page":       page,
		"limit":      limit,
		"total":      total,
		"page_count": int(math.Ceil(float64(total) / float64(limit))),
	})
}

// CreateCategory godoc
// @Summary Create a new category
// @Description Create a new category for a store
// @Tags Inventories
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param category body data.Category true "Category object"
// @Success 201 {object} data.Category
// @Failure 400 {object} data.Error
// @Failure 500 {object} data.Error
// @Router /inventories/categories/ [post]
func CreateCategory(c *gin.Context, db *mongo.Database) {
	var category data.Category

	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error binding json " + err.Error()})
		slog.Info("Invalid request. Error binding json", "error", err)
		return
	}

	if len(category.Name) < 1 || category.StoreId.IsZero() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category"})
		slog.Info("Invalid category", "error", "")
		return
	}

	category.ID = primitive.NewObjectID()

	categoriesCollection := db.Collection(utils.CATEGORY)

	result := categoriesCollection.FindOne(c, bson.M{"name": category.Name, "storeId": category.StoreId})
	if result.Err() == mongo.ErrNoDocuments {
		_, err := categoriesCollection.InsertOne(c, category)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating category " + err.Error()})
			return
		}
		c.JSON(http.StatusCreated, category)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "category already exists"})
		slog.Info("Category already exists", "error", "")
		return
	}
}

func UpdateCategory(c *gin.Context, db *mongo.Database) {

	idStr := c.Param("id")

	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category id. " + err.Error()})
		slog.Info("Invalid category id", "error", err)
		return
	}

	var category data.Category

	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error binding json " + err.Error()})
		slog.Info("Invalid request. Error binding json", "error", err)
		return
	}

	if len(category.Name) < 1 || category.StoreId.IsZero() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category"})
		slog.Info("Invalid category", "error", "")
		return
	}

	category.ID = primitive.NewObjectID()

	categoriesCollection := db.Collection(utils.CATEGORY)

	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{
		"name": category.Name,
	}}
	options := options.FindOneAndUpdate().SetReturnDocument(options.After)

	var updatedCategory data.Category
	if err := categoriesCollection.FindOneAndUpdate(c, filter, update, options).Decode(&updatedCategory); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update category. " + err.Error()})
		slog.Info("Failed to update category", "error", err)
		return
	}

	c.JSON(http.StatusOK, updatedCategory)

}

func DeleteCategory(c *gin.Context, db *mongo.Database) {
	var category data.Category

	category.ID = primitive.NewObjectID()

	categoriesCollection := db.Collection(utils.CATEGORY)

	filter := bson.M{"name": category.Name, "storeId": category.StoreId}

	_, err := categoriesCollection.DeleteOne(c, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete category"})
		slog.Info("Failed to delete category", "error", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"error": "deleted category successfully"})

}

func GetCategories(c *gin.Context, db *mongo.Database) {

	storeStringId := c.Param("id")

	storeId, err := primitive.ObjectIDFromHex(storeStringId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid store id. " + err.Error()})
		slog.Info("invalid store id", "error", err)
	}

	categoryCollection := db.Collection(utils.CATEGORY)

	filter := bson.M{"storeId": storeId}

	cursor, err := categoryCollection.Find(c, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get categories. " + err.Error()})
		slog.Info("failed to get categories", "error", err)
	}

	defer cursor.Close(c)

	var categories []data.Category
	if err = cursor.All(c, &categories); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get categories. " + err.Error()})
		slog.Info("failed to get categories", "error", err)
	}

	c.JSON(http.StatusOK, categories)
}

// AddItemToStoreInventory godoc
// @Summary Add item to store inventory
// @Description Add a new item to a store's inventory
// @Tags Inventories
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param item body data.Item true "Item object"
// @Success 201 {object} data.Item
// @Failure 400 {object} data.Error
// @Failure 500 {object} data.Error
// @Router /inventories/items/ [post]
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
			imageUrl, err := UploadItemImage(*item.Image)
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

		if item.Category != nil {
			result := categoryCollection.FindOne(c, bson.M{"name": item.Category, "storeId": item.StoreID})
			if result.Err() == mongo.ErrNoDocuments {
				slog.Info("err no document found")
				category := data.Category{
					ID:      primitive.NewObjectID(),
					Name:    *item.Category,
					StoreId: *item.StoreID,
				}
				_, err := categoryCollection.InsertOne(c, category)
				if err != nil {
					return nil, err
				}
			}
		}

		return nil, err
	})

	if err != nil {
		return
	}

	c.JSON(http.StatusCreated, item)

}

func GetItem(c *gin.Context, db *mongo.Database) {

	idStr := c.Param("id")
	itemId, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid item id. " + err.Error()})
		slog.Info("Invalid item id", "error", err)
		return
	}

	itemCollection := db.Collection(utils.ITEM)

	var item data.Item
	if err := itemCollection.FindOne(c, bson.M{"_id": itemId}).Decode(&item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get item. " + err.Error()})
		slog.Info("Failed to get item", "error", err)
		return
	}

	c.JSON(http.StatusOK, item)
}

func UpdateItem(c *gin.Context, db *mongo.Database) {
	idStr := c.Param("id")
	itemId, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid item id. " + err.Error()})
		slog.Info("Invalid item id", "error", err)
		return
	}

	var updateRequest data.Item
	if err := c.ShouldBindJSON(&updateRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": ""})
	}

	update := bson.M{
		"$set": bson.M{
			"price":            updateRequest.Price,
			"status":           updateRequest.Status,
			"currentInventory": updateRequest.CurrentInventory,
			"updatedAt":        time.Now(),
		},
	}

	itemCollection := db.Collection(utils.ITEM)

	options := options.FindOneAndUpdate().SetReturnDocument(options.After)

	var item data.Item
	if err := itemCollection.FindOneAndUpdate(c, bson.M{"_id": itemId}, update, options).Decode(&item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get item. " + err.Error()})
		slog.Info("Failed to get item", "error", err)
		return
	}

	c.JSON(http.StatusOK, item)
}

func UploadItemImage(image string) (*string, error) {

	apiURL := "https://api.imgbb.com/1/upload?key="

	apiKey := os.Getenv("IMGBB_API_KEY")

	formData := url.Values{}
	formData.Set("key", apiKey)
	formData.Set("image", image)

	req, err := http.NewRequest("POST", apiURL, strings.NewReader(formData.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error making request: %v", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response: %v", err)
	}

	var result map[string]interface{}
	err = json.Unmarshal(respBody, &result)
	if err != nil {
		return nil, fmt.Errorf("error unmarshalling response: %v", err)
	}

	if resp.StatusCode >= 400 && resp.StatusCode <= 500 {
		return nil, fmt.Errorf("error uploading image %v", strconv.Itoa(resp.StatusCode))
	}

	responseData, ok := result["data"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid response data")
	}
	imageUrl, ok := responseData["url"].(string)
	if !ok {
		return nil, fmt.Errorf("invalid image url")
	}

	return &imageUrl, nil

}

// RemoveItemFromStoreInventory godoc
// @Summary Remove item from store inventory
// @Description Soft delete an item from a store's inventory by ID
// @Tags Inventories
// @Security BearerAuth
// @Produce json
// @Param id path string true "Item ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} data.Error
// @Router /inventories/items/{id} [delete]
func RemoveItemFromStoreInventory(c *gin.Context, db *mongo.Database) {

	idString := c.Param("id")

	id, err := primitive.ObjectIDFromHex(idString)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Wrong id " + err.Error()})
		return
	}

	itemsCollection := db.Collection(utils.ITEM)

	var itemToRemove data.Item
	result := itemsCollection.FindOne(c, bson.M{"_id": id})

	if err := result.Decode(&itemToRemove); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot find item " + err.Error()})
		return
	}

	if itemToRemove.ID.IsZero() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Item doesn't exist"})
		return
	}

	_, err = itemsCollection.UpdateOne(c, bson.M{"_id": id}, bson.M{
		"$set": bson.M{
			"status": "deleted",
		},
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error removing item " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item removed successfully"})

}
