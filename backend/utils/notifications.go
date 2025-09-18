package utils

import (
	"context"
	"firebase.google.com/go/messaging"
	"golang.org/x/exp/slog"
)

func SendNotification(fcm *messaging.Client, message *messaging.Message, onFail func()) {
	_, err := fcm.Send(context.Background(), message)
	if err != nil {
		slog.Info("Error sending message: %v\n", err)

		onFail()
	}
}
