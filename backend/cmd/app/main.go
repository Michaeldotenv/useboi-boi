package main

import (
	"context"
	"log/slog"
	"os"

	"useboi-boi/backend/api"
	"useboi-boi/backend/api/admin"
	"useboi-boi/backend/internal/data"

	_ "useboi-boi/backend/cmd/app/docs"

	firebase "firebase.google.com/go"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"google.golang.org/api/option"
)

// @title Boiboi Backend API
// @version 1.0
// @description Boiboi API Documentation.
// @BasePath /api
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {

	server := gin.Default()

	client, err := data.ConnectToMongoDB(&gin.Context{})
	if err != nil {
		panic(err)
	}

	logger := slog.New(slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{
		Level: slog.LevelDebug,
	}))
	slog.SetDefault(logger)

	var opt option.ClientOption
	credPath := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")
	if credPath == "" {
		if os.Getenv("APP_ENV") == "development" {
			credPath = "boiboi-775e3-firebase-adminsdk-whdew-ee9f66987e.json"
		} else {
			credPath = "../../boiboi-775e3-firebase-adminsdk-whdew-ee9f66987e.json"
		}
	}
	opt = option.WithCredentialsFile(credPath)

	projectID := os.Getenv("FIREBASE_PROJECT_ID")
	if projectID == "" {
		slog.Warn("FIREBASE_PROJECT_ID is not set; FCM will fail to initialize")
	}

	app, err := firebase.NewApp(context.Background(), &firebase.Config{ProjectID: projectID}, opt)
	if err != nil {
		panic(err)
	}

	notificationClient, err := app.Messaging(context.Background())
	if err != nil {
		slog.Error("error initializing messaging client", "err", err)
		panic(err)
	}

	db := client.Database(os.Getenv("DB_NAME"))

	admin.SetupAdmin(db)

	server.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api.SetupRoutes(server, db, notificationClient)

	server.Run(":8082")

}
