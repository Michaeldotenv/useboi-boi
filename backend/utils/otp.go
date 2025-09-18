package utils

import (
	"math/rand"
	"time"
)


func GenerateOTP(length int) string {
	rand.Seed(time.Now().UnixNano())

	charSet := "0123456789"
	otp := make([]byte, length)

	for i := range otp {
		otp[i] = charSet[rand.Intn(len(charSet))]
	}

	return string(otp)
}

