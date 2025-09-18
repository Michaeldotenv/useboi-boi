package notifications

import (
	"net/http"
	"skulpoint-backend/internal/data"
	"skulpoint-backend/utils"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)


type DeviceRequest struct {
	Token string `bson:"token" json:"token" validate:"required,min=16"`
	Type  string `bson:"type" json:"type" validate:"required,oneof=android ios"` // android, ios
}

func RegisterDevice(c *gin.Context, db *mongo.Database) {
	userStringId, ok := c.Get("userId")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "couldn't fetch userId"})
		return
	}

	userId, err := primitive.ObjectIDFromHex(userStringId.(string))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid userId"})
		return
	}

	deviceTokenCollection := db.Collection(utils.DEVICE_TOKEN)

	var request DeviceRequest
	if err = c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json body. " + err.Error()})
		return
	}

	validate := validator.New()
	if err = validate.Struct(request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body. " + err.Error()})
		return
	}

	var existingToken data.DeviceToken
	deviceTokenCollection.FindOne(c, bson.M{"token": request.Token}).Decode(&existingToken)

	if !existingToken.UserId.IsZero() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "token exists already"})
		return
	}

	newToken := data.DeviceToken{
		ID: primitive.NewObjectID(),
		UserId: userId,
		Type: request.Type,
		Token: request.Token,
		CreatedAt: time.Now(),
	}

	_, err = deviceTokenCollection.InsertOne(c, newToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add token. " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, newToken)

}
