package public

import (
	"log/slog"
	"net/http"

	"useboi-boi/backend/internal/data"
	"useboi-boi/backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetCustomerAppVersion(c *gin.Context, db *mongo.Database) {

	appName := c.Query("appName")
	kind := c.Query("kind")

	versionCollection := db.Collection(utils.APP_VERSION)

	var appVersion data.AppVersion
	if err := versionCollection.FindOne(c, bson.M{"appName": appName, "kind": kind}).Decode(&appVersion); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch app version. " + err.Error()})
		slog.Info("Failed to fetch app version", "error", err)
		return
	}

	c.JSON(http.StatusOK, appVersion)
}
