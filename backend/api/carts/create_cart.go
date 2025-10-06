package carts

import (
	"log/slog"
	"net/http"
	"time"

	"useboi-boi/backend/internal/data"
	"useboi-boi/backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type CreateCartBody struct {
	StoreId string `json:"storeId"`
}

type AddCartItemBody struct {
	ItemId   string `json:"itemId"`
	Quantity int    `json:"quantity"`
}

// CreateCart creates a new cart for a user
func CreateCart(c *gin.Context, db *mongo.Database) {
	var body CreateCartBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request " + err.Error()})
		return
	}

	userId, ok := c.Get("userId")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "userId not found"})
		return
	}

	userObjectId, err := primitive.ObjectIDFromHex(userId.(string))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid userId"})
		return
	}

	storeObjectId, err := primitive.ObjectIDFromHex(body.StoreId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid storeId"})
		return
	}

	cartCollection := db.Collection(utils.CART)

	cart := data.Cart{
		ID:          primitive.NewObjectID(),
		UserId:      userObjectId,
		StoreId:     storeObjectId,
		IsCompleted: false,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	_, err = cartCollection.InsertOne(c, cart)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create cart. " + err.Error()})
		slog.Error("Failed to create cart", "error", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":      cart.ID.Hex(),
		"storeId": cart.StoreId.Hex(),
		"userId":  cart.UserId.Hex(),
	})
}

// AddCartItem adds an item to a cart or updates quantity if it exists
func AddCartItem(c *gin.Context, db *mongo.Database) {
	var body AddCartItemBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request " + err.Error()})
		return
	}

	cartIdStr := c.Param("id")
	cartId, err := primitive.ObjectIDFromHex(cartIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid cart id"})
		return
	}

	itemId, err := primitive.ObjectIDFromHex(body.ItemId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid item id"})
		return
	}

	if body.Quantity <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "quantity must be greater than 0"})
		return
	}

	cartItemCollection := db.Collection(utils.CART_ITEM)
	cartCollection := db.Collection(utils.CART)

	// Verify cart exists
	var cart data.Cart
	if err := cartCollection.FindOne(c, bson.M{"_id": cartId}).Decode(&cart); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "cart not found"})
		return
	}

	// Check if item already exists in cart
	var existingItem data.CartItem
	err = cartItemCollection.FindOne(c, bson.M{
		"cartId": cartId,
		"itemId": itemId,
	}).Decode(&existingItem)

	if err == nil {
		// Item exists, update quantity
		_, err = cartItemCollection.UpdateOne(c, bson.M{"_id": existingItem.ID}, bson.M{
			"$set": bson.M{
				"quantity":      body.Quantity,
				"isAddedToCart": true,
			},
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update cart item"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "cart item updated", "id": existingItem.ID.Hex()})
		return
	}

	// Item doesn't exist, create new
	cartItem := data.CartItem{
		ID:            primitive.NewObjectID(),
		CartID:        cartId,
		ItemID:        itemId,
		Quantity:      body.Quantity,
		IsAddedToCart: true,
	}

	_, err = cartItemCollection.InsertOne(c, cartItem)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add cart item. " + err.Error()})
		slog.Error("Failed to add cart item", "error", err)
		return
	}

	// Update cart timestamp
	cartCollection.UpdateOne(c, bson.M{"_id": cartId}, bson.M{
		"$set": bson.M{"updatedAt": time.Now()},
	})

	c.JSON(http.StatusOK, gin.H{"message": "cart item added", "id": cartItem.ID.Hex()})
}

// UpdateCartItem updates the quantity of a cart item
func UpdateCartItem(c *gin.Context, db *mongo.Database) {
	var body AddCartItemBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request " + err.Error()})
		return
	}

	cartIdStr := c.Param("id")
	itemIdStr := c.Param("itemId")

	cartId, err := primitive.ObjectIDFromHex(cartIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid cart id"})
		return
	}

	itemId, err := primitive.ObjectIDFromHex(itemIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid item id"})
		return
	}

	cartItemCollection := db.Collection(utils.CART_ITEM)

	result, err := cartItemCollection.UpdateOne(c, bson.M{
		"cartId": cartId,
		"itemId": itemId,
	}, bson.M{
		"$set": bson.M{"quantity": body.Quantity},
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update cart item"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "cart item not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "cart item updated"})
}

// DeleteCartItem removes an item from a cart
func DeleteCartItem(c *gin.Context, db *mongo.Database) {
	cartIdStr := c.Param("id")
	itemIdStr := c.Param("itemId")

	cartId, err := primitive.ObjectIDFromHex(cartIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid cart id"})
		return
	}

	itemId, err := primitive.ObjectIDFromHex(itemIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid item id"})
		return
	}

	cartItemCollection := db.Collection(utils.CART_ITEM)

	result, err := cartItemCollection.DeleteOne(c, bson.M{
		"cartId": cartId,
		"itemId": itemId,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete cart item"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "cart item not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "cart item removed"})
}

