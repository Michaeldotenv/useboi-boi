package auth

import (
	"fmt"
	"net/http"
	"time"

	"backend/api/payments"
	"backend/internal/data"
	"backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

// Signup godoc
// @Summary Register a new user account
// @Description Register a new base user account with email verification via OTP
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body data.SignupRequest true "User registration details"
// @Success 200 {object} map[string]interface{} "OTP sent successfully"
// @Failure 400 {object} data.Error "Bad request - validation error or email already exists"
// @Failure 500 {object} data.Error "Internal server error"
// @Router /auth/signup [post]
func Signup(c *gin.Context, db *mongo.Database) {
	var signupRequest data.SignupRequest

	if err := c.ShouldBindJSON(&signupRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := utils.ValidateNotEmpty(signupRequest)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	otpCollection := db.Collection(utils.OTP)
	userCollection := db.Collection(utils.USER)

	filter := bson.M{
		"email": signupRequest.Email,
	}

	var existingUser data.User
	userCollection.FindOne(c, filter).Decode(&existingUser)

	if len(existingUser.FirstName) > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email associated with an existing account"})
		return
	}

	otpCode := utils.GenerateOTP(4)

	otp := data.OtpModel{
		Email:       signupRequest.Email,
		Code:        otpCode,
		FirstName:   signupRequest.FirstName,
		LastName:    signupRequest.LastName,
		Phone:       signupRequest.Phone,
		Password:    signupRequest.Password,
		TimeCreated: time.Now(),
	}

	_, err = otpCollection.InsertOne(c, otp)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = utils.SendOtpMail(&signupRequest.Email, otpCode)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "OTP code sent to email address"})

}

// MerchantSignup godoc
// @Summary Register a new merchant account
// @Description Register a new merchant account with store information and email verification via OTP
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body data.MerchantSignupRequest true "Merchant registration details including store information"
// @Success 200 {object} map[string]interface{} "OTP sent successfully"
// @Failure 400 {object} data.Error "Bad request - validation error or email already exists"
// @Failure 500 {object} data.Error "Internal server error"
// @Router /auth/merchantSignup [post]
func MerchantSignup(c *gin.Context, db *mongo.Database) {
	var signupRequest data.MerchantSignupRequest

	if err := c.ShouldBindJSON(&signupRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error binding JSON" + err.Error()})
		return
	}

	err := utils.ValidateNotEmpty(signupRequest)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Incomplete body" + err.Error()})
		return
	}

	otpCollection := db.Collection(utils.OTP)
	userCollection := db.Collection(utils.USER)

	filter := bson.M{
		"email": signupRequest.Email,
	}

	var existingUser data.User
	userCollection.FindOne(c, filter).Decode(&existingUser)

	if len(existingUser.FirstName) > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email associated with an existing account"})
		return
	}

	otpCode := utils.GenerateOTP(4)

	baseOtp := data.OtpModel{
		Email:       signupRequest.Email,
		Code:        otpCode,
		FirstName:   signupRequest.FirstName,
		LastName:    signupRequest.LastName,
		Phone:       signupRequest.Phone,
		Password:    signupRequest.Password,
		TimeCreated: time.Now(),
	}

	otp := data.MerchantOtpModel{
		OtpModel:         baseOtp,
		NameOfStore:      signupRequest.NameOfStore,
		StoreDescription: signupRequest.StoreDescription,
	}

	_, err = otpCollection.InsertOne(c, otp)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error creating user " + err.Error()})
		return
	}

	err = utils.SendOtpMail(&signupRequest.Email, otpCode)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error sending Otp mail" + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "OTP code sent to email address"})

}

// RiderSignup godoc
// @Summary Register a new rider account
// @Description Register a new rider account with delivery service code and email verification via OTP
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body data.RiderSignupRequest true "Rider registration details including delivery service code"
// @Success 200 {object} map[string]interface{} "OTP sent successfully"
// @Failure 400 {object} data.Error "Bad request - validation error or email already exists"
// @Failure 500 {object} data.Error "Internal server error"
// @Router /auth/riderSignup [post]
func RiderSignup(c *gin.Context, db *mongo.Database) {
	var signupRequest data.RiderSignupRequest

	if err := c.ShouldBindJSON(&signupRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error binding JSON" + err.Error()})
		return
	}

	err := utils.ValidateNotEmpty(signupRequest)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Incomplete body" + err.Error()})
		return
	}

	otpCollection := db.Collection(utils.OTP)
	userCollection := db.Collection(utils.USER)

	filter := bson.M{
		"email": signupRequest.Email,
	}

	var existingUser data.User
	userCollection.FindOne(c, filter).Decode(&existingUser)

	if len(existingUser.FirstName) > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email associated with an existing account"})
		return
	}

	otpCode := utils.GenerateOTP(4)

	baseOtp := data.OtpModel{
		Email:       signupRequest.Email,
		Code:        otpCode,
		FirstName:   signupRequest.FirstName,
		LastName:    signupRequest.LastName,
		Phone:       signupRequest.Phone,
		Password:    signupRequest.Password,
		TimeCreated: time.Now(),
	}

	otp := data.RiderOtpModel{
		OtpModel:            baseOtp,
		DeliveryServiceCode: signupRequest.DeliveryServiceCode,
	}

	_, err = otpCollection.InsertOne(c, otp)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error creating user " + err.Error()})
		return
	}

	err = utils.SendOtpMail(&signupRequest.Email, otpCode)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error sending Otp mail" + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "OTP code sent to email address"})

}

