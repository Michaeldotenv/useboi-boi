package main

import (
	"context"
	"log/slog"
	"os"

	"backend/api"
	"backend/api/admin"
	"backend/internal/data"

	_ "backend/cmd/app/docs"

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
	if os.Getenv("APP_ENV") == "development" {
		opt = option.WithCredentialsFile("boiboi-775e3-firebase-adminsdk-whdew-ee9f66987e.json")
	} else {
		opt = option.WithCredentialsFile("../../boiboi-775e3-firebase-adminsdk-whdew-ee9f66987e.json")
	}

	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		panic(err)
	}

	notificationClient, err := app.Messaging(context.Background())
	if err != nil {
		slog.Error("error", "error initializing messaging client: %v\n", err)
		panic(err)
	}

	db := client.Database(os.Getenv("DB_NAME"))

	admin.SetupAdmin(db)

	server.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api.SetupRoutes(server, db, notificationClient)

	server.Run(":8082")

}
