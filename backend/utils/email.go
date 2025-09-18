package utils

import (
	_ "embed"
	"os"
	"strconv"
	"strings"
	"gopkg.in/gomail.v2"
)

//go:embed templates/otp_template.html
var otpTemplate string

func SendOtpMail(email *string, otp string) error {

	m := gomail.NewMessage()
	emailBody := strings.Replace(otpTemplate, "{{otp_code}}", otp, 1)

	m.SetHeader("From", "Boiboi Team<hey@tackstry.com>")
	m.SetHeader("To", *email)
	m.SetHeader("Subject", "Verify Your Account")
	m.SetBody("text/html", emailBody)

	d := gomail.NewDialer("mail.privateemail.com", 465, "hey@tackstry.com", os.Getenv("BOIBOI_MAIL_PASSWORD"))

	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil
}

//go:embed templates/wallet_topup.html
var walletTopupTemplate string

func SendWalletTopupMail(email *string, customerName *string, amount *float64, reference *string, balance *float64) error {

	m := gomail.NewMessage()

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

	m.SetHeader("From", "Boiboi Team<hey@tackstry.com>")
	m.SetHeader("To", *email)
	m.SetHeader("Subject", "Successful Wallet Topup")
	m.SetBody("text/html", result)

	d := gomail.NewDialer("mail.privateemail.com", 465, "hey@tackstry.com", os.Getenv("BOIBOI_MAIL_PASSWORD"))

	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil

}

//go:embed templates/failed_wallet_topup.html
var failedWalletTopupTemplate string

func SendFailedWalletTopupMail(email *string, customerName *string, amount *float64, reference *string) error {

	m := gomail.NewMessage()

	replacements := map[string]interface{}{
		"{{customer_name}}": *customerName,
		"{{amount}}":        strconv.FormatFloat(*amount/100, 'f', 2, 64),
		"{{reference}}":     *reference,
	}

	result := failedWalletTopupTemplate
	for placeholder, value := range replacements {
		result = strings.ReplaceAll(result, placeholder, value.(string))
	}

	m.SetHeader("From", "Boiboi Team<hey@tackstry.com>")
	m.SetHeader("To", *email)
	m.SetHeader("Subject", "Failed Wallet Topup")
	m.SetBody("text/html", result)

	d := gomail.NewDialer("mail.privateemail.com", 465, "hey@tackstry.com", os.Getenv("BOIBOI_MAIL_PASSWORD"))

	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil

}

//go:embed templates/welcome_template.html
var welcomeTemplate string

func SendWelcomeMail(email *string, firstName *string) error {

	m := gomail.NewMessage()
	emailBody := strings.Replace(welcomeTemplate, "{{user}}", *firstName, 1)

	m.SetHeader("From", "Boiboi Team<hey@tackstry.com>")
	m.SetHeader("To", *email)
	m.SetHeader("Subject", "Welcome to Boiboi!")
	m.SetBody("text/html", emailBody)

	d := gomail.NewDialer("mail.privateemail.com", 465, "hey@tackstry.com", os.Getenv("BOIBOI_MAIL_PASSWORD"))

	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil

}

//go:embed templates/welcome_merchant_template.html
var welcomeMerchantTemplate string

func SendMerchantWelcomeMail(email *string, firstName *string) error {

	m := gomail.NewMessage()
	emailBody := strings.Replace(welcomeMerchantTemplate, "{{user}}", *firstName, 1)

	m.SetHeader("From", "Boiboi Team<hey@tackstry.com>")
	m.SetHeader("To", *email)
	m.SetHeader("Subject", "Welcome to Boiboi!")
	m.SetBody("text/html", emailBody)

	d := gomail.NewDialer("mail.privateemail.com", 465, "hey@tackstry.com", os.Getenv("BOIBOI_MAIL_PASSWORD"))

	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil

}

//go:embed templates/welcome_rider.html
var welcomeRiderTemplate string

func SendRiderWelcomeMail(email *string, firstName *string) error {

	m := gomail.NewMessage()
	emailBody := strings.Replace(welcomeRiderTemplate, "{{user}}", *firstName, 1)

	m.SetHeader("From", "Boiboi Team<hey@tackstry.com>")
	m.SetHeader("To", *email)
	m.SetHeader("Subject", "Welcome to Boiboi!")
	m.SetBody("text/html", emailBody)

	d := gomail.NewDialer("mail.privateemail.com", 465, "hey@tackstry.com", os.Getenv("BOIBOI_MAIL_PASSWORD"))

	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil

}



//go:embed templates/successful_withdrawal.html
var successfulWithdrawalTemplate string

func SendSuccessfulWithdrawalMail(email *string, customerName *string, amount *float64, reference *string) error {

	m := gomail.NewMessage()

	replacements := map[string]interface{}{
		"{{customer_name}}": *customerName,
		"{{amount}}":        strconv.FormatFloat(*amount/100, 'f', 2, 64),
		"{{reference}}":     *reference,
	}

	result := successfulWithdrawalTemplate
	for placeholder, value := range replacements {
		result = strings.ReplaceAll(result, placeholder, value.(string))
	}

	m.SetHeader("From", "Boiboi Team<hey@tackstry.com>")
	m.SetHeader("To", *email)
	m.SetHeader("Subject", "Successful Withdrawal")
	m.SetBody("text/html", result)

	d := gomail.NewDialer("mail.privateemail.com", 465, "hey@tackstry.com", os.Getenv("BOIBOI_MAIL_PASSWORD"))

	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil

}



//go:embed templates/failed_withdrawal.html
var failedWithdrawalTemplate string

func SendFailedWithdrawalMail(email *string, customerName *string, amount *float64, reference *string) error {

	m := gomail.NewMessage()

	replacements := map[string]interface{}{
		"{{customer_name}}": *customerName,
		"{{amount}}":        strconv.FormatFloat(*amount/100, 'f', 2, 64),
		"{{reference}}":     *reference,
	}

	result := failedWithdrawalTemplate
	for placeholder, value := range replacements {
		result = strings.ReplaceAll(result, placeholder, value.(string))
	}

	m.SetHeader("From", "Boiboi Team<hey@tackstry.com>")
	m.SetHeader("To", *email)
	m.SetHeader("Subject", "Failed Withdrawal")
	m.SetBody("text/html", result)

	d := gomail.NewDialer("mail.privateemail.com", 465, "hey@tackstry.com", os.Getenv("BOIBOI_MAIL_PASSWORD"))

	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil

}


//go:embed templates/forgot_password.html
var forgotPassowrdTemplate string

func SendForgotPasswordMail(email *string, firstName *string, link *string) error {
	
	m := gomail.NewMessage()
	emailBody := strings.Replace(forgotPassowrdTemplate, "{{user}}", *firstName, 1)
	emailBody = strings.Replace(emailBody, "{{reset_link}}", *link, 1)

	m.SetHeader("From", "Boiboi Team<hey@tackstry.com>")
	m.SetHeader("To", *email)
	m.SetHeader("Subject", "Password Reset")
	m.SetBody("text/html", emailBody)

	d := gomail.NewDialer("mail.privateemail.com", 465, "hey@tackstry.com", os.Getenv("BOIBOI_MAIL_PASSWORD"))

	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil

}
