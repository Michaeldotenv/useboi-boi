package items

import (
	"log/slog"
	"net/http"

	"github.com/Michaeldotenv/useboi-boi/backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetStoreItems(c *gin.Context, db *mongo.Database) {

	storeIdStr := c.Param("id")
	storeId, err := primitive.ObjectIDFromHex(storeIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store id. " + err.Error()})
		slog.Error("Invalid store id", "error", err.Error())
		return
	}

	itemCollection := db.Collection(utils.ITEM)

	filter := bson.M{"storeId": storeId, "status": "active"}

	cursor, err := itemCollection.Find(c, filter)
	if err != nil {

	}

	defer cursor.Close(c)

	// items :=
	// cursor.All(c, )

}
