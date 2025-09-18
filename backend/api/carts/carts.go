package carts

import (
	"log/slog"
	"net/http"
	"github.com/Michaeldotenv/useboi-boi/backend/internal/data"
	"github.com/Michaeldotenv/useboi-boi/backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type CartItemData struct {
	data.CartItem `bson:",inline"`
	Item          data.Item `json:"item"`
}

func GetItemsInCart(c *gin.Context, db *mongo.Database) {

	cartIdStr := c.Param("id")
	cartId, err := primitive.ObjectIDFromHex(cartIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cart id. " + err.Error()})
		slog.Info("Invalid cart id", "error", err)
		return
	}

	cartItemCollection := db.Collection(utils.CART_ITEM)

	pipeline := []bson.M{
		{"$match": bson.M{"cartId": cartId}},
		{"$lookup": bson.M{
			"from":         "Item",
			"localField":   "itemId",
			"foreignField": "_id",
			"as":           "item",
		}},
		{"$unwind": "$item"},
		{"$project": bson.M{
			"_id":           1,
			"cartId":        1,
			"isAddedToCart": 1,
			"quantity":      1,
			"itemId":        1,
			"item":          "$item",
		}},
	}

	cursor, err := cartItemCollection.Aggregate(c, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get cart items. " + err.Error()})
		slog.Info("Failed to get cart items", "error", err)
		return
	}

	defer cursor.Close(c)

	cartItems := []CartItemData{}

	if err := cursor.All(c, &cartItems); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get cart items. " + err.Error()})
		slog.Info("Failed to get cart items", "error", err)
		return
	}

	c.JSON(http.StatusOK, cartItems)

}
