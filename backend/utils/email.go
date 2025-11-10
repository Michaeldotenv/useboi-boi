package utils

import (
	_ "embed"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
)

//go:embed templates/otp_template.html
var otpTemplate string

// sendResendEmail sends an email using the Resend API
func sendResendEmail(to, subject, htmlContent string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY not set")
	}

	payload := map[string]interface{}{
		"from":    "Boiboi Team <onboarding@resend.dev>",
		"to":      []string{to},
		"subject": subject,
		"html":    htmlContent,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal email payload: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		return fmt.Errorf("resend API error (status %d): %s", resp.StatusCode, string(body))
	}

	return nil
}

func SendOtpMail(email *string, otp string) error {
	emailBody := strings.Replace(otpTemplate, "{{otp_code}}", otp, 1)
	return sendResendEmail(*email, "Verify Your Account", emailBody)
}

//go:embed templates/wallet_topup.html
var walletTopupTemplate string

func SendWalletTopupMail(email *string, customerName *string, amount *float64, reference *string, balance *float64) error {
	replacements := map[string]interface{}{
		"{{customer_name}}": *customerName,
		"{{amount}}":        strconv.FormatFloat(*amount/100, 'f', 2, 64),
		"{{reference}}":     *reference,
		"{{balance}}":       strconv.FormatFloat(*balance, 'f', 2, 64),
	}

	result := walletTopupTemplate
	for placeholder, value := range replacements {
		result = strings.ReplaceAll(result, placeholder, value.(string))
	}

	return sendResendEmail(*email, "Successful Wallet Topup", result)
}

//go:embed templates/failed_wallet_topup.html
var failedWalletTopupTemplate string

func SendFailedWalletTopupMail(email *string, customerName *string, amount *float64, reference *string) error {
	replacements := map[string]interface{}{
		"{{customer_name}}": *customerName,
		"{{amount}}":        strconv.FormatFloat(*amount/100, 'f', 2, 64),
		"{{reference}}":     *reference,
	}

	result := failedWalletTopupTemplate
	for placeholder, value := range replacements {
		result = strings.ReplaceAll(result, placeholder, value.(string))
	}

	return sendResendEmail(*email, "Failed Wallet Topup", result)
}

//go:embed templates/welcome_template.html
var welcomeTemplate string

func SendWelcomeMail(email *string, firstName *string) error {
	emailBody := strings.Replace(welcomeTemplate, "{{user}}", *firstName, 1)
	return sendResendEmail(*email, "Welcome to Boiboi!", emailBody)
}

//go:embed templates/welcome_merchant_template.html
var welcomeMerchantTemplate string

func SendMerchantWelcomeMail(email *string, firstName *string) error {
	emailBody := strings.Replace(welcomeMerchantTemplate, "{{user}}", *firstName, 1)
	return sendResendEmail(*email, "Welcome to Boiboi!", emailBody)
}

//go:embed templates/welcome_rider.html
var welcomeRiderTemplate string

func SendRiderWelcomeMail(email *string, firstName *string) error {
	emailBody := strings.Replace(welcomeRiderTemplate, "{{user}}", *firstName, 1)
	return sendResendEmail(*email, "Welcome to Boiboi!", emailBody)
}



//go:embed templates/successful_withdrawal.html
var successfulWithdrawalTemplate string

func SendSuccessfulWithdrawalMail(email *string, customerName *string, amount *float64, reference *string) error {
	replacements := map[string]interface{}{
		"{{customer_name}}": *customerName,
		"{{amount}}":        strconv.FormatFloat(*amount/100, 'f', 2, 64),
		"{{reference}}":     *reference,
	}

	result := successfulWithdrawalTemplate
	for placeholder, value := range replacements {
		result = strings.ReplaceAll(result, placeholder, value.(string))
	}

	return sendResendEmail(*email, "Successful Withdrawal", result)
}



//go:embed templates/failed_withdrawal.html
var failedWithdrawalTemplate string

func SendFailedWithdrawalMail(email *string, customerName *string, amount *float64, reference *string) error {
	replacements := map[string]interface{}{
		"{{customer_name}}": *customerName,
		"{{amount}}":        strconv.FormatFloat(*amount/100, 'f', 2, 64),
		"{{reference}}":     *reference,
	}

	result := failedWithdrawalTemplate
	for placeholder, value := range replacements {
		result = strings.ReplaceAll(result, placeholder, value.(string))
	}

	return sendResendEmail(*email, "Failed Withdrawal", result)
}


//go:embed templates/forgot_password.html
var forgotPassowrdTemplate string

func SendForgotPasswordMail(email *string, firstName *string, link *string) error {
	emailBody := strings.Replace(forgotPassowrdTemplate, "{{user}}", *firstName, 1)
	emailBody = strings.Replace(emailBody, "{{reset_link}}", *link, 1)
	return sendResendEmail(*email, "Password Reset", emailBody)
}