// VerifySignup godoc
// @Summary Verify user signup with OTP
// @Description Verify the OTP code sent to user's email and complete the registration process
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body data.OtpRequest true "OTP verification details"
// @Success 200 {object} map[string]interface{} "User created successfully with JWT token"
// @Failure 400 {object} data.Error "Bad request - invalid OTP or validation error"
// @Failure 500 {object} data.Error "Internal server error"
// @Router /auth/verifySignup [post]
func VerifySignup(c *gin.Context, db *mongo.Database) {
	var otpRequest data.OtpRequest

	if err := c.ShouldBindJSON(&otpRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	otpCollection := db.Collection(utils.OTP)

	otpFilter := bson.M{
		"email": otpRequest.Email,
		"code":  otpRequest.Code,
	}

	result := otpCollection.FindOne(c, otpFilter)

	var otpModel data.OtpModel
	result.Decode(&otpModel)

	if !otpModel.IsOTPValid(otpRequest.Code, &otpModel) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid otp"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(otpModel.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	newUser := data.User{
		ID:          primitive.NewObjectID(),
		FirstName:   otpModel.FirstName,
		LastName:    otpModel.LastName,
		Email:       otpModel.Email,
		PhoneNumber: otpModel.Phone,
		Password:    string(hashedPassword),
		Username:    "skul" + utils.GenerateRandomString("abcdefghijklmnopqrstuvwxyz", 4),
		Type:        "base",
	}

	userCollection := db.Collection(utils.USER)

	session, err := db.Client().StartSession()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start session: " + err.Error()})
		return
	}
	defer session.EndSession(c)

	_, err = session.WithTransaction(c, func(sessCtx mongo.SessionContext) (interface{}, error) {

		_, err = userCollection.InsertOne(sessCtx, newUser)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return nil, err
		}

		err = payments.CreateDedicatedVirtualAccount(c, &newUser)
		if err != nil {
			return nil, err
		}

		jwt, err := utils.GenerateJWT(newUser.ID.Hex(), newUser.Email)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return nil, err
		}

		c.JSON(http.StatusOK, gin.H{"user": newUser, "token": jwt})

		return nil, nil
	})

	if err != nil {
		return
	}

	payments.GetUserPayStackAccount(c, db, &newUser.ID, &newUser.Email)

	err = utils.SendWelcomeMail(&newUser.Email, &newUser.FirstName)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	deleteFilter := bson.M{
		"email": otpModel.Email,
		"code":  otpModel.Code,
	}

	_, err = otpCollection.DeleteOne(c, deleteFilter)
	if err != nil {
		fmt.Println("error deleting otp user -> ", err.Error())
	}

	// payments.GetUserPayStackAccount(c, db, &newUser.ID, &newUser.Email)

}

