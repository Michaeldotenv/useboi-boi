package manage_orders

import (
	"log/slog"
	"net/http"
	"strconv"

	"useboi-boi/backend/internal/data"
	"useboi-boi/backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// GetAllOrders godoc
// @Summary Get all orders
// @Description Get a list of all orders with pagination
// @Tags Admin
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Success 200 {object} object{data=[]map[string]interface{},page=int,pageSize=int,totalCount=int}
// @Failure 500 {object} object{error=string}
// @Router /admin/orders [get]
// @Security BearerAuth
func GetAllOrders(c *gin.Context, db *mongo.Database) {

	orderCollection := db.Collection(utils.ORDER)

	const pageSize int64 = 20
	pageStr := c.DefaultQuery("page", "1")
	page, err := strconv.ParseInt(pageStr, 10, 64)
	if err != nil || page < 1 {
		page = 1
	}
	skip := (page - 1) * pageSize

	pipeline := []bson.M{
		{"$lookup": bson.M{
			"from":         "Store",
			"localField":   "storeId",
			"foreignField": "_id",
			"as":           "store",
		}},
		{"$unwind": "$store"},
		{"$lookup": bson.M{
			"from":         "User",
			"localField":   "customerId",
			"foreignField": "_id",
			"as":           "customer",
		}},
		{"$unwind": "$customer"},
		{"$lookup": bson.M{
			"from":         "User",
			"localField":   "riderId",
			"foreignField": "_id",
			"as":           "rider",
		}},
		{"$unwind": "$rider"},
		{"$lookup": bson.M{
			"from":         "Cart",
			"localField":   "cartId",
			"foreignField": "_id",
			"as":           "cart",
		}},
		{"$unwind": "$cart"},
		{"$facet": bson.M{
			"data": []bson.M{
				{"$skip": skip},
				{"$limit": pageSize},
				{"$project": bson.M{
					"_id":                 1,
					"cartId":              1,
					"customerId":          1,
					"storeId":             1,
					"riderId":             1,
					"deliveryInstruction": 1,
					"deliveryLocation":    1,
					"deliveryMapLocation": 1,
					"code":                1,
					"status":              1,
					"orderProgressStatus": 1,
					"price":               1,
					"serviceCharge":       1,
					"deliveryFee":         1,
					"couponPrice":         1,
					"isPaidFor":           1,
					"orderTransactionID":  1,
					"createdAt":           1,
					"updatedAt":           1,
					"store": bson.M{
						"_id":   "$store._id",
						"name":  "$store.name",
						"image": "$store.image",
					},
					"customer": bson.M{
						"_id":         "$customer._id",
						"email":       "$customer.email",
						"firstName":   "$customer.firstName",
						"phoneNumber": "$customer.phoneNumber",
					},
					"rider": bson.M{
						"_id":         "$rider._id",
						"email":       "$rider.email",
						"firstName":   "$rider.firstName",
						"phoneNumber": "$rider.phoneNumber",
					},
					"cart": "$cart",
				}},
			},
			"totalCount": []bson.M{
				{"$count": "count"},
			},
		}},
	}

	cursor, err := orderCollection.Aggregate(c, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to aggregate orders. " + err.Error()})
		slog.Error("Failed to aggregate orders", "error", err.Error())
		return
	}
	defer cursor.Close(c)

	type OrderResponse struct {
		data.Order `bson:",inline"`
		Cart       data.Cart  `bson:"cart" json:"cart"`
		Store      data.Store `bson:"store" json:"store"`
		Customer   data.User  `bson:"customer" json:"customer"`
		Rider      data.User  `bson:"rider" json:"rider"`
	}

	var result struct {
		Data       []OrderResponse `bson:"data"`
		TotalCount []bson.M        `bson:"totalCount"`
	}

	if cursor.Next(c) {
		if err := cursor.Decode(&result); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode orders. " + err.Error()})
			slog.Error("Failed to decode orders", "error", err.Error())
			return
		}
	}

	total := result.TotalCount[0]["count"].(int32)

	c.JSON(http.StatusOK, gin.H{"data": result.Data, "page": page, "pageSize": pageSize, "totalCount": total})

}

