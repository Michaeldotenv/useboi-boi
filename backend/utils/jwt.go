package utils

import (
	"os"
	"time"
	"github.com/dgrijalva/jwt-go"
)

func GenerateJWT(userId string, email string) (string, error) {

	signingKey := os.Getenv("JWT_SIGNING_KEY")

	claims := jwt.MapClaims{
		"userId": userId,
		"email":  email,
		"uid":    userId,
		"sub":    userId,
		"iss":    "urn:skulpoint:issuer",
		"aud":    "urn:skulpoint:auth",
		"iat":    time.Now().Unix(),                       
		"exp":    time.Now().Add(time.Hour * 8760).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(signingKey))

	return tokenString, err
}