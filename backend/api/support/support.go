package support

import (
	"net/http"
	"time"

	"useboi-boi/backend/internal/data"
	"useboi-boi/backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type CreateTicketRequest struct {
	Subject string `json:"subject"`
	Message string `json:"message"`
}

func CreateTicket(c *gin.Context, db *mongo.Database) {
	var req CreateTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil || len(req.Subject) == 0 || len(req.Message) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	userIdStr := c.GetString("userId")
	userId, err := primitive.ObjectIDFromHex(userIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	now := time.Now()
	ticket := data.SupportTicket{
		ID:        primitive.NewObjectID(),
		UserID:    userId,
		Subject:   req.Subject,
		Message:   req.Message,
		Status:    "open",
		CreatedAt: now,
		UpdatedAt: now,
	}

	col := db.Collection(utils.SUPPORT_TICKET)
	if _, err := col.InsertOne(c, ticket); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create ticket"})
		return
	}
	c.JSON(http.StatusCreated, ticket)
}

func GetMyTickets(c *gin.Context, db *mongo.Database) {
	userIdStr := c.GetString("userId")
	userId, err := primitive.ObjectIDFromHex(userIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	col := db.Collection(utils.SUPPORT_TICKET)
	cursor, err := col.Find(c, bson.M{"userId": userId})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch tickets"})
		return
	}
	defer cursor.Close(c)

	tickets := []data.SupportTicket{}
	if err := cursor.All(c, &tickets); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode tickets"})
		return
	}
	c.JSON(http.StatusOK, tickets)
}