// VerifyMerchantSignup godoc
// @Summary Verify merchant signup with OTP
// @Description Verify the OTP code sent to merchant's email and complete the registration process including store creation
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body data.OtpRequest true "OTP verification details"
// @Success 200 {object} map[string]interface{} "Merchant and store created successfully with JWT token"
// @Failure 400 {object} data.Error "Bad request - invalid OTP or validation error"
// @Failure 500 {object} data.Error "Internal server error"
// @Router /auth/verifyMerchantSignup [post]
func VerifyMerchantSignup(c *gin.Context, db *mongo.Database) {
	var otpRequest data.OtpRequest

	if err := c.ShouldBindJSON(&otpRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	otpCollection := db.Collection(utils.OTP)

	otpFilter := bson.M{
		"email": otpRequest.Email,
		"code":  otpRequest.Code,
	}

	result := otpCollection.FindOne(c, otpFilter)

	var merchantOtpModel data.MerchantOtpModel
	result.Decode(&merchantOtpModel)

	if !merchantOtpModel.IsOTPValid(otpRequest.Code, &merchantOtpModel.OtpModel) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid otp"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(merchantOtpModel.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	newStore := data.Store{
		ID:          primitive.NewObjectID(),
		Status:      "pending",
		Name:        merchantOtpModel.NameOfStore,
		Description: merchantOtpModel.StoreDescription,
	}

	newUser := data.User{
		ID:          primitive.NewObjectID(),
		FirstName:   merchantOtpModel.FirstName,
		LastName:    merchantOtpModel.LastName,
		Email:       merchantOtpModel.Email,
		PhoneNumber: merchantOtpModel.Phone,
		Password:    string(hashedPassword),
		Username:    "skul" + utils.GenerateRandomString("abcdefghijklmnopqrstuvwxyz", 4),
		Type:        "merchant",
		StoreId:     &newStore.ID,
	}

	userCollection := db.Collection(utils.USER)
	storeCollection := db.Collection(utils.STORE)

	session, err := db.Client().StartSession()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start session: " + err.Error()})
		return
	}
	defer session.EndSession(c)

	_, err = session.WithTransaction(c, func(sessCtx mongo.SessionContext) (interface{}, error) {

		_, err = userCollection.InsertOne(sessCtx, newUser)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return nil, err
		}

		err = payments.CreateDedicatedVirtualAccount(c, &newUser)
		if err != nil {
			return nil, err
		}

		jwt, err := utils.GenerateJWT(newUser.ID.Hex(), newUser.Email)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return nil, err
		}

		_, err = storeCollection.InsertOne(sessCtx, newStore)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Error creating store" + err.Error()})
			return nil, err
		}

		c.JSON(http.StatusOK, gin.H{"user": newUser, "token": jwt})

		return nil, nil
	})

	if err != nil {
		return
	}

	payments.GetUserPayStackAccount(c, db, &newUser.ID, &newUser.Email)

	err = utils.SendMerchantWelcomeMail(&newUser.Email, &newUser.FirstName)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	deleteFilter := bson.M{
		"email": merchantOtpModel.Email,
		"code":  merchantOtpModel.Code,
	}

	_, err = otpCollection.DeleteOne(c, deleteFilter)
	if err != nil {
		fmt.Println("error deleting otp user -> ", err.Error())
	}

}

// VerifyRiderSignup godoc
// @Summary Verify rider signup with OTP
// @Description Verify the OTP code sent to rider's email and complete the registration process
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body data.OtpRequest true "OTP verification details"
// @Success 200 {object} map[string]interface{} "Rider created successfully with JWT token or pending status"
// @Failure 400 {object} data.Error "Bad request - invalid OTP or validation error"
// @Failure 500 {object} data.Error "Internal server error"
// @Router /auth/verifyRiderSignup [post]
func VerifyRiderSignup(c *gin.Context, db *mongo.Database) {
	var otpRequest data.OtpRequest

	if err := c.ShouldBindJSON(&otpRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	otpCollection := db.Collection(utils.OTP)

	otpFilter := bson.M{
		"email": otpRequest.Email,
		"code":  otpRequest.Code,
	}

	result := otpCollection.FindOne(c, otpFilter)

	var riderOtpModel data.RiderOtpModel
	result.Decode(&riderOtpModel)

	if !riderOtpModel.IsOTPValid(otpRequest.Code, &riderOtpModel.OtpModel) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid otp"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(riderOtpModel.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	var deliveryService data.DeliveryService

	deliveryServiceCollection := db.Collection(utils.DELIVERY_SERVICE)

	if err := deliveryServiceCollection.FindOne(c, bson.M{"signupCode": riderOtpModel.DeliveryServiceCode}).Decode(&deliveryService); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "no delivery service found with this code"})
		return
	}

	newUser := data.User{
		ID:              primitive.NewObjectID(),
		FirstName:       riderOtpModel.FirstName,
		LastName:        riderOtpModel.LastName,
		Email:           riderOtpModel.Email,
		PhoneNumber:     riderOtpModel.Phone,
		Status:          "pending",
		Password:        string(hashedPassword),
		Username:        "skul" + utils.GenerateRandomString("abcdefghijklmnopqrstuvwxyz", 4),
		Type:            "rider",
		DeliveryService: &deliveryService.ID,
	}

	userCollection := db.Collection(utils.USER)

	session, err := db.Client().StartSession()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start session: " + err.Error()})
		return
	}
	defer session.EndSession(c)

	_, err = session.WithTransaction(c, func(sessCtx mongo.SessionContext) (interface{}, error) {

		_, err = userCollection.InsertOne(sessCtx, newUser)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return nil, err
		}

		if riderOtpModel.DeliveryServiceCode == "BBP2P" {
			c.JSON(http.StatusOK, gin.H{"status": "pending"})
		} else {
			jwt, err := utils.GenerateJWT(newUser.ID.Hex(), newUser.Email)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return nil, err
			}
			c.JSON(http.StatusOK, gin.H{"user": newUser, "token": jwt})
		}

		return nil, nil
	})

	if err != nil {
		return
	}

	err = utils.SendRiderWelcomeMail(&newUser.Email, &newUser.FirstName)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	deleteFilter := bson.M{
		"email": riderOtpModel.Email,
		"code":  riderOtpModel.Code,
	}

	_, err = otpCollection.DeleteOne(c, deleteFilter)
	if err != nil {
		fmt.Println("error deleting otp user -> ", err.Error())
	}

}

