package auth

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"useboi-boi/backend/api/payments"
	"useboi-boi/backend/internal/data"
	"useboi-boi/backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type GoogleTokenInfo struct {
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
	Sub           string `json:"sub"`
}

// GoogleAuth godoc
// @Summary Authenticate with Google
// @Description Sign in or sign up using Google OAuth token
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body map[string]string true "Google ID token"
// @Success 200 {object} map[string]interface{} "Login/Signup successful with JWT token and user data"
// @Failure 400 {object} data.Error "Bad request - invalid token or validation error"
// @Failure 500 {object} data.Error "Internal server error"
// @Router /auth/google [post]
func GoogleAuth(c *gin.Context, db *mongo.Database) {
	var requestBody struct {
		Token string `json:"token" binding:"required"`
		Type  string `json:"type"` // "base", "merchant", "rider" - optional, defaults to "base"
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token is required"})
		return
	}

	// Verify the Google token
	googleClientID := os.Getenv("GOOGLE_CLIENT_ID")
	if googleClientID == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Google authentication not configured"})
		return
	}

	// Verify token with Google
	tokenInfo, err := verifyGoogleToken(requestBody.Token)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Google token: " + err.Error()})
		return
	}

	if !tokenInfo.EmailVerified {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email not verified with Google"})
		return
	}

	userCollection := db.Collection(utils.USER)

	// Check if user exists
	var existingUser data.User
	err = userCollection.FindOne(c, bson.M{"email": tokenInfo.Email}).Decode(&existingUser)

	// Set default type to "base" if not provided
	userType := requestBody.Type
	if userType == "" {
		userType = "base"
	}

	// User exists - login
	if err == nil && len(existingUser.FirstName) > 0 {
		// Check if rider and not approved
		if existingUser.Type == "rider" && existingUser.Status != "active" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Rider account has not been approved. Contact Boiboi"})
			return
		}

		jwt, err := utils.GenerateJWT(existingUser.ID.Hex(), existingUser.Email)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"token": jwt,
			"user":  existingUser,
		})
		return
	}

	// User doesn't exist - create new account
	// Generate a random password for Google users (they won't use it)
	randomPassword := utils.GenerateRandomString("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 32)
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(randomPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	newUser := data.User{
		ID:          primitive.NewObjectID(),
		FirstName:   tokenInfo.GivenName,
		LastName:    tokenInfo.FamilyName,
		Email:       tokenInfo.Email,
		PhoneNumber: "", // Google doesn't provide phone number
		Password:    string(hashedPassword),
		Username:    "skul" + utils.GenerateRandomString("abcdefghijklmnopqrstuvwxyz", 4),
		Type:        userType,
	}

	session, err := db.Client().StartSession()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start session: " + err.Error()})
		return
	}
	defer session.EndSession(c)

	_, err = session.WithTransaction(c, func(sessCtx mongo.SessionContext) (interface{}, error) {
		_, err = userCollection.InsertOne(sessCtx, newUser)
		if err != nil {
			return nil, err
		}

		// Create virtual account for the user
		err = payments.CreateDedicatedVirtualAccount(c, &newUser)
		if err != nil {
			return nil, err
		}

		jwt, err := utils.GenerateJWT(newUser.ID.Hex(), newUser.Email)
		if err != nil {
			return nil, err
		}

		c.JSON(http.StatusOK, gin.H{"user": newUser, "token": jwt})
		return nil, nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user: " + err.Error()})
		return
	}

	// Send welcome email and get PayStack account asynchronously
	go func() {
		// Create a background context for async operations
		bgCtx := &gin.Context{}
		payments.GetUserPayStackAccount(bgCtx, db, &newUser.ID, &newUser.Email)
		utils.SendWelcomeMail(&newUser.Email, &newUser.FirstName)
	}()
}

// verifyGoogleToken verifies the Google ID token and returns user info
func verifyGoogleToken(token string) (*GoogleTokenInfo, error) {
	// Verify token with Google's tokeninfo endpoint
	url := fmt.Sprintf("https://oauth2.googleapis.com/tokeninfo?id_token=%s", token)

	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to verify token: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("invalid token: %s", string(body))
	}

	var tokenInfo GoogleTokenInfo
	if err := json.NewDecoder(resp.Body).Decode(&tokenInfo); err != nil {
		return nil, fmt.Errorf("failed to decode token info: %w", err)
	}

	return &tokenInfo, nil
}
