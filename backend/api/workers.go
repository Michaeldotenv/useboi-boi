package api

import (
	"context"
	"log/slog"
	"time"

	"useboi-boi/backend/api/payments"
	"useboi-boi/backend/internal/data"
	"useboi-boi/backend/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func WithdrawalProcessor(db *mongo.Database) {

	collection := db.Collection(utils.WITHDRAWAL_REQUEST)

	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()

	for range ticker.C {
		cutoff := time.Now().Add(-24 * time.Hour)
		filter := bson.M{
			"createdAt": bson.M{"$lte": cutoff},
			"status":    "pending",
		}

		cursor, err := collection.Find(context.TODO(), filter)
		if err != nil {
			slog.Info("Error fetching withdrawals: ", "error", err.Error())
			continue
		}

		var requests []data.WithdrawalRequest
		if err := cursor.All(context.TODO(), &requests); err != nil {
			slog.Info("Error decoding withdrawals:", "error", err.Error())
			continue
		}

		slog.Info("message", "withdrawal requests", requests)

		for _, request := range requests {
			err := payments.ProcessWithdrawal(request, db)
			if err != nil {
				slog.Info("Failed to process withdrawal ID ", request.ID.Hex(), err.Error())
				continue
			}

			_, err = collection.UpdateOne(
				context.TODO(),
				bson.M{"_id": request.ID},
				bson.M{"$set": bson.M{"status": "processed"}},
			)
			if err != nil {
				slog.Info("Failed to update status for withdrawal ID ", request.ID.Hex(), err.Error())
			}
		}

		if len(requests) < 1 {
			slog.Info("message", "no withdrawal request that has stayed for more than 24hrs", "👍🏾")
		}
	}
}

func RatingComputer(db *mongo.Database) {

	slog.Info("message", "starting ratings compute operation", "👍🏾")

	userCollection := db.Collection(utils.USER)
	storeCollection := db.Collection(utils.STORE)
	orderCollection := db.Collection(utils.ORDER)
	riderRatingCollection := db.Collection(utils.RIDER_RATING)

	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	for range ticker.C {

		startTime := time.Now()

		var riders []data.User
		riderCursor, err := userCollection.Find(context.TODO(), bson.M{"type": "rider"})
		if err != nil {
			slog.Info("Failed to get riders", "error", err.Error())
			return
		}
		riderCursor.All(context.Background(), &riders)

		for _, rider := range riders {

			var riderOrders []data.Order
			riderOrdersCursor, err := orderCollection.Find(context.TODO(), bson.M{"riderId": rider.ID, "status": "completed"}, options.Find().SetLimit(30))
			if err != nil {
				slog.Info("Failed to get rider's orders", "error", err.Error())
				continue
			}

			riderOrdersCursor.All(context.TODO(), &riderOrders)

			var riderRatings []int
			for _, order := range riderOrders {
				if order.RiderRating != nil {
					riderRatings = append(riderRatings, *order.RiderRating)
				}
			}

			riderRatingAverage := utils.Average(riderRatings)

			_, err = riderRatingCollection.UpdateOne(context.TODO(), bson.M{"userId": rider.ID}, bson.M{
				"$set": bson.M{
					"value":     riderRatingAverage,
					"updatedAt": time.Now(),
				},
			}, options.Update().SetUpsert(true))

			if err != nil {
				slog.Info("Failed to update rider rating", "error", err.Error())
				continue
			}
		}

		var stores []data.Store
		storesCursor, err := storeCollection.Find(context.TODO(), bson.M{"status": "active"})
		if err != nil {
			slog.Info("Failed to get stores", "error", err.Error())
			return
		}
		storesCursor.All(context.TODO(), &stores)

		for _, store := range stores {

			var storeOrders []data.Order
			storeOrdersCursor, err := orderCollection.Find(context.TODO(), bson.M{"storeId": store.ID, "status": "completed"}, options.Find().SetLimit(30))
			if err != nil {
				slog.Info("Failed to get stores's orders", "error", err.Error())
				continue
			}

			storeOrdersCursor.All(context.TODO(), &storeOrders)

			var storeRatings []int
			for _, order := range storeOrders {
				if order.VendorRating != nil {
					storeRatings = append(storeRatings, *order.VendorRating)
				}
			}

			storeRatingAverage := utils.Average(storeRatings)

			_, err = storeCollection.UpdateOne(context.TODO(), bson.M{"_id": store.ID}, bson.M{
				"$set": bson.M{
					"ratings": storeRatingAverage,
				},
			})

			if err != nil {
				slog.Info("Failed to update store's rating", "error", err.Error())
				continue
			}
		}

		duration := time.Since(startTime)
		slog.Info("message", "finished ratings compute operation. took ", duration)
	}

}

func VirtualAccountProcessor(db *mongo.Database) {
	slog.Info("message", "VirtualAccountProcessor", "👍🏾")

	ticker := time.NewTicker(7 * time.Hour)
	defer ticker.Stop()

	for range ticker.C {
		ProcessVirtualAccounts(db)
	}
}

func ProcessVirtualAccounts(db *mongo.Database) {
	slog.Info("Starting ProcessVirtualAccounts worker...")
	userCollection := db.Collection(utils.USER)

	filter := bson.M{
		"virtualBankAccount.accountname": "",
	}

	cursor, err := userCollection.Find(context.Background(), filter)
	if err != nil {
		slog.Error("error", "Failed to find users:", err)
		return
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		slog.Info("111")
		var user data.User
		if err := cursor.Decode(&user); err != nil {
			slog.Error("error", "Failed to decode user:", err)
			continue
		}

		slog.Info("Processing user for virtual account:", "email", user.Email)

		virtualAccount, err := payments.GetPaystackAccountForUser(context.Background(), db, &user.ID, &user.Email)
		if err != nil {
			slog.Error("error", "Failed to get or update virtual account for user:", err, "email", user.Email)
			continue
		}

		if virtualAccount != nil {
			slog.Info("Successfully updated virtual account for user:", "email", user.Email, "accountNumber", virtualAccount.AccountNumber)
		}
	}

	slog.Info("Finished ProcessVirtualAccounts worker.")
}