// GetOrder godoc
// @Summary Get an order by ID
// @Description Get a single order with full details by its ID
// @Tags Admin
// @Accept json
// @Produce json
// @Param id path string true "Order ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /admin/orders/{id} [get]
// @Security BearerAuth
func GetOrder(c *gin.Context, db *mongo.Database) {

	orderCollection := db.Collection(utils.ORDER)

	idStr := c.Param("id")
	orderId, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id. " + err.Error()})
		slog.Error("invalid order id", "error", err.Error())
		return
	}

	pipeline := []bson.M{
		{"$match": bson.M{"_id": orderId}},
		{"$lookup": bson.M{
			"from":         "Store",
			"localField":   "storeId",
			"foreignField": "_id",
			"as":           "store",
		}},
		{"$unwind": "$store"},
		{"$lookup": bson.M{
			"from":         "User",
			"localField":   "customerId",
			"foreignField": "_id",
			"as":           "customer",
		}},
		{"$unwind": "$customer"},
		{"$lookup": bson.M{
			"from":         "User",
			"localField":   "riderId",
			"foreignField": "_id",
			"as":           "rider",
		}},
		{"$unwind": "$rider"},
		{"$lookup": bson.M{
			"from":         "Cart",
			"localField":   "cartId",
			"foreignField": "_id",
			"as":           "cart",
		}},
		{"$unwind": "$cart"},
		{"$lookup": bson.M{
			"from":         "CartItem",
			"localField":   "cart._id",
			"foreignField": "cartId",
			"as":           "cartItems",
		}},
		{"$unwind": bson.M{
			"path":                       "$cartItems",
			"preserveNullAndEmptyArrays": true,
		}},
		{"$lookup": bson.M{
			"from":         "Item",
			"localField":   "cartItems.itemId",
			"foreignField": "_id",
			"as":           "cartItems.item",
		}},
		{"$unwind": bson.M{
			"path":                       "$cartItems.item",
			"preserveNullAndEmptyArrays": true,
		}},
		{"$group": bson.M{
			"_id":                 "$_id",
			"cart":                bson.M{"$first": "$cart"},
			"store":               bson.M{"$first": "$store"},
			"customer":            bson.M{"$first": "$customer"},
			"rider":               bson.M{"$first": "$rider"},
			"cartItems":           bson.M{"$push": "$cartItems"},
			"cartId":              bson.M{"$first": "$cartId"},
			"customerId":          bson.M{"$first": "$customerId"},
			"storeId":             bson.M{"$first": "$storeId"},
			"riderId":             bson.M{"$first": "$riderId"},
			"deliveryInstruction": bson.M{"$first": "$deliveryInstruction"},
			"deliveryLocation":    bson.M{"$first": "$deliveryLocation"},
			"deliveryMapLocation": bson.M{"$first": "$deliveryMapLocation"},
			"code":                bson.M{"$first": "$code"},
			"status":              bson.M{"$first": "$status"},
			"orderProgressStatus": bson.M{"$first": "$orderProgressStatus"},
			"price":               bson.M{"$first": "$price"},
			"serviceCharge":       bson.M{"$first": "$serviceCharge"},
			"deliveryFee":         bson.M{"$first": "$deliveryFee"},
			"couponPrice":         bson.M{"$first": "$couponPrice"},
			"isPaidFor":           bson.M{"$first": "$isPaidFor"},
			"orderTransactionID":  bson.M{"$first": "$orderTransactionID"},
			"createdAt":           bson.M{"$first": "$createdAt"},
			"updatedAt":           bson.M{"$first": "$updatedAt"},
		}},
		{"$project": bson.M{
			"_id":                 1,
			"cartId":              1,
			"customerId":          1,
			"storeId":             1,
			"riderId":             1,
			"deliveryInstruction": 1,
			"deliveryLocation":    1,
			"deliveryMapLocation": 1,
			"code":                1,
			"status":              1,
			"orderProgressStatus": 1,
			"price":               1,
			"serviceCharge":       1,
			"deliveryFee":         1,
			"couponPrice":         1,
			"isPaidFor":           1,
			"orderTransactionID":  1,
			"createdAt":           1,
			"updatedAt":           1,
			"store": bson.M{
				"_id":   "$store._id",
				"name":  "$store.name",
				"image": "$store.image",
			},
			"customer": bson.M{
				"_id":         "$customer._id",
				"email":       "$customer.email",
				"firstName":   "$customer.firstName",
				"phoneNumber": "$customer.phoneNumber",
			},
			"rider": bson.M{
				"_id":         "$rider._id",
				"email":       "$rider.email",
				"firstName":   "$rider.firstName",
				"phoneNumber": "$rider.phoneNumber",
			},
			"cart": "$cart",
			"cartItems": bson.M{
				"_id":           1,
				"cartId":        1,
				"quantity":      1,
				"isAddedToCart": 1,
				"itemId":        1,
				"item": bson.M{
					"_id":   1,
					"name":  1,
					"price": 1,
				},
			},
		}},
	}

	cursor, err := orderCollection.Aggregate(c, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to aggregate orders. " + err.Error()})
		slog.Error("Failed to aggregate orders", "error", err.Error())
		return
	}
	defer cursor.Close(c)

	type CartItemResponse struct {
		data.CartItem `bson:",inline"`
		Item          data.Item `bson:"item" json:"item"`
	}

	type OrderResponse struct {
		data.Order `bson:",inline"`
		Cart       data.Cart          `bson:"cart" json:"cart"`
		CartItems  []CartItemResponse `bson:"cartItems" json:"cartItems"`
		Store      data.Store         `bson:"store" json:"store"`
		Customer   data.User          `bson:"customer" json:"customer"`
		Rider      data.User          `bson:"rider" json:"rider"`
	}

	var order OrderResponse

	if cursor.Next(c) {
		if err := cursor.Decode(&order); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode orders. " + err.Error()})
			slog.Error("Failed to decode orders", "error", err.Error())
			return
		}
	}

	c.JSON(http.StatusOK, order)

}