// Login godoc
// @Summary User login
// @Description Authenticate user with email and password, return JWT token
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body data.LoginRequest true "Login credentials"
// @Success 200 {object} map[string]interface{} "Login successful with JWT token and user data"
// @Failure 400 {object} data.Error "Bad request - invalid credentials or rider not approved"
// @Failure 500 {object} data.Error "Internal server error"
// @Router /auth/login [post]
func Login(c *gin.Context, db *mongo.Database) {
	var loginRequest data.LoginRequest

	if err := c.ShouldBindJSON(&loginRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userCollection := db.Collection(utils.USER)

	userFilter := bson.M{
		"email": loginRequest.Email,
	}

	var user data.User

	userCollection.FindOne(c, userFilter).Decode(&user)

	if len(user.FirstName) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No user associated with email address"})
		return
	}

	if user.Type == "rider" && user.Status != "active" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Rider account has not been approved. Contact Boiboi"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginRequest.Password)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Incorrect Password"})
		return
	}

	jwt, err := utils.GenerateJWT(user.ID.Hex(), user.Email)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": jwt, "user": user})

}

// EmailRequest represents the request body for forgot password
type EmailRequest struct {
	Email string `json:"email" example:"user@example.com"`
}

// ForgotPassword godoc
// @Summary Request password reset
// @Description Send password reset link to user's email address
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body EmailRequest true "Email address for password reset"
// @Success 200 {object} map[string]interface{} "Password reset email sent successfully"
// @Failure 400 {object} data.Error "Bad request - invalid email format"
// @Failure 500 {object} data.Error "Internal server error - user not found or email sending failed"
// @Router /auth/forgotPassword [post]
func ForgotPassword(c *gin.Context, db *mongo.Database) {

	var email EmailRequest

	if err := c.ShouldBindJSON(&email); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid email. " + err.Error()})
		return
	}

	userCollection := db.Collection(utils.USER)

	var user data.User
	if err := userCollection.FindOne(c, bson.M{"email": email.Email}).Decode(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch associated user"})
		return
	}

	resetCollection := db.Collection(utils.RESET_PASSWORD_TOKEN)

	resetToken := data.ResetPasswordToken{
		ID:    primitive.NewObjectID(),
		Email: email.Email,
		Token: utils.GenerateRandomString("abcdefghijklmnopqrstuvwxyz", 5),
	}

	_, err := resetCollection.InsertOne(c, resetToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate reset token. " + err.Error()})
		return
	}

	link := "https://accounts.useboiboi.com/reset-password" + "?email=" + email.Email + "&token=" + resetToken.Token

	utils.SendForgotPasswordMail(&email.Email, &user.FirstName, &link)

	c.JSON(http.StatusOK, gin.H{"message": "email sent to email"})
}

// ResetRequest represents the request body for password reset
type ResetRequest struct {
	Email    string `json:"email" example:"user@example.com"`
	Token    string `json:"token" example:"abc123"`
	Password string `json:"password" example:"newPassword123"`
}

// ResetPassword godoc
// @Summary Reset user password
// @Description Reset user password using email and reset token
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body ResetRequest true "Password reset details"
// @Success 200 {object} map[string]interface{} "Password reset successful"
// @Failure 400 {object} data.Error "Bad request - invalid request format"
// @Failure 500 {object} data.Error "Internal server error - invalid token or user not found"
// @Router /auth/resetPassword [post]
func ResetPassword(c *gin.Context, db *mongo.Database) {

	var request ResetRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request. " + err.Error()})
		return
	}

	resetCollection := db.Collection(utils.RESET_PASSWORD_TOKEN)

	var savedResetToken data.ResetPasswordToken
	if err := resetCollection.FindOne(c, bson.M{"email": request.Email, "token": request.Token}).Decode(&savedResetToken); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "no matching reset token. " + err.Error()})
		return
	}

	userCollection := db.Collection(utils.USER)

	var user data.User
	if err := userCollection.FindOne(c, bson.M{"email": request.Email}).Decode(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "no associated user account"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user.Password = string(hashedPassword)

	_, err = userCollection.UpdateOne(c, bson.M{"_id": user.ID}, bson.M{"$set": bson.M{"password": user.Password}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	resetCollection.DeleteOne(c, bson.M{"email": request.Email, "token": request.Token})

	c.JSON(http.StatusOK, gin.H{"message": "successful"})

}
