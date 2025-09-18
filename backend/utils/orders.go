package utils

import (
	"log/slog"
	"github.com/Michaeldotenv/useboi-boi/backend/internal/data"

	"firebase.google.com/go/messaging"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func SendSuccessfulOrderNotificationToCustomer(c *gin.Context, db *mongo.Database, fcm *messaging.Client, user *data.User) {

	deviceTokenCollection := db.Collection(DEVICE_TOKEN)

	cursor, err := deviceTokenCollection.Find(c, bson.M{"userId": user.ID})
	if err != nil {
		slog.Info("error", "error sending notification", err.Error())
	}
	defer cursor.Close(c)

	var customerDeviceTokens []data.DeviceToken
	if err = cursor.All(c, &customerDeviceTokens); err != nil {
		slog.Info("error", "error decoding documents:", err.Error())
	}

	for _, token := range customerDeviceTokens {
		message := &messaging.Message{
			Token: token.Token,
			Notification: &messaging.Notification{
				Title: "Successful Order Placement!",
				Body:  "Your order has been placed successfully and sent to the vendor",
			},
		}

		SendNotification(fcm, message, func() {
			deviceTokenCollection.DeleteOne(c, bson.M{"_id": token.ID})
		})
	}

}

func SendNewOrderNotificationToRiders(c *gin.Context, db *mongo.Database, fcm *messaging.Client) {

	deviceTokenCollection := db.Collection(DEVICE_TOKEN)
	userCollection := db.Collection(USER)

	userCursor, err := userCollection.Find(c, bson.M{"type": "rider"})
	if err != nil {
		slog.Info("message", "Failed to get riders", err.Error())
		return
	}
	defer userCursor.Close(c)

	var riders []data.User
	if err = userCursor.All(c, &riders); err != nil {
		slog.Info("error", "error decoding documents:", err.Error())
		return
	}

	for _, rider := range riders {
		cursor, tErr := deviceTokenCollection.Find(c, bson.M{"userId": rider.ID})
		if tErr != nil {
			slog.Info("error", "error sending notification to user --> "+rider.ID.Hex(), tErr.Error())
		}
		defer cursor.Close(c)

		var riderDeviceTokens []data.DeviceToken
		if err = cursor.All(c, &riderDeviceTokens); err != nil {
			slog.Info("error", "error decoding documents:", err.Error())
			continue
		}

		for _, token := range riderDeviceTokens {
			message := &messaging.Message{
				Token: token.Token,
				Notification: &messaging.Notification{
					Title: "New Order Alert!",
					Body:  "New Order placed by a Customer. Click to view",
				},
			}
			SendNotification(fcm, message, func() {
				deviceTokenCollection.DeleteOne(c, bson.M{"_id": token.ID})
			})
		}

	}

}

func SendNewOrderNotificationToMerchant(c *gin.Context, db *mongo.Database, fcm *messaging.Client, order *data.Order) {

	userCollection := db.Collection(USER)
	deviceTokenCollection := db.Collection(DEVICE_TOKEN)

	var storeAdmin data.User
	if err := userCollection.FindOne(c, bson.M{"isAdmin": true, "storeId": order.StoreID}).Decode(&storeAdmin); err != nil {
		slog.Info("error", "error getting store admin for notification", err.Error())
		return
	}

	var customer data.User
	if err := userCollection.FindOne(c, bson.M{"_id": order.CustomerID}).Decode(&customer); err != nil {
		slog.Info("error", "error getting customer data for notification", err.Error())
		return
	}

	cursor, err := deviceTokenCollection.Find(c, bson.M{"userId": storeAdmin.ID})
	if err != nil {
		slog.Info("error", "error sending notification", err.Error())
	}
	defer cursor.Close(c)

	var customerDeviceTokens []data.DeviceToken
	if err = cursor.All(c, &customerDeviceTokens); err != nil {
		slog.Info("error", "error decoding documents:", err.Error())
	}

	for _, token := range customerDeviceTokens {
		message := &messaging.Message{
			Token: token.Token,
			Notification: &messaging.Notification{
				Title: customer.FirstName + " has placed a new order on your store!",
				Body:  "Your store has a new pending order",
			},
		}

		SendNotification(fcm, message, func() {
			deviceTokenCollection.DeleteOne(c, bson.M{"_id": token.ID})
		})
	}

}

func SendOrderUpdateToCustomer(c *gin.Context, db *mongo.Database, fcm *messaging.Client, order *data.Order) {
	deviceTokenCollection := db.Collection(DEVICE_TOKEN)

	cursor, err := deviceTokenCollection.Find(c, bson.M{"userId": order.CustomerID})
	if err != nil {
		slog.Info("error", "error sending notification", err.Error())
	}
	defer cursor.Close(c)

	var customerDeviceTokens []data.DeviceToken
	if err = cursor.All(c, &customerDeviceTokens); err != nil {
		slog.Info("error", "error decoding documents:", err.Error())
	}

	userCollection := db.Collection(USER)
	var rider data.User
	if err := userCollection.FindOne(c, bson.M{"_id": order.RiderID}).Decode(&rider); err != nil {
		slog.Info("error", "error fetching rider", err.Error())
		return
	}

	// orderCreated, orderReceivedByVendor, orderAcceptedByRider, riderAtVendor, riderOnHisWay, riderAtUserLocation
	for _, token := range customerDeviceTokens {
		if *order.OrderProgressStatus == "orderAcceptedByRider" {
			message := &messaging.Message{
				Token: token.Token,
				Notification: &messaging.Notification{
					Title: "Your Order Has Been Accepted By Rider!",
					Body:  rider.FirstName + " is on the way to pick up your order. Sit tight, it’s in good hands!",
				},
			}

			SendNotification(fcm, message, func() {
				deviceTokenCollection.DeleteOne(c, bson.M{"_id": token.ID})
			})
		} else if *order.OrderProgressStatus == "riderAtVendor" {
			message := &messaging.Message{
				Token: token.Token,
				Notification: &messaging.Notification{
					Title: "Rider at the Vendor!",
					Body:  rider.FirstName + " has arrived at the vendor and is picking up your order",
				},
			}

			SendNotification(fcm, message, func() {
				deviceTokenCollection.DeleteOne(c, bson.M{"_id": token.ID})
			})
		} else if *order.OrderProgressStatus == "riderOnHisWay" {
			message := &messaging.Message{
				Token: token.Token,
				Notification: &messaging.Notification{
					Title: "Your Order is on the Way!",
					Body:  "The rider is on the way to your location. Get ready to receive your order!",
				},
			}

			SendNotification(fcm, message, func() {
				deviceTokenCollection.DeleteOne(c, bson.M{"_id": token.ID})
			})
		} else if *order.OrderProgressStatus == "riderAtUserLocation" {
			message := &messaging.Message{
				Token: token.Token,
				Notification: &messaging.Notification{
					Title: "Rider at Your Location!",
					Body:  "The rider has arrived at your location. Please collect your order with the code " + order.Code,
				},
			}

			SendNotification(fcm, message, func() {
				deviceTokenCollection.DeleteOne(c, bson.M{"_id": token.ID})
			})
		}
	}

}
