package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load("skulpoint.env"); err != nil {
		log.Printf("Warning: Error loading .env file: %v", err)
	}

	// Check if RESEND_API_KEY is set
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		log.Fatal("❌ RESEND_API_KEY is not set in environment")
	}

	fmt.Println("✅ RESEND_API_KEY is set:", apiKey[:10]+"...")

	// Check domain configuration
	fmt.Println("\n📧 Email Configuration:")
	fmt.Println("   Sender: Boiboi Team <hello@useboiboi.com>")
	fmt.Println("   Domain: useboiboi.com")
	fmt.Println("   API Endpoint: https://api.resend.com/emails")

	fmt.Println("\n⚠️  IMPORTANT: Make sure you have:")
	fmt.Println("   1. Verified useboiboi.com domain in Resend dashboard")
	fmt.Println("   2. Added DNS records (SPF, DKIM, DMARC)")
	fmt.Println("   3. Waited for DNS propagation (5-10 minutes)")

	fmt.Println("\n🔗 Resend Dashboard: https://resend.com/domains")
	fmt.Println("\n✅ Configuration check complete!")
}
