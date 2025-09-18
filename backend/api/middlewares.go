package api

import (
	"bytes"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"backend/internal/data"
	"backend/utils"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func doesUserExist(userId string, c *gin.Context, db *mongo.Database) bool {
	userCollection := db.Collection(utils.USER)

	id, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return false
	}
	userFilter := bson.M{"_id": id, "$or": []bson.M{
		{"status": "active"},
		{"status": ""},
		{"status": nil},
	}}
	result := userCollection.FindOne(c, userFilter)

	existingUser := data.User{}
	result.Decode(&existingUser)

	if len(existingUser.FirstName) > 1 {
		return true
	} else {
		return false
	}

}

var whitelistedIPs = []string{
	"52.31.139.75",
	"52.49.173.169",
	"52.214.14.220",
}

func PaystackWebhooktMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		clientIP := c.ClientIP()

		for _, allowedIP := range whitelistedIPs {
			if clientIP == allowedIP {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		c.Abort()
	}
}

func AdminMiddleware(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
			c.Abort()
			return
		}

		token, err := jwt.Parse(strings.TrimPrefix(authHeader, "Bearer "), func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("invalid signing method")
			}
			return []byte(os.Getenv("JWT_SIGNING_KEY")), nil
		})

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization error " + err.Error()})
			c.Abort()
			return
		}

		if !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			adminKey := claims["adminKey"].(string)

			adminCollection := db.Collection(utils.ADMIN_ACCOUNT)

			var dbAdmin data.AdminAccount
			if err := adminCollection.FindOne(c, bson.M{}).Decode(&dbAdmin); err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "No admin account found"})
				c.Abort()
				return
			}

			if adminKey == dbAdmin.Key {
				c.Next()
			} else {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authorized"})
				c.Abort()
				return
			}

		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func AuthMiddleware(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
			c.Abort()
			return
		}

		token, err := jwt.Parse(strings.TrimPrefix(authHeader, "Bearer "), func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("invalid signing method")
			}
			return []byte(os.Getenv("JWT_SIGNING_KEY")), nil
		})

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization error " + err.Error()})
			c.Abort()
			return
		}

		if !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			userId := claims["userId"].(string)

			if doesUserExist(userId, c, db) {
				c.Set("userEmail", claims["email"])
				c.Set("userId", claims["userId"])
				c.Next()
			} else {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authorized"})
				c.Abort()
				return
			}

		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		c.Next()
	}
}

type responseBodyWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w responseBodyWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

func LoggingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()

		writer := &responseBodyWriter{
			ResponseWriter: c.Writer,
			body:           bytes.NewBufferString(""),
		}
		c.Writer = writer

		c.Next()

		log.Printf("[GIN] | %s | %d | %v | %s | %s | %s\nResponse: %s",
			c.Request.Method,
			writer.Status(),
			time.Since(startTime),
			c.ClientIP(),
			c.Request.URL.Path,
			c.Request.UserAgent(),
			writer.body.String(),
		)
	}
}
