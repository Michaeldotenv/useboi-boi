package coupons

import (
	"log/slog"
	"net/http"
	"strconv"

	"backend/internal/data"
	"backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetCoupons(c *gin.Context, db *mongo.Database) {

	couponCollection := db.Collection(utils.COUPON)

	isActiveStr := c.Query("isActive")

	filter := bson.M{}

	if len(isActiveStr) > 0 {
		isActive, err := strconv.ParseBool(isActiveStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid isActive value. Value should be bool. " + err.Error()})
			slog.Error("Invalid isActive value", "error", err.Error())
			return
		}
		filter["isActive"] = isActive
	}

	pipeline := []bson.M{
		{"$match": filter},
		{"$lookup": bson.M{
			"from":         "Store",
			"foreignField": "storeId",
			"localField":   "_id",
			"as":           "store",
		}},
		{"$unwind": bson.M{
			"path":                       "$store",
			"preserveNullAndEmptyArrays": true,
		}},
		{"$project": bson.M{
			"_id":        1,
			"desc":       1,
			"code":       1,
			"type":       1,
			"chargeType": 1,
			"image":      1,
			"discount":   1,
			"isActive":   1,
			"storeId":    1,
			"store":      "$store",
		}},
	}

	cursor, err := couponCollection.Aggregate(c, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch coupons. " + err.Error()})
		slog.Error("Failed to fetch coupons", "error", err.Error())
		return
	}

	coupons := []data.Coupon{}
	if err := cursor.All(c, &coupons); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode coupons. " + err.Error()})
		slog.Error("Failed to decode coupons", "error", err.Error())
		return
	}

	c.JSON(http.StatusOK, coupons)
}
